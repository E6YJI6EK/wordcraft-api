import {
  DocumentSettings,
  IDocumentSettingsDocument,
} from "../models/DocumentSettings.js";
import { BaseSeeder } from "../shared/BaseSeeder.js";
import { TextAlignment } from "../types";

export class DocumentSettingsSeeder extends BaseSeeder<IDocumentSettingsDocument> {
  public model = DocumentSettings;
  public data: Partial<IDocumentSettingsDocument>[] = [
    {
      name: "Курсовая работа",
      title: {
        fontSize: 16,
        fontFamily: "Times New Roman",
        bold: true,
        alignment: TextAlignment.LEFT,
        spacing: { after: 300 },
      },
      heading1: {
        fontSize: 16,
        fontFamily: "Times New Roman",
        bold: true,
        alignment: TextAlignment.LEFT,
        spacing: { before: 300, after: 300 },
      },
      heading2: {
        fontSize: 14,
        fontFamily: "Times New Roman",
        bold: true,
        alignment: TextAlignment.LEFT,
        spacing: { before: 200, after: 200 },
      },
      heading3: {
        fontSize: 14,
        fontFamily: "Times New Roman",
        bold: true,
        alignment: TextAlignment.LEFT,
        spacing: { before: 150, after: 150 },
      },
      body: {
        fontSize: 14,
        fontFamily: "Times New Roman",
        bold: false,
        alignment: TextAlignment.JUSTIFY,
        spacing: { line: 360 },
      },
      margins: {
        top: 2000,
        bottom: 2000,
        left: 3000,
        right: 1500,
      },
    },
  ];
}
