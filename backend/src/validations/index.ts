import { z } from "zod";
export {
  queryDocumentsSchema,
  updateDocumentSchema,
  createDocumentSchema,
  gostFormatSchema,
} from "./documents";

// Auth validations
export const registerSchema = z.object({
  login: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не должно превышать 50 символов")
    .trim(),
  email: z
    .string()
    .email("Пожалуйста, введите корректный email")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100, "Пароль не должен превышать 100 символов")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать хотя бы одну букву, одну заглавную букву и одну цифру"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Пожалуйста, введите корректный email")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Пароль обязателен"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя не должно превышать 50 символов")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Пожалуйста, введите корректный email")
    .toLowerCase()
    .trim()
    .optional(),
});

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
