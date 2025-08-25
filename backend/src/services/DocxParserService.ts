import { XMLParser } from "fast-xml-parser";
import * as fs from "fs/promises";
import * as JSZip from "jszip";
import { ContentBlockType, IDocument, IDocumentContent } from "../types";

export class DocxParserService {
  private async readFileAsBuffer(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  private detectContentType(element: any): ContentBlockType {
    if (!element || typeof element !== "object") {
      return ContentBlockType.PARAGRAPH;
    }

    const tagName = Object.keys(element)[0]?.toLowerCase() || "";

    if (tagName.includes("drawing") || tagName.includes("pic")) {
      return ContentBlockType.IMAGE;
    } else if (tagName.includes("tbl")) {
      return ContentBlockType.TABLE;
    } else if (tagName.includes("omath") || tagName.includes("equation")) {
      return ContentBlockType.FORMULA;
    }

    return ContentBlockType.PARAGRAPH;
  }

  private parseDocumentContent(docXml: string): IDocumentContent[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: false,
      alwaysCreateTextNode: false,
    });

    const parsed = parser.parse(docXml);
    const contents: IDocumentContent[] = [];

    if (!parsed["w:document"] || !parsed["w:document"]["w:body"]) {
      return contents;
    }

    const body = parsed["w:document"]["w:body"];
    let currentContent: IDocumentContent | null = null;

    // Проходим по всем элементам тела документа
    for (const [key, value] of Object.entries(body)) {
      // Обрабатываем заголовки
      if (key.startsWith("w:p") && value && typeof value === "object") {
        const pStyle = (value as any)["w:pPr"]?.["w:pStyle"];
        if (pStyle && pStyle["@_w:val"]) {
          const styleVal = pStyle["@_w:val"].toLowerCase();

          if (styleVal.includes("heading") || styleVal.includes("title")) {
            if (currentContent) {
              contents.push(currentContent);
            }

            const levelMatch = styleVal.match(/heading([1-3])/);
            const level = levelMatch
              ? (parseInt(levelMatch[1]) as 1 | 2 | 3)
              : 1;

            // Извлекаем текст из параграфа
            let titleText = "";
            if ((value as any)["w:r"] && Array.isArray((value as any)["w:r"])) {
              titleText = (value as any)["w:r"]
                .map((r: any) => r["w:t"] || "")
                .join(" ")
                .trim();
            }

            currentContent = {
              title: titleText || "Untitled Section",
              level,
              blocks: [],
            };
            continue;
          }
        }
      }

      // Добавляем контент к текущему разделу
      if (currentContent) {
        const type = this.detectContentType({ [key]: value });
        const data = JSON.stringify({ [key]: value }); // Сохраняем как JSON

        currentContent.blocks.push({
          type,
          data,
        });
      }
    }

    // Добавляем последний контент
    if (currentContent) {
      contents.push(currentContent);
    }

    return contents;
  }

  private extractTitle(docXml: string): string {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(docXml);

    // Пытаемся найти заголовок в свойствах документа
    try {
      const coreProperties = parsed["cp:coreProperties"];
      if (coreProperties && coreProperties["dc:title"]) {
        return coreProperties["dc:title"] || "Untitled Document";
      }
    } catch (error) {
      // Игнорируем ошибки парсинга свойств
    }

    // Или ищем первый заголовок в содержимом
    try {
      const body = parsed["w:document"]?.["w:body"];
      if (body) {
        for (const [key, value] of Object.entries(body)) {
          if (key.startsWith("w:p")) {
            const pStyle = (value as any)?.["w:pPr"]?.["w:pStyle"];
            if (
              pStyle &&
              pStyle["@_w:val"]?.toLowerCase().includes("heading")
            ) {
              let titleText = "";
              if (
                (value as any)["w:r"] &&
                Array.isArray((value as any)["w:r"])
              ) {
                titleText = (value as any)["w:r"]
                  .map((r: any) => r["w:t"] || "")
                  .join(" ")
                  .trim();
              }
              return titleText || "Untitled Document";
            }
          }
        }
      }
    } catch (error) {
      // Игнорируем ошибки парсинга содержимого
    }

    return "Untitled Document";
  }

  public async parseDocx(filePath: string): Promise<IDocument> {
    try {
      const buffer = await this.readFileAsBuffer(filePath);
      const zip = await JSZip.loadAsync(buffer);

      // Читаем основной документ
      const docXml = await zip.file("word/document.xml")?.async("text");
      if (!docXml) {
        throw new Error("Document content not found");
      }

      // Читаем свойства core.xml для получения заголовка
      let coreXml: string | undefined;
      try {
        coreXml = await zip.file("docProps/core.xml")?.async("text");
      } catch (error) {
        console.warn(
          "Core properties not found, using fallback title detection"
        );
      }

      const title = coreXml
        ? this.extractTitle(coreXml)
        : this.extractTitle(docXml);
      const contents = this.parseDocumentContent(docXml);

      return {
        title,
        contents,
      } as IDocument;
    } catch (error) {
      console.error("Error parsing DOCX file:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }
}
