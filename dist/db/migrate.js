"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./index"));
const logger_1 = __importDefault(require("../utils/logger"));
async function runMigration() {
    const migrationsDir = path_1.default.resolve(__dirname, "../../migrations");
    const files = fs_1.default.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
    files.sort();
    for (const file of files) {
        const filePath = path_1.default.join(migrationsDir, file);
        const sql = fs_1.default.readFileSync(filePath, "utf8");
        logger_1.default.info(`Running migration: ${file}`);
        const connection = await index_1.default.getConnection();
        try {
            await connection.beginTransaction();
            // split by ; to allow multiple statements - but execute as whole is fine in mysql2
            await connection.query(sql);
            await connection.commit();
            logger_1.default.info(`Migration ${file} applied successfully.`);
        }
        catch (err) {
            await connection.rollback();
            logger_1.default.error(`Migration ${file} failed: ${err.message}`);
            throw err;
        }
        finally {
            connection.release();
        }
    }
    logger_1.default.info("All migrations applied.");
    await index_1.default.end();
}
runMigration().catch((err) => {
    logger_1.default.error(`Migration error: ${err.message}`);
    process.exit(1);
});
