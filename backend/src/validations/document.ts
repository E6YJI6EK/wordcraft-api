import z from "zod";

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