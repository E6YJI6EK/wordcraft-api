import z from "zod";

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