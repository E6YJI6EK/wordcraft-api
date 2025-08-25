import mongoose, { Schema, Document as MongooseDocument } from "mongoose";
import { ContentBlockType, IDocument } from "../types";

export interface DocumentDocument extends IDocument, MongooseDocument {}

const documentSchema = new Schema<DocumentDocument>(
  {
    title: {
      type: String,
      required: [true, "Название документа обязательно"],
      trim: true,
    },
    contents: {
      title: String,
      level: Number,
      blocks: [
        {
          type: String,
          enum: [
            ContentBlockType.PARAGRAPH,
            ContentBlockType.IMAGE,
            ContentBlockType.TABLE,
            ContentBlockType.FORMULA,
          ],
          data: String,
        },
      ],
    },
    metadata: {
      author: String,
      supervisor: String,
      department: String,
      year: Number,
      subject: String,
      keywords: [String],
    },
    originalFile: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ title: "text", "metadata.subject": "text" });

// Виртуальное поле для полного пути к файлу
documentSchema.virtual("fileUrl").get(function () {
  if (this.originalFile?.path) {
    return `/uploads/${this.originalFile.filename}`;
  }
  return null;
});

// Метод для обновления версии документа
documentSchema.methods["incrementVersion"] = function (): void {
  this["updatedAt"] = new Date();
};

// Статический метод для поиска документов пользователя
documentSchema.statics["findByUser"] = function (
  userId: string,
  options: any = {}
) {
  return this.find({ user: userId })
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

const Document = mongoose.model<DocumentDocument>("Document", documentSchema);

export default Document;
