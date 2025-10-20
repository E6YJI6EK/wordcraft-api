import mongoose, {
  Schema,
  Document as MongooseDocument,
  Types,
} from "mongoose";
import { DocumentLevel, IDocumentContent } from "../types";

export interface ContentDocument extends IDocumentContent, MongooseDocument {
  document: Types.ObjectId;
}

const contentSchema = new Schema<ContentDocument>({
  title: {
    type: String,
    required: [true, "Название раздела обязательно"],
    trim: true,
  },
  level: {
    type: Number,
    required: [true, "Уровень раздела обязателен"],
    enum: Object.values(DocumentLevel),
  },
  order: {
    type: Number,
    required: [true, "Порядок раздела обязателен"],
    min: 1,
    default: 1,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: [true, "Связь с документом обязательна"],
  },
});

// Индексы для быстрого поиска
contentSchema.index({ document: 1, order: 1 });
contentSchema.index({ document: 1, level: 1 });

// Виртуальное поле для получения блоков контента
contentSchema.virtual("blocks", {
  ref: "Block",
  localField: "_id",
  foreignField: "content",
});

// Метод для обновления порядка разделов
contentSchema.methods["updateOrder"] = function (newOrder: number): void {
  this["order"] = newOrder;
};

contentSchema.methods["updateLevel"] = function (
  newLevel: DocumentLevel
): void {
  this["level"] = newLevel;
};

// Статический метод для поиска разделов документа
contentSchema.statics["findByDocument"] = function (documentId: string) {
  return this.find({ document: documentId }).sort({ order: 1 });
};

// Статический метод для поиска разделов по уровню
contentSchema.statics["findByLevel"] = function (
  documentId: string,
  level: DocumentLevel
) {
  return this.find({ document: documentId, level });
};

const Content = mongoose.model<ContentDocument>("Content", contentSchema);

export default Content;
