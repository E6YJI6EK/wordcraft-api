import z from "zod";
import { createQuerySchema, MongooseIdSchema } from "../shared/query";

export const queryDocumentsSchema = z.object({
  body: createQuerySchema({
    allowedSortFields: ["createdAt"],
    allowedFilterFields: ["type"],
  }),
  params: z.object({
    userId: MongooseIdSchema,
  }),
});

export const createDocumentSchema = z.object({});

export const updateDocumentSchema = createDocumentSchema.partial();

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
