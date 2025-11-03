import fs from "fs";
import path from "path";
import pool from "./index";
import logger from "../utils/logger";

async function runMigration(): Promise<void> {
  const migrationsDir = path.resolve(__dirname, "../../migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  files.sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");
    logger.info(`Running migration: ${file}`);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      // split by ; to allow multiple statements - but execute as whole is fine in mysql2
      await connection.query(sql);
      await connection.commit();
      logger.info(`Migration ${file} applied successfully.`);
    } catch (err) {
      await connection.rollback();
      logger.error(`Migration ${file} failed: ${(err as Error).message}`);
      throw err;
    } finally {
      connection.release();
    }
  }
  logger.info("All migrations applied.");
  await pool.end();
}

runMigration().catch((err) => {
  logger.error(`Migration error: ${(err as Error).message}`);
  process.exit(1);
});
