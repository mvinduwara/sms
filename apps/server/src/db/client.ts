import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.resolve(process.env.DB_PATH ?? "./sms-gateway.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("busy_timeout = 5000");

  const migrationSql = fs.readFileSync(
    path.join(__dirname, "migrations/001_initial.sql"),
    "utf8"
  );
  _db.exec(migrationSql);

  return _db;
}

export type Db = Database.Database;