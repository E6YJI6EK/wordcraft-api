import mongoose, { Schema, Document as MongooseDocument } from "mongoose";
import { ContentBlockType } from "../types";

export interface IBlock {
  type: ContentBlockType;
  data: string;
  content: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockDocument extends IBlock, MongooseDocument {}

const blockSchema = new Schema<BlockDocument>(
  {
    type: {
      type: String,
      required: [true, "Тип блока обязателен"],
      enum: [
        ContentBlockType.PARAGRAPH,
        ContentBlockType.IMAGE,
        ContentBlockType.TABLE,
        ContentBlockType.FORMULA,
      ],
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

// Виртуальное поле для получения текстового содержимого (без HTML тегов)
blockSchema.virtual("textContent").get(function () {
  if (this.type === ContentBlockType.PARAGRAPH) {
    return this.data.replace(/<[^>]*>/g, "").trim();
  }
  return this.data;
});

// Метод для обновления данных блока
blockSchema.methods["updateData"] = function (newData: string): void {
  this["data"] = newData;
  this["updatedAt"] = new Date();
};

// Метод для обновления порядка блока
blockSchema.methods["updateOrder"] = function (newOrder: number): void {
  this["order"] = newOrder;
  this["updatedAt"] = new Date();
};

// Статический метод для поиска блоков раздела
blockSchema.statics["findByContent"] = function (
  contentId: string,
  options: any = {}
) {
  return this.find({ content: contentId })
    .sort(options.sort || { order: 1, createdAt: 1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Статический метод для поиска блоков по типу
blockSchema.statics["findByType"] = function (
  contentId: string,
  type: ContentBlockType
) {
  return this.find({ content: contentId, type });
};

// Статический метод для поиска всех изображений в документе
blockSchema.statics["findImagesByDocument"] = function (documentId: string) {
  return this.aggregate([
    {
      $lookup: {
        from: "contents",
        localField: "content",
        foreignField: "_id",
        as: "contentInfo",
      },
    },
    {
      $match: {
        "contentInfo.document": new mongoose.Types.ObjectId(documentId),
        type: ContentBlockType.IMAGE,
      },
    },
    {
      $sort: { order: 1 },
    },
  ]);
};

const Block = mongoose.model<BlockDocument>("Block", blockSchema);

export default Block;
