import { Request } from 'express';
import { Document, Model } from 'mongoose';

// User types
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Document types
export interface IDocument extends Document {
  title: string;
  type: 'coursework' | 'thesis' | 'report' | 'essay';
  content: string;
  gostFormat: 'gost-7.32-2017' | 'gost-7.1-2003' | 'gost-2.105-95';
  settings: {
    fontSize: number;
    lineSpacing: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    fontFamily: string;
  };
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
  status: 'draft' | 'in_progress' | 'completed';
  version: number;
  user: IUser['_id'];
  isPublic: boolean;
  tags: string[];
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