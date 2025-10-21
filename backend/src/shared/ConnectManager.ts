import mongoose from "mongoose";

export class ConnectManager {
  async connectDB(): Promise<void> {
    try {
      const mongoUri = process.env["MONGODB_URI"];
       
      if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined");
      }

      const conn = await mongoose.connect(mongoUri);
      console.log("✅ Подключение к MongoDB установлено");
      console.log(`📊 База данных: ${conn.connection.host}`);
    } catch (error) {
      console.error("❌ Ошибка подключения к MongoDB:", error);
      process.exit(1);
    }
  }

  disconnectDB(signal: string): void {
    console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`);

    mongoose.connection.close().then(() => {
      console.log("📊 Соединение с MongoDB закрыто.");
      process.exit(0);
    });
  }
}
