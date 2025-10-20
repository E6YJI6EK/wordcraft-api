export { ApiResponse, PaginatedResponse, PaginatedRequest } from "./api";
export { IUser, UserRole } from "./user";
export { IDocument } from "./document";
export {
  ContentBlockType,
  IContentBlock,
  IDocumentContent,
  DocumentType,
  DocumentLevel,
} from "./document";
export { AuthRequest } from "./requests";
// Environment variables
export interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
}
