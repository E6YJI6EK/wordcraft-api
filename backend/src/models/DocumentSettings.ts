import mongoose, { Document, Schema, Types } from "mongoose";
import {
  IDocumentSettings,
  IDocumentFontSettings,
  IDocumentMarginsSettings,
  TextAlignment,
} from "../types";

export interface IDocumentSettingsDocument extends IDocumentSettings, Document {
  user?: Types.ObjectId;
}

// Схема для настроек шрифта с обновленным spacing
const DocumentFontSettingsSchema = new Schema<IDocumentFontSettings>(
  {
    fontSize: {
      type: Number,
      required: true,
      min: 8,
      max: 72,
    },
    fontFamily: {
      type: String,
      required: true,
    },
    bold: {
      type: Boolean,
      default: false,
    },
    alignment: {
      type: String,
      enum: Object(TextAlignment).values,
      default: TextAlignment.LEFT,
    },
    spacing: {
      before: {
        type: Number,
        default: 0,
        min: 0,
      },
      after: {
        type: Number,
        default: 0,
        min: 0,
      },
      line: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  { _id: false }
);

// Схема для настроек полей
const DocumentMarginsSettingsSchema = new Schema<IDocumentMarginsSettings>(
  {
    top: {
      type: Number,
      required: true,
      min: 0,
    },
    bottom: {
      type: Number,
      required: true,
      min: 0,
    },
    left: {
      type: Number,
      required: true,
      min: 0,
    },
    right: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Функции для дефолтных значений
const getDefaultTitleSettings = (): IDocumentFontSettings => ({
  fontSize: 16,
  fontFamily: "Times New Roman",
  bold: true,
  alignment: TextAlignment.CENTER,
  spacing: { after: 300 },
});

const getDefaultHeading1Settings = (): IDocumentFontSettings => ({
  fontSize: 16,
  fontFamily: "Times New Roman",
  bold: true,
  alignment: TextAlignment.LEFT,
  spacing: { before: 300, after: 300 },
});

const getDefaultHeading2Settings = (): IDocumentFontSettings => ({
  fontSize: 14,
  fontFamily: "Times New Roman",
  bold: true,
  alignment: TextAlignment.LEFT,
  spacing: { before: 200, after: 200 },
});

const getDefaultHeading3Settings = (): IDocumentFontSettings => ({
  fontSize: 14,
  fontFamily: "Times New Roman",
  bold: true,
  alignment: TextAlignment.LEFT,
  spacing: { before: 150, after: 150 },
});

const getDefaultBodySettings = (): IDocumentFontSettings => ({
  fontSize: 14,
  fontFamily: "Times New Roman",
  bold: false,
  alignment: TextAlignment.JUSTIFY,
  spacing: { line: 360 },
});

const getDefaultMarginsSettings = (): IDocumentMarginsSettings => ({
  top: 2000,
  bottom: 2000,
  left: 3000,
  right: 1500,
});

// Основная схема настроек документа с обновленными дефолтными значениями
const DocumentSettingsSchema = new Schema<IDocumentSettingsDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: DocumentFontSettingsSchema,
      required: true,
      default: getDefaultTitleSettings,
    },
    heading1: {
      type: DocumentFontSettingsSchema,
      required: true,
      default: getDefaultHeading1Settings,
    },
    heading2: {
      type: DocumentFontSettingsSchema,
      required: true,
      default: getDefaultHeading2Settings,
    },
    heading3: {
      type: DocumentFontSettingsSchema,
      required: true,
      default: getDefaultHeading3Settings,
    },
    body: {
      type: DocumentFontSettingsSchema,
      required: true,
      default: getDefaultBodySettings,
    },
    margins: {
      type: DocumentMarginsSettingsSchema,
      required: true,
      default: getDefaultMarginsSettings,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DocumentSettings = mongoose.model<IDocumentSettingsDocument>(
  "DocumentSettings",
  DocumentSettingsSchema
);
