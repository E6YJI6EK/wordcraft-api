import mongoose, { Schema, Document as MongooseDocument } from "mongoose";
import { DocumentContentLevel, IDocumentContent } from "../types";

export interface ContentDocument extends IDocumentContent, MongooseDocument {
  document: mongoose.Types.ObjectId;
  order: number;
}

const contentSchema = new Schema<ContentDocument>(
  {
    title: {
      type: String,
      required: [true, "Название раздела обязательно"],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, "Уровень раздела обязателен"],
      enum: Object.values(DocumentContentLevel),
      default: DocumentContentLevel.FIRST,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Связь с документом обязательна"],
    },
    order: {
      type: Number,
      required: [true, "Порядок раздела обязателен"],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

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

// Статический метод для поиска разделов документа
contentSchema.statics["findByDocument"] = function (documentId: string) {
  return this.find({ document: documentId });
};

// Статический метод для поиска разделов по уровню
contentSchema.statics["findByLevel"] = function (
  documentId: string,
  level: DocumentContentLevel
) {
  return this.find({ document: documentId, level });
};

const Content = mongoose.model<ContentDocument>("Content", contentSchema);

export default Content;
