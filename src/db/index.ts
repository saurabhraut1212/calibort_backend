import mysql from "mysql2/promise";
import config from "../config";

export type DbPool = mysql.Pool;

const pool: DbPool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
   multipleStatements: true 
});

export default pool;
