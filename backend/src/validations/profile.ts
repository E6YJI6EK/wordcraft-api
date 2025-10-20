import z from "zod";

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