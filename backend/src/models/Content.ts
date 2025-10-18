import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IContent {
  title: string;
  level: 1 | 2 | 3;
  document: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentDocument extends IContent, MongooseDocument {}

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
      enum: [1, 2, 3],
      default: 1,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Связь с документом обязательна"],
    },
    order: {
      type: Number,
      required: [true, "Порядок раздела обязателен"],
      default: 0,
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
  this["updatedAt"] = new Date();
};

// Статический метод для поиска разделов документа
contentSchema.statics["findByDocument"] = function (
  documentId: string,
  options: any = {}
) {
  return this.find({ document: documentId })
    .sort(options.sort || { order: 1, createdAt: 1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Статический метод для поиска разделов по уровню
contentSchema.statics["findByLevel"] = function (
  documentId: string,
  level: 1 | 2 | 3
) {
  return this.find({ document: documentId, level });
};

const Content = mongoose.model<ContentDocument>("Content", contentSchema);

export default Content;
