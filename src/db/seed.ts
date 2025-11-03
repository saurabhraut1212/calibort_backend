/**
 * Seed script - inserts an admin user with a hashed password.
 * Run: npm run seed
 */
import pool from "./index";
import bcrypt from "bcryptjs";
import logger from "../utils/logger";
import { RowDataPacket } from "mysql2";

async function seed(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const name = "Admin";
    const email = "admin@calibort.test";
    const password = "Admin@123"; // change after first deploy
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const [existingRows] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (existingRows.length > 0) {
      logger.info("Admin user already exists. Skipping seed.");
      return;
    }

    const [result] = await connection.query(
      "INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'local')",
      [name, email, hash]
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const insertId = (result as any).insertId as number;
    logger.info("Admin user created:", { email, id: insertId });
  } catch (err) {
    logger.error("Seed failed:", (err as Error).message);
    throw err;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((err) => {
  logger.error("Seed error:", (err as Error).message);
  process.exit(1);
});
