import mongoose, { Schema, Document as MongooseDocument } from "mongoose";
import { ContentBlockType, IContentBlock } from "../types";

export interface BlockDocument extends IContentBlock, MongooseDocument {
  content: mongoose.Types.ObjectId;
  order: number;
}

const blockSchema = new Schema<BlockDocument>(
  {
    type: {
      type: String,
      required: [true, "Тип блока обязателен"],
      enum: Object.values(ContentBlockType),
      default: ContentBlockType.PARAGRAPH,
    },
    data: {
      type: String,
      required: [true, "Данные блока обязательны"],
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: [true, "Связь с разделом обязательна"],
    },
    order: {
      type: Number,
      required: [true, "Порядок блока обязателен"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
blockSchema.index({ content: 1, order: 1 });
blockSchema.index({ content: 1, type: 1 });

// Метод для обновления данных блока
blockSchema.methods["updateData"] = function (newData: string): void {
  this["data"] = newData;
};

// Метод для обновления порядка блока
blockSchema.methods["updateOrder"] = function (newOrder: number): void {
  this["order"] = newOrder;
};

// Статический метод для поиска блоков раздела
blockSchema.statics["findByContent"] = function (contentId: string) {
  return this.find({ content: contentId });
};

// Статический метод для поиска блоков по типу
blockSchema.statics["findByType"] = function (
  contentId: string,
  type: ContentBlockType
) {
  return this.find({ content: contentId, type });
};

const Block = mongoose.model<BlockDocument>("Block", blockSchema, "Blocks");

export default Block;
