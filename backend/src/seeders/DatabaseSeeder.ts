import { Document } from "mongoose";
import { BaseSeeder } from "../shared/BaseSeeder";
import { DocumentSettingsSeeder } from "./DocumentSettingsSeeder";

export class DatabaseSeeder {
  // @ts-ignore
  private seeders: BaseSeeder<Document>[] = [new DocumentSettingsSeeder()];

  /**
   * Запуск всех сидеров
   */
  async seedAll(options: { clearBeforeSeed?: boolean } = {}): Promise<void> {
    const { clearBeforeSeed = true } = options;

    try {
      console.log("🌱 Starting database seeding...");

      for (const seeder of this.seeders) {
        if (clearBeforeSeed) {
          await seeder.run();
        } else {
          await seeder.runIfEmpty();
        }
      }

      console.log("✅ All seeders completed successfully");
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      throw error;
    }
  }

  /**
   * Запуск только определенных сидеров
   */
  async seedOnly<T extends Document>(
    seederClasses: (new () => BaseSeeder<T>)[],
    options: { clearBeforeSeed?: boolean } = {}
  ): Promise<void> {
    const { clearBeforeSeed = true } = options;

    try {
      console.log("🌱 Starting selective seeding...");

      const seedersToRun = this.seeders.filter((seeder) =>
        seederClasses.some((SeederClass) => seeder instanceof SeederClass)
      );

      for (const seeder of seedersToRun) {
        if (clearBeforeSeed) {
          await seeder.run();
        } else {
          await seeder.runIfEmpty();
        }
      }

      console.log(`✅ ${seedersToRun.length} seeders completed successfully`);
    } catch (error) {
      console.error("❌ Selective seeding failed:", error);
      throw error;
    } finally {
    }
  }

  /**
   * Получение списка зарегистрированных сидеров
   */
  getRegisteredSeeders(): string[] {
    return this.seeders.map((seeder) => seeder.constructor.name);
  }
}
