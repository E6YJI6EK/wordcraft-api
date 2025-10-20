import mongoose, {
  Document as MongooseDocument,
  Schema,
  Types,
} from "mongoose";
import { DocumentType, IDocument } from "../types";

export interface DocumentDocument extends IDocument, MongooseDocument {
  user: Types.ObjectId;
}

const documentSchema = new Schema<DocumentDocument>(
  {
    title: {
      type: String,
      required: [true, "Название документа обязательно"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Тип документа обязательно"],
      enum: Object.values(DocumentType),
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
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
documentSchema.index({ user: 1 });

// Виртуальное поле для полного пути к файлу
documentSchema.virtual("fileUrl").get(function () {
  if (this.originalFile?.path) {
    return `/uploads/${this.originalFile.filename}`;
  }
  return null;
});

// Виртуальное поле для получения разделов документа
documentSchema.virtual("contents", {
  ref: "Content",
  localField: "_id",
  foreignField: "document",
});

// Статический метод для поиска документов пользователя
documentSchema.statics["findByUser"] = function (userId: string) {
  return this.find({ user: userId });
};

const Document = mongoose.model<DocumentDocument>("Document", documentSchema);

export default Document;
