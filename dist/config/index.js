"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getNumber = (value, fallback) => {
    if (!value)
        return fallback;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};
const config = {
    database: {
        host: process.env.DATABASE_HOST ?? "127.0.0.1",
        port: getNumber(process.env.DATABASE_PORT, 3306),
        database: process.env.DATABASE_NAME ?? "calibort",
        user: process.env.DATABASE_USER ?? "root",
        password: process.env.DATABASE_PASSWORD ?? ""
    },
    server: {
        port: getNumber(process.env.PORT, 4000),
        env: process.env.NODE_ENV ?? "development"
    },
    jwtSecret: process.env.JWT_SECRET ?? "replace_this_in_production"
};
exports.default = config;
