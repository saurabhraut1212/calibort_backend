"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seed script - inserts an admin user with a hashed password.
 * Run: npm run seed
 */
const index_1 = __importDefault(require("./index"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../utils/logger"));
async function seed() {
    const connection = await index_1.default.getConnection();
    try {
        const name = "Admin";
        const email = "admin@calibort.test";
        const password = "Admin@123"; // change after first deploy
        const saltRounds = 10;
        const hash = await bcryptjs_1.default.hash(password, saltRounds);
        const [existingRows] = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
        if (existingRows.length > 0) {
            logger_1.default.info("Admin user already exists. Skipping seed.");
            return;
        }
        const [result] = await connection.query("INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'local')", [name, email, hash]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const insertId = result.insertId;
        logger_1.default.info("Admin user created:", { email, id: insertId });
    }
    catch (err) {
        logger_1.default.error("Seed failed:", err.message);
        throw err;
    }
    finally {
        connection.release();
        await index_1.default.end();
    }
}
seed().catch((err) => {
    logger_1.default.error("Seed error:", err.message);
    process.exit(1);
});
