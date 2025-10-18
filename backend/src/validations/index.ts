import { z } from "zod";

// Auth validations
export const registerSchema = z.object({
  name: z
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
export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Название документа обязательно")
    .max(200, "Название не должно превышать 200 символов")
    .trim(),
  type: z.enum(["coursework", "thesis", "report", "essay"], {
    errorMap: () => ({
      message:
        "Тип документа должен быть одним из: coursework, thesis, report, essay",
    }),
  }),
  content: z.string().optional().default(""),
  gostFormat: z
    .enum(["gost-7.32-2017", "gost-7.1-2003", "gost-2.105-95"], {
      errorMap: () => ({
        message:
          "Формат ГОСТ должен быть одним из: gost-7.32-2017, gost-7.1-2003, gost-2.105-95",
      }),
    })
    .optional()
    .default("gost-7.32-2017"),
  settings: z
    .object({
      fontSize: z
        .number()
        .min(8, "Размер шрифта должен быть не менее 8")
        .max(72, "Размер шрифта должен быть не более 72")
        .optional()
        .default(14),
      lineSpacing: z
        .number()
        .min(1, "Межстрочный интервал должен быть не менее 1")
        .max(3, "Межстрочный интервал должен быть не более 3")
        .optional()
        .default(1.5),
      margins: z
        .object({
          top: z.number().min(10).max(50).optional().default(20),
          bottom: z.number().min(10).max(50).optional().default(20),
          left: z.number().min(20).max(50).optional().default(30),
          right: z.number().min(10).max(30).optional().default(15),
        })
        .optional()
        .default({
          top: 20,
          bottom: 20,
          left: 30,
          right: 15,
        }),
      fontFamily: z.string().optional().default("Times New Roman"),
    })
    .optional()
    .default({
      fontSize: 14,
      lineSpacing: 1.5,
      margins: {
        top: 20,
        bottom: 20,
        left: 30,
        right: 15,
      },
      fontFamily: "Times New Roman",
    }),
  metadata: z
    .object({
      author: z.string().max(100).optional(),
      supervisor: z.string().max(100).optional(),
      department: z.string().max(100).optional(),
      year: z
        .number()
        .min(2000, "Год должен быть не ранее 2000")
        .max(
          new Date().getFullYear() + 1,
          "Год не может быть больше текущего + 1"
        )
        .optional(),
      subject: z.string().max(200).optional(),
      keywords: z.array(z.string().max(50)).max(10).optional(),
    })
    .optional()
    .default({}),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string().max(30)).max(20).optional().default([]),
});

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

// File upload validations
export const fileUploadSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z
      .string()
      .refine(
        (type) =>
          [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
          ].includes(type),
        "Поддерживаются только файлы .docx, .doc и .txt"
      ),
    size: z
      .number()
      .max(10 * 1024 * 1024, "Размер файла не должен превышать 10MB"),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
  }),
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
