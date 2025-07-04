import React, { createContext, useContext, useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

type DatabaseContextType = {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
};

export const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const database = await SQLite.openDatabaseAsync("flow.db");
      await database.runAsync("PRAGMA foreign_keys = ON;");

      await database.runAsync(
        `CREATE TABLE IF NOT EXISTS flow (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT
        );`
      );
      await database.runAsync(
        `CREATE TABLE IF NOT EXISTS step (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          flow_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          FOREIGN KEY(flow_id) REFERENCES flow(id) ON DELETE CASCADE
        );`
      );
      await database.runAsync(
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

      setDb(database);
      setIsReady(true);
    })();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context.db) {
    throw new Error("Database is not ready yet.");
  }
  return context.db;
}
