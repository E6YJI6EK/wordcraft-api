import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
// import { DEFAULT_FORMAT_SETTINGS } from "../config/formatSettings";
import {
  ContentBlockType,
  DocumentContentLevel,
  IContentBlock,
  IDocumentContent,
  IDocumentSettings,
  TextAlignment,
} from "../types";

export interface IDocumentWithContents {
  title: string;
  contents: IDocumentContent[];
}

export enum HeadingLevel {
  HEADING_1 = "Heading1",
  HEADING_2 = "Heading2",
  HEADING_3 = "Heading3",
  HEADING_4 = "Heading4",
  HEADING_5 = "Heading5",
  HEADING_6 = "Heading6",
  TITLE = "Title",
}

export class ConverterService {
  /**
   * Санитизирует HTML, оставляя только безопасные теги для Word документов
   */
  private sanitizeHtml(html: string): string {
    // Разрешенные теги для Word документов
    const allowedTags = [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "br",
      "table",
      "tr",
      "td",
      "th",
      "thead",
      "tbody",
      "tfoot",
      "ul",
      "ol",
      "li",
      "img",
      "span",
      "div",
    ];

    // Разрешенные атрибуты
    const allowedAttributes: Record<string, string[]> = {
      img: ["src", "alt", "width", "height"],
      table: ["border", "cellpadding", "cellspacing"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      span: ["style"],
      div: ["style"],
    };

    // Удаляем скрипты и опасные теги
    let sanitized = html
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "") // Удаляем обработчики событий
      .replace(/on\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, ""); // Удаляем javascript: протоколы

    // Удаляем неразрешенные теги, оставляя их содержимое
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (!allowedTags.includes(lowerTag)) {
        return ""; // Удаляем неразрешенный тег
      }

      // Очищаем атрибуты
      const attrRegex = /(\w+)=["']([^"']*)["']/gi;
      let cleanedMatch = match.replace(attrRegex, (attrMatch, attrName, attrValue) => {
        const allowedAttrs = allowedAttributes[lowerTag] || [];
        if (allowedAttrs.includes(attrName.toLowerCase())) {
          // Дополнительная проверка для src атрибутов
          if (attrName.toLowerCase() === "src") {
            // Разрешаем только data: и безопасные протоколы
            if (
              attrValue.startsWith("data:") ||
              attrValue.startsWith("http://") ||
              attrValue.startsWith("https://")
            ) {
              return attrMatch;
            }
            return "";
          }
          return attrMatch;
        }
        return "";
      });

      return cleanedMatch;
    });

    return sanitized;
  }

  /**
   * Определяет тип контента по HTML тегам (из DocxParserService)
   */
  private detectContentType(htmlElement: string): ContentBlockType {
    const lowerHtml = htmlElement.toLowerCase();

    if (lowerHtml.includes("<img") || lowerHtml.includes("<picture")) {
      return ContentBlockType.IMAGE;
    } else if (
      lowerHtml.includes("<table") ||
      lowerHtml.includes("<tr") ||
      lowerHtml.includes("<td")
    ) {
      return ContentBlockType.TABLE;
    } else if (
      lowerHtml.includes("<math") ||
      lowerHtml.includes("equation") ||
      lowerHtml.includes("formula")
    ) {
      return ContentBlockType.FORMULA;
    } else if (lowerHtml.includes("<ul") || (lowerHtml.includes("<li") && !lowerHtml.includes("<ol"))) {
      return ContentBlockType.UNORDERED_LIST;
    } else if (lowerHtml.includes("<ol") || (lowerHtml.includes("<li") && lowerHtml.includes("<ol"))) {
      return ContentBlockType.ORDERED_LIST;
    }

    return ContentBlockType.PARAGRAPH;
  }

  /**
   * Парсит HTML разметку из Word документа в структурированные данные
   */
  public parseHtmlFromWord(html: string): IDocumentWithContents {
    // Сначала санитизируем HTML
    const sanitizedHtml = this.sanitizeHtml(html);

    // Извлекаем заголовок документа
    const title = this.extractTitleFromHtml(sanitizedHtml);

    // Парсим HTML в структурированные разделы
    const contents = this.parseHtmlToContent(sanitizedHtml);

    return {
      title,
      contents,
    };
  }

  /**
   * Извлекает заголовок документа из HTML
   */
  private extractTitleFromHtml(html: string): string {
    // Ищем первый заголовок в HTML
    const titleMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    if (titleMatch && titleMatch[1]) {
      return this.stripHtmlTags(titleMatch[1]).trim();
    }

    // Ищем title в метаданных
    const metaTitleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (metaTitleMatch && metaTitleMatch[1]) {
      return this.stripHtmlTags(metaTitleMatch[1]).trim();
    }

    return "Untitled Document";
  }

  /**
   * Удаляет HTML теги из текста
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }

  /**
   * Парсит HTML в структурированные разделы документа
   */
  private parseHtmlToContent(html: string): IDocumentContent[] {
    const contents: IDocumentContent[] = [];

    // Разбиваем HTML на блоки по заголовкам
    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    let lastIndex = 0;
    let currentContent: IDocumentContent | null = null;

    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      // Если есть предыдущий контент, сохраняем его
      if (currentContent) {
        const contentBetween = html.substring(lastIndex, match.index);
        if (contentBetween.trim()) {
          const blocks = this.parseContentBlocks(contentBetween);
          currentContent.blocks.push(...blocks);
        }
        contents.push(currentContent);
      }

      const level = parseInt(match[1] || "1") as DocumentContentLevel;
      const titleText = this.stripHtmlTags(match[2] || "").trim();

      currentContent = {
        title: titleText || "Untitled Section",
        level,
        blocks: [],
      };

      lastIndex = match.index + match[0].length;
    }

    // Обрабатываем оставшийся контент после последнего заголовка
    if (currentContent) {
      const remainingContent = html.substring(lastIndex);
      if (remainingContent.trim()) {
        const blocks = this.parseContentBlocks(remainingContent);
        currentContent.blocks.push(...blocks);
      }
      contents.push(currentContent);
    }

    // Если нет заголовков, создаем один раздел с параграфом
    if (contents.length === 0) {
      const blocks = this.parseContentBlocks(html);
      contents.push({
        title: "Document Content",
        level: 1,
        blocks,
      });
    }

    return contents;
  }

  /**
   * Парсит HTML контент на отдельные блоки
   */
  private parseContentBlocks(
    html: string
  ): Array<{ type: ContentBlockType; data: string }> {
    const blocks: Array<{ type: ContentBlockType; data: string }> = [];

    // Разбиваем HTML на параграфы и другие элементы
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
    const tableRegex = /<table[^>]*>.*?<\/table>/gi;
    const imgRegex = /<img[^>]*>/gi;
    const ulRegex = /<ul[^>]*>.*?<\/ul>/gi;
    const olRegex = /<ol[^>]*>.*?<\/ol>/gi;

    const allMatches: Array<{
      match: RegExpExecArray;
      type: "paragraph" | "table" | "image" | "ordered_list" | "unordered_list";
    }> = [];

    // Собираем все совпадения
    let match;
    while ((match = paragraphRegex.exec(html)) !== null) {
      allMatches.push({ match, type: "paragraph" });
    }
    paragraphRegex.lastIndex = 0;

    while ((match = tableRegex.exec(html)) !== null) {
      allMatches.push({ match, type: "table" });
    }
    tableRegex.lastIndex = 0;

    while ((match = imgRegex.exec(html)) !== null) {
      allMatches.push({ match, type: "image" });
    }
    imgRegex.lastIndex = 0;

    while ((match = ulRegex.exec(html)) !== null) {
      allMatches.push({ match, type: "unordered_list" });
    }
    ulRegex.lastIndex = 0;

    while ((match = olRegex.exec(html)) !== null) {
      allMatches.push({ match, type: "ordered_list" });
    }
    olRegex.lastIndex = 0;

    // Сортируем по позиции в документе
    allMatches.sort((a, b) => a.match.index - b.match.index);

    // Обрабатываем каждый блок
    for (const { match, type } of allMatches) {
      const content = match[0];
      let blockType: ContentBlockType;

      // Определяем тип блока
      if (type === "table") {
        blockType = ContentBlockType.TABLE;
      } else if (type === "image") {
        blockType = ContentBlockType.IMAGE;
      } else if (type === "ordered_list") {
        blockType = ContentBlockType.ORDERED_LIST;
      } else if (type === "unordered_list") {
        blockType = ContentBlockType.UNORDERED_LIST;
      } else {
        // Для параграфов используем detectContentType для дополнительной проверки
        blockType = this.detectContentType(content);
      }

      blocks.push({
        type: blockType,
        data: content,
      });
    }

    // Если нет структурированного контента, обрабатываем как параграф
    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        type: ContentBlockType.PARAGRAPH,
        data: html.trim(),
      });
    }

    return blocks;
  }
  // Создание DOCX документа
  public async createDocxDocument(
    docData: IDocumentWithContents,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Promise<Buffer> {
    try {
      // Создаем массив для хранения всех элементов документа
      const children: any[] = [];
      // Обрабатываем содержимое документа
      for (const content of docData.contents) {
        // Добавляем заголовок раздела
        let headingLevel: HeadingLevel;
        let headingSettings: any;

        switch (content.level) {
          case 1:
            headingLevel = HeadingLevel.HEADING_1;
            headingSettings = DEFAULT_FORMAT_SETTINGS.heading1;
            break;
          case 2:
            headingLevel = HeadingLevel.HEADING_2;
            headingSettings = DEFAULT_FORMAT_SETTINGS.heading2;
            break;
          case 3:
            headingLevel = HeadingLevel.HEADING_3;
            headingSettings = DEFAULT_FORMAT_SETTINGS.heading3;
            break;
          default:
            headingLevel = HeadingLevel.HEADING_1;
            headingSettings = DEFAULT_FORMAT_SETTINGS.heading1;
        }

        children.push(
          new Paragraph({
            heading: headingLevel,
            alignment:
              headingSettings.alignment === "center"
                ? AlignmentType.CENTER
                : AlignmentType.LEFT,
            spacing: {
              before: headingSettings.spacing.before || 0,
              after: headingSettings.spacing.after || 0,
            },
            children: [
              new TextRun({
                text: content.title,
                bold: headingSettings.bold,
                size: headingSettings.fontSize * 2,
                font: headingSettings.fontFamily,
              }),
            ],
          })
        );

        // Обрабатываем блоки содержимого
        for (const block of content.blocks) {
          await this.processContentBlock(
            block,
            children,
            DEFAULT_FORMAT_SETTINGS
          );
        }
      }

      // Создаем документ
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: DEFAULT_FORMAT_SETTINGS.margins.top,
                  bottom: DEFAULT_FORMAT_SETTINGS.margins.bottom,
                  left: DEFAULT_FORMAT_SETTINGS.margins.left,
                  right: DEFAULT_FORMAT_SETTINGS.margins.right,
                },
              },
            },
            children: children,
          },
        ],
      });

      // Сохраняем документ
      return await Packer.toBuffer(doc);
    } catch (error) {
      console.error("Ошибка при создании документа:", error);
      throw error;
    }
  }

  private async processContentBlock(
    block: IContentBlock,
    children: any[],
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Promise<void> {
    switch (block.type) {
      case ContentBlockType.PARAGRAPH:
        children.push(
          this.createParagraphFromHtml(block.data, DEFAULT_FORMAT_SETTINGS)
        );
        break;

      case ContentBlockType.IMAGE:
        await this.processImageFromHtml(block.data, children);
        break;

      case ContentBlockType.TABLE:
        await this.processTableFromHtml(block.data, children, DEFAULT_FORMAT_SETTINGS);
        break;

      case ContentBlockType.FORMULA:
        children.push(this.createFormula(block.data, DEFAULT_FORMAT_SETTINGS));
        break;

      case ContentBlockType.ORDERED_LIST:
        children.push(
          ...this.createOrderedListFromHtml(block.data, DEFAULT_FORMAT_SETTINGS)
        );
        break;

      case ContentBlockType.UNORDERED_LIST:
        children.push(
          ...this.createUnorderedListFromHtml(block.data, DEFAULT_FORMAT_SETTINGS)
        );
        break;

      default:
        children.push(
          this.createParagraphFromHtml(block.data, DEFAULT_FORMAT_SETTINGS)
        );
    }
  }

  /**
   * Создает параграф из HTML, извлекая текст и форматирование
   */
  private createParagraphFromHtml(
    html: string,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Paragraph {
    // Извлекаем текст из HTML и создаем TextRun с форматированием
    const textRuns = this.parseTextRunsFromHtml(html, DEFAULT_FORMAT_SETTINGS);
    
    // Если нет текстовых элементов, используем очищенный текст
    if (textRuns.length === 0) {
      const plainText = this.stripHtmlTags(html).trim();
      if (!plainText) {
        // Пустой параграф
        return new Paragraph({
          spacing: {
            line: DEFAULT_FORMAT_SETTINGS.body.spacing.line ?? 0,
          },
        });
      }
      textRuns.push(
        new TextRun({
          text: plainText,
          size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
          font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
        })
      );
    }

    return new Paragraph({
      alignment:
        DEFAULT_FORMAT_SETTINGS.body.alignment === TextAlignment.JUSTIFY
          ? AlignmentType.JUSTIFIED
          : DEFAULT_FORMAT_SETTINGS.body.alignment === TextAlignment.CENTER
          ? AlignmentType.CENTER
          : DEFAULT_FORMAT_SETTINGS.body.alignment === TextAlignment.RIGHT
          ? AlignmentType.RIGHT
          : AlignmentType.LEFT,
      spacing: {
        line: DEFAULT_FORMAT_SETTINGS.body.spacing.line ?? 0,
      },
      children: textRuns,
    });
  }

  /**
   * Парсит HTML и создает массив TextRun с форматированием
   */
  private parseTextRunsFromHtml(
    html: string,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): TextRun[] {
    const textRuns: TextRun[] = [];
    
    // Простой парсер для основных тегов форматирования
    const text = this.stripHtmlTags(html).trim();
    if (!text) {
      return textRuns;
    }

    // Проверяем наличие форматирования
    const hasBold = /<(strong|b)[^>]*>/i.test(html);
    const hasItalic = /<(em|i)[^>]*>/i.test(html);
    const hasUnderline = /<u[^>]*>/i.test(html);

    const runOptions: any = {
      text: text,
      size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
      font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
      bold: hasBold,
      italics: hasItalic,
    };

    if (hasUnderline) {
      runOptions.underline = {};
    }

    textRuns.push(new TextRun(runOptions));

    return textRuns;
  }

  /**
   * Обрабатывает изображение из HTML тега
   */
  private async processImageFromHtml(
    htmlImage: string,
    children: any[]
  ): Promise<void> {
    try {
      // Извлекаем src из img тега
      const srcMatch = htmlImage.match(/src=["']([^"']+)["']/i);
      if (!srcMatch || !srcMatch[1]) {
        throw new Error("Image src not found");
      }

      const src = srcMatch[1];
      let imageBuffer: Buffer;

      if (src.startsWith("data:image/")) {
        // Base64 изображение
        const base64Data = src.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
      } else {
        // Внешний URL - в реальном приложении нужно загрузить изображение
        throw new Error("External image URLs not supported");
      }

      // Извлекаем размеры из атрибутов
      const widthMatch = htmlImage.match(/width=["'](\d+)["']/i);
      const heightMatch = htmlImage.match(/height=["'](\d+)["']/i);
      const width = widthMatch && widthMatch[1] ? parseInt(widthMatch[1]) : 400;
      const height = heightMatch && heightMatch[1] ? parseInt(heightMatch[1]) : 300;

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width,
                height,
              },
            }),
          ],
        })
      );
    } catch (error) {
      console.error("Ошибка при обработке изображения:", error);
      // Добавляем placeholder вместо изображения
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "[Изображение]",
              italics: true,
              color: "FF0000",
            }),
          ],
        })
      );
    }
  }

  /**
   * Обрабатывает таблицу из HTML
   */
  private async processTableFromHtml(
    htmlTable: string,
    children: any[],
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Promise<void> {
    try {
      // Парсим HTML таблицу
      const rows: string[][] = [];
      
      // Извлекаем все строки таблицы
      const trRegex = /<tr[^>]*>(.*?)<\/tr>/gi;
      let trMatch;
      
      while ((trMatch = trRegex.exec(htmlTable)) !== null) {
        const rowHtml = trMatch[1] || "";
        const cells: string[] = [];
        
        // Извлекаем все ячейки (td или th)
        const cellRegex = /<(td|th)[^>]*>(.*?)<\/(td|th)>/gi;
        let cellMatch;
        
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          const cellContent = cellMatch[2] ? this.stripHtmlTags(cellMatch[2]).trim() : "";
          cells.push(cellContent);
        }
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (rows.length === 0) {
        throw new Error("No rows found in table");
      }

      const tableRows = rows.map((row, rowIndex) => {
        const tableCells = row.map((cell) => {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cell || "",
                    size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
                    font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            shading: {
              fill: rowIndex === 0 ? "D3D3D3" : "auto", // Заголовок серый
              type: ShadingType.CLEAR,
            },
          });
        });

        return new TableRow({
          children: tableCells,
          tableHeader: rowIndex === 0, // Первая строка - заголовок
        });
      });

      children.push(
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: tableRows,
          borders: {
            top: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "auto",
            },
            bottom: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "auto",
            },
            left: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "auto",
            },
            right: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "auto",
            },
          },
        })
      );
    } catch (error) {
      console.error("Ошибка при обработке таблицы:", error);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "[Таблица]",
              italics: true,
              color: "FF0000",
            }),
          ],
        })
      );
    }
  }

  /**
   * Создает упорядоченный список из HTML
   */
  private createOrderedListFromHtml(
    htmlList: string,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Извлекаем все элементы списка
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let liMatch;
    let index = 1;
    
    while ((liMatch = liRegex.exec(htmlList)) !== null) {
      const itemContent = liMatch[1] || "";
      const text = this.stripHtmlTags(itemContent).trim();
      
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index}. ${text}`,
                size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
                font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
              }),
            ],
            spacing: {
              line: DEFAULT_FORMAT_SETTINGS.body.spacing.line ?? 0,
            },
          })
        );
        index++;
      }
    }
    
    return paragraphs;
  }

  /**
   * Создает неупорядоченный список из HTML
   */
  private createUnorderedListFromHtml(
    htmlList: string,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // Извлекаем все элементы списка
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let liMatch;
    
    while ((liMatch = liRegex.exec(htmlList)) !== null) {
      const itemContent = liMatch[1] || "";
      const text = this.stripHtmlTags(itemContent).trim();
      
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${text}`,
                size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
                font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
              }),
            ],
            spacing: {
              line: DEFAULT_FORMAT_SETTINGS.body.spacing.line ?? 0,
            },
          })
        );
      }
    }
    
    return paragraphs;
  }

  private createFormula(
    formulaData: string,
    DEFAULT_FORMAT_SETTINGS: IDocumentSettings
  ): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: formulaData,
          size: DEFAULT_FORMAT_SETTINGS.body.fontSize * 2,
          font: DEFAULT_FORMAT_SETTINGS.body.fontFamily,
          italics: true,
        }),
      ],
    });
  }
}
