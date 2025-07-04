import React, { createContext, useContext, useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { getDatabase, initDatabase } from "./db";

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
      await initDatabase();
      const database = await getDatabase();
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
