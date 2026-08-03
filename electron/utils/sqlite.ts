import initSqlJs, { Database, BindParams } from "sql.js";
import * as fs from "fs-extra";

export class SQLiteHelper {
  private db: Database | null = null;
  
  constructor(private dbPath: string) {}

  async connect() {
    const SQL = await initSqlJs();
    const filebuffer = fs.readFileSync(this.dbPath);
    this.db = new SQL.Database(filebuffer);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  prepare(query: string) {
    if (!this.db) throw new Error("DB not connected");
    const db = this.db;
    return {
      all: (...params: unknown[]) => {
        const stmt = db.prepare(query);
        stmt.bind(params as BindParams);
        const rows: Record<string, unknown>[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },
      get: (...params: unknown[]) => {
        const stmt = db.prepare(query);
        stmt.bind(params as BindParams);
        let row = null;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },
    };
  }
}
