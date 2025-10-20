import mongoose, {
  Schema,
  Document as MongooseDocument,
  Types,
} from "mongoose";
import { ContentBlockType, IContentBlock } from "../types";

export interface ContentBlockDocument extends IContentBlock, MongooseDocument {
  content: Types.ObjectId;
}

const ImageBlockSchema = new Schema({
  image: {
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    order: { type: Number },
    name: { type: String, required: true },
  },
});

const TableBlockSchema = new Schema({
  table: {
    content: { type: String, required: true },
    order: { type: Number },
    name: { type: String, required: true },
  },
});

const FormulaBlockSchema = new Schema({
  formula: {
    content: { type: String, required: true },
    order: { type: Number },
    name: { type: String, required: true },
  },
});

const TextBlockSchema = new Schema({
  textContent: { type: String, required: true },
});

const contentBlockSchema = new Schema<ContentBlockDocument>(
  {
    type: {
      type: String,
      required: [true, "Тип блока обязателен"],
      enum: Object.values(ContentBlockType),
      default: ContentBlockType.PARAGRAPH,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: [true, "Связь с разделом обязательна"],
    },
    order: {
      type: Number,
      required: [true, "Порядок блока обязателен"],
      min: 1,
      default: 1,
    },
  },
  {
    discriminatorKey: "type",
  }
);

// Индексы для быстрого поиска
contentBlockSchema.index({ content: 1, order: 1 });
contentBlockSchema.index({ content: 1, type: 1 });

// Метод для обновления порядка блока
contentBlockSchema.methods["updateOrder"] = function (newOrder: number): void {
  this["order"] = newOrder;
};

// Статический метод для поиска блоков раздела
contentBlockSchema.statics["findByContent"] = function (contentId: string) {
  return this.find({ content: contentId }).sort({ order: 1 });
};

// Статический метод для поиска блоков по типу
contentBlockSchema.statics["findByType"] = function (
  contentId: string,
  type: ContentBlockType
) {
  return this.find({ content: contentId, type });
};

const BaseContentBlock = mongoose.model("ContentBlock", contentBlockSchema);

const ImageBlock = BaseContentBlock.discriminator(
  ContentBlockType.IMAGE,
  ImageBlockSchema
);
const TableBlock = BaseContentBlock.discriminator(
  ContentBlockType.TABLE,
  TableBlockSchema
);
const FormulaBlock = BaseContentBlock.discriminator(
  ContentBlockType.FORMULA,
  FormulaBlockSchema
);
const ParagraphBlock = BaseContentBlock.discriminator(
  ContentBlockType.PARAGRAPH,
  TextBlockSchema
);
const OrderedListBlock = BaseContentBlock.discriminator(
  ContentBlockType.ORDERED_LIST,
  TextBlockSchema
);
const UnorderedListBlock = BaseContentBlock.discriminator(
  ContentBlockType.UNORDERED_LIST,
  TextBlockSchema
);

export default {
  BaseContentBlock,
  ImageBlock,
  FormulaBlock,
  TableBlock,
  ParagraphBlock,
  OrderedListBlock,
  UnorderedListBlock,
};
