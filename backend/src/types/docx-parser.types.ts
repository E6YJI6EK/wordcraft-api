export interface WordParagraph {
  "w:pPr"?: {
    "w:pStyle"?: {
      "@_w:val"?: string;
    };
  };
  "w:r"?: WordRun | WordRun[];
}

export interface WordRun {
  "w:t"?: string;
}

export interface WordBody {
  [key: string]: any; // Разрешаем любые свойства
}

export interface WordDocument {
  "w:document": {
    "w:body": WordBody;
  };
}
