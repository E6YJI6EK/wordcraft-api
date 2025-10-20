// Document types
export enum DocumentType {
  COURSEWORK = "coursework", // Курсовая работа
  QUALIFYING_WORK = "qualifying_work", // ВКР
}

export enum ContentBlockType {
  PARAGRAPH = "paragraph",
  IMAGE = "image",
  TABLE = "table",
  FORMULA = "formula",
  ORDERED_LIST = "ordered_list",
  UNORDERED_LIST = "unordered_list",
}

export enum DocumentLevel {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
}

export interface IContentBlock {
  type: ContentBlockType;
  image?: {
    url: string;
    width: number;
    height: number;
    order: number;
    name: string;
  };
  table?: {
    content: string;
    order: number;
    name: string;
  };
  formula?: {
    content: string;
    order: number;
    name: string;
  };
  textContent?: string;
  order: number;
}

export interface IDocumentContent {
  title: string;
  level: DocumentLevel;
  order: number;
  blocks: IContentBlock[];
}

export interface IDocumentFormatSettings {
  title: {
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    alignment: string;
    spacing: {
      after: number;
    };
  };
  heading1: {
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    alignment: string;
    spacing: {
      before: number;
      after: number;
    };
  };
  heading2: {
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    spacing: {
      before: number;
      after: number;
    };
  };
  heading3: {
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    spacing: {
      before: number;
      after: number;
    };
  };
  body: {
    fontSize: number;
    fontFamily: string;
    spacing: {
      line: number;
    };
    alignment: string;
  };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface IDocument {
  title: string;
  type: DocumentType;
  settings: IDocumentFormatSettings;
  contents: IDocumentContent[];
  originalFile?: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  };
}
