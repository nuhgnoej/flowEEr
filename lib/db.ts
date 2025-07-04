// lib/db.ts

import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("flow.db");
    await db.runAsync("PRAGMA foreign_keys = ON;");
  }
  return db;
}

export async function initDatabase() {
  const db = await getDatabase();

  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS flow (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );`
  );

  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS step (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flow_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        position INTEGER NOT NULL,
        FOREIGN KEY(flow_id) REFERENCES flow(id) ON DELETE CASCADE
      );`
  );

  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS trigger (
        id TEXT PRIMARY KEY,
        step_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        target_step_ids TEXT,
        offset INTEGER,
        time TEXT,
        FOREIGN KEY(step_id) REFERENCES step(id) ON DELETE CASCADE
      );`
  );

  // Ensure position column exists for existing databases
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(step);`
  );
  const hasPosition = columns.some((c) => c.name === "position");
  if (!hasPosition) {
    await db.runAsync(
      `ALTER TABLE step ADD COLUMN position INTEGER NOT NULL DEFAULT 0`
    );
  }
}
