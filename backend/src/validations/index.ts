import { z } from "zod";

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

// Document validations
export const createDocumentSchema = z.object({});

export const updateDocumentSchema = createDocumentSchema.partial();

export const documentQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, "Номер страницы должен быть не менее 1"))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(1, "Лимит должен быть не менее 1")
        .max(100, "Лимит не должен превышать 100")
    )
    .optional()
    .default("10"),
  search: z.string().max(100).optional(),
  type: z.enum(["coursework", "thesis", "report", "essay"]).optional(),
  status: z.enum(["draft", "in_progress", "completed"]).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// GOST formatting validations
export const gostFormatSchema = z.object({
  documentId: z.string().min(1, "ID документа обязателен"),
  format: z
    .enum(["gost-7.32-2017", "gost-7.1-2003", "gost-2.105-95"], {
      errorMap: () => ({
        message:
          "Формат ГОСТ должен быть одним из: gost-7.32-2017, gost-7.1-2003, gost-2.105-95",
      }),
    })
    .optional(),
  customSettings: z
    .object({
      fontSize: z.number().min(8).max(72).optional(),
      lineSpacing: z.number().min(1).max(3).optional(),
      margins: z
        .object({
          top: z.number().min(10).max(50).optional(),
          bottom: z.number().min(10).max(50).optional(),
          left: z.number().min(20).max(50).optional(),
          right: z.number().min(10).max(30).optional(),
        })
        .optional(),
      fontFamily: z.string().optional(),
    })
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
