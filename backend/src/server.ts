import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

// Импорт роутов
import authRoutes from "./routes/auth";
import documentRoutes from "./routes/documents";
import gostRoutes from "./routes/export";

// Импорт middleware
import { ConnectManager } from "./shared/ConnectManager";
import { errorHandler, notFound } from "./utils/errorHandler";
import { DatabaseSeeder } from "./seeders/DatabaseSeeder";

// Загрузка переменных окружения
dotenv.config({ path: "../.env" });

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Авторизация и пользователи
 *   - name: Documents
 *     description: Работа с документами
 *   - name: GOST
 *     description: Экспорт и форматирование по ГОСТу
 */
// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/gost", gostRoutes);

// Health check
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Проверка состояния API
 *     tags: [Misc]
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Wordcraft API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const connectManager = new ConnectManager();
const dbSeeder = new DatabaseSeeder();

// Обработка сигналов завершения
process.on("SIGTERM", () => connectManager.disconnectDB("SIGTERM"));
process.on("SIGINT", () => connectManager.disconnectDB("SIGINT"));

// Обработка необработанных ошибок
process.on("unhandledRejection", (err: Error) => {
  console.error("❌ Необработанная ошибка Promise:", err);
  connectManager.disconnectDB("unhandledRejection");
});

process.on("uncaughtException", (err: Error) => {
  console.error("❌ Необработанная ошибка:", err);
  connectManager.disconnectDB("uncaughtException");
});

// Запуск сервера
const startServer = async (): Promise<void> => {
  try {
    await connectManager.connectDB();
    await dbSeeder.seedAll();  
    const PORT = Number(process.env["PORT"]) || 5001;

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📝 API доступен по адресу: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Окружение: ${process.env["NODE_ENV"] || "development"}`);
    });
  } catch (error) {
    console.error("❌ Ошибка запуска сервера:", error);
    process.exit(1);
  }
};

// Запускаем сервер
startServer();

export default app;
