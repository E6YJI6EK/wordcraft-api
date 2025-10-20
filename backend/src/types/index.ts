import { Request } from "express";
import { Document } from "mongoose";

// User types
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}
export interface IUser extends Document {
  email: string;
  password: string;
  login: string;
  role: UserRole;
  avatarUrl: string | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum TextAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
  JUSTIFY = "justify",
}
export interface IDocumentFontSettings {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  alignment: TextAlignment;
  spacing: {
    before?: number;
    after?: number;
    line?: number;
  };
}

export interface IDocumentMarginsSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IDocumentSettings {
  name: string;
  title: IDocumentFontSettings;
  heading1: IDocumentFontSettings;
  heading2: IDocumentFontSettings;
  heading3: IDocumentFontSettings;
  body: IDocumentFontSettings;
  margins: IDocumentMarginsSettings;
}

// Document types
export enum ContentBlockType {
  PARAGRAPH = "paragraph",
  IMAGE = "image",
  TABLE = "table",
  FORMULA = "formula",
  ORDERED_LIST = "ordered_list",
  UNORDERED_LIST = "unordered_list",
}

export enum DocumentContentLevel {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
}

export interface IContentBlock {
  type: ContentBlockType;
  data: string;
}

export interface IDocumentContent {
  title: string;
  level: DocumentContentLevel;
  blocks: IContentBlock[];
}
export interface IDocument {
  title: string;
  contents: IDocumentContent[];
  settings: IDocumentSettings;
  originalFile?: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  };
}

// Request types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | object;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// Pagination response type
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Environment variables
export interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
}
