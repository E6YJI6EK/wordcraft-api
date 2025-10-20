import z from "zod";

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
  