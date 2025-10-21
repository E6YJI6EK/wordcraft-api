import { Model, Document } from "mongoose";

// Базовый интерфейс для всех сидеров
export interface ISeeder<T extends Document> {
  model: Model<T>;
  data: Partial<T>[];
  run(): Promise<T[]>;
}

// Абстрактный базовый класс сидера
export abstract class BaseSeeder<T extends Document> implements ISeeder<T> {
  public abstract model: Model<T>;
  public abstract data: Partial<T>[];

  /**
   * Запуск сидинга для конкретной модели
   */
  async run(): Promise<T[]> {
    if (!this.model) {
      throw new Error("Model not defined");
    }

    if (!this.data || this.data.length === 0) {
      console.log(`⚠️ No data provided for ${this.model.modelName}`);
      return [];
    }

    try {
      // Очищаем коллекцию перед сидингом
      // await this.model.deleteMany({});
      // console.log(`🧹 Cleared ${this.model.modelName} collection`);

      // Вставляем данные
      const result = await this.model.insertMany(this.data as any);
      console.log(`✅ Seeded ${result.length} ${this.model.modelName} records`);

      return result;
    } catch (error) {
      console.error(`❌ Failed to seed ${this.model.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Сидинг без очистки коллекции (добавление данных)
   */
  async runWithoutClear(): Promise<T[]> {
    if (!this.model) {
      throw new Error("Model not defined");
    }

    try {
      const result = await this.model.insertMany(this.data as any);
      console.log(
        `✅ Added ${result.length} ${this.model.modelName} records without clearing`
      );
      return result;
    } catch (error) {
      console.error(`❌ Failed to add ${this.model.modelName} records:`, error);
      throw error;
    }
  }

  /**
   * Проверка существования данных перед сидингом
   */
  async shouldSeed(): Promise<boolean> {
    if (!this.model) return false;

    const count = await this.model.countDocuments();
    return count === 0;
  }

  /**
   * Сидинг только если коллекция пуста
   */
  async runIfEmpty(): Promise<T[] | null> {
    if (await this.shouldSeed()) {
      return await this.run();
    }

    console.log(
      `⏭️ ${this.model.modelName} already has data, skipping seeding`
    );
    return null;
  }
}
