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
import { FormatSettings } from "../config/formatSettings";
import { ContentBlockType, IContentBlock, IDocument } from "../types";

export enum HeadingLevel {
  HEADING_1= "Heading1",
  HEADING_2= "Heading2",
  HEADING_3= "Heading3",
  HEADING_4= "Heading4",
  HEADING_5= "Heading5",
  HEADING_6= "Heading6",
  TITLE= "Title",
}

export class ConverterService {
  // Создание DOCX документа
  public async createDocxDocument(docData: IDocument): Promise<Buffer> {
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
            headingSettings = FormatSettings.heading1;
            break;
          case 2:
            headingLevel = HeadingLevel.HEADING_2;
            headingSettings = FormatSettings.heading2;
            break;
          case 3:
            headingLevel = HeadingLevel.HEADING_3;
            headingSettings = FormatSettings.heading3;
            break;
          default:
            headingLevel = HeadingLevel.HEADING_1;
            headingSettings = FormatSettings.heading1;
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
          await this.processContentBlock(block, children);
        }
      }

      // Создаем документ
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: FormatSettings.margins.top,
                  bottom: FormatSettings.margins.bottom,
                  left: FormatSettings.margins.left,
                  right: FormatSettings.margins.right,
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
    children: any[]
  ): Promise<void> {
    switch (block.type) {
      case ContentBlockType.PARAGRAPH:
        children.push(this.createParagraph(block.data));
        break;

      case ContentBlockType.IMAGE:
        // Для изображений предполагается, что data содержит base64 или путь
        await this.processImage(block.data, children);
        break;

      case ContentBlockType.TABLE:
        await this.processTable(block.data, children);
        break;

      case ContentBlockType.FORMULA:
        children.push(this.createFormula(block.data));
        break;

      default:
        children.push(this.createParagraph(block.data));
    }
  }

  private createParagraph(text: string): Paragraph {
    return new Paragraph({
      alignment:
        FormatSettings.body.alignment === "justify"
          ? AlignmentType.JUSTIFIED
          : AlignmentType.LEFT,
      spacing: {
        line: FormatSettings.body.spacing.line,
      },
      children: [
        new TextRun({
          text: text,
          size: FormatSettings.body.fontSize * 2,
          font: FormatSettings.body.fontFamily,
        }),
      ],
    });
  }

  private async processImage(
    imageData: string,
    children: any[]
  ): Promise<void> {
    try {
      // Предполагаем, что imageData содержит base64 строку
      // или путь к файлу. В реальном приложении нужно обработать оба случая
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 400,
                height: 300,
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

  private async processTable(
    tableData: string,
    children: any[]
  ): Promise<void> {
    try {
      // Предполагаем, что tableData содержит JSON с данными таблицы
      const tableJson = JSON.parse(tableData);
      const rows = tableJson.rows || [];

      const tableRows = rows.map((row: any[], rowIndex: number) => {
        const tableCells = row.map((cell: any) => {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(cell || ""),
                    size: FormatSettings.body.fontSize * 2,
                    font: FormatSettings.body.fontFamily,
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

  private createFormula(formulaData: string): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: formulaData,
          size: FormatSettings.body.fontSize * 2,
          font: FormatSettings.body.fontFamily,
          italics: true,
        }),
      ],
    });
  }
}
