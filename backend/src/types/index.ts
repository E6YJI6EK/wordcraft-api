import { Request } from "express";
import { Document, Model } from "mongoose";

// User types
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Document types
export enum ContentBlockType {
  PARAGRAPH = "paragraph",
  IMAGE = "image",
  TABLE = "table",
  FORMULA = "formula",
}

export interface IContentBlock {
  type: ContentBlockType;
  data: string;
}

export interface IDocumentContent {
  title: string;
  level: 1 | 2 | 3;
  blocks: IContentBlock[];
}
export interface IDocument extends Document {
  title: string;
  metadata: {
    author?: string;
    supervisor?: string;
    department?: string;
    year?: number;
    subject?: string;
    keywords?: string[];
  };
  originalFile?: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  };
  user: IUser["_id"];
  createdAt: Date;
  updatedAt: Date;
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

// Model types
export interface UserModel extends Model<IUser> {}
export interface DocumentModel extends Model<IDocument> {}

// Environment variables
export interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
}
