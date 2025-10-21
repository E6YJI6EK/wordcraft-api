import { DatabaseSeeder } from "./seeders/DatabaseSeeder";
import { ConnectManager } from "./shared/ConnectManager";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const connectManager = new ConnectManager();
const dbSeeder = new DatabaseSeeder();

const seed = async () => {
  try {
    await connectManager.connectDB();
    await dbSeeder.seedAll();
  } catch (error) {
    console.log(error);
  } finally {
    connectManager.disconnectDB("Seeders run");
  }
};

seed();

export default {};
