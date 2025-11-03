import dotenv from "dotenv";
dotenv.config();

type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

type ServerConfig = {
  port: number;
  env: string;
};

type Config = {
  database: DatabaseConfig;
  server: ServerConfig;
  jwtSecret: string;
};

const getNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config: Config = {
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

export default config;
