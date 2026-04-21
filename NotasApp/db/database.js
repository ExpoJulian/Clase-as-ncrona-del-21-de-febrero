import * as SQLite from 'expo-sqlite';

let db;


export const openDatabase = async () => {
  db = await SQLite.openDatabaseAsync('notas.db');
  return db;
};

// ─── Inicializar tablas ─────────────────────────────────────────────────────
export const initDatabase = async () => {
  if (!db) await openDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS notes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      content     TEXT,
      isImportant INTEGER DEFAULT 0,
      createdAt   TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      showOnlyImportant INTEGER DEFAULT 0,
      sortBy            TEXT    DEFAULT 'date'
    );
  `);

  // Insertar preferencias por defecto si no existen
  const prefs = await db.getFirstAsync('SELECT id FROM preferences LIMIT 1');
  if (!prefs) {
    await db.runAsync(
      `INSERT INTO preferences (showOnlyImportant, sortBy) VALUES (0, 'date')`
    );
  }
};

// ─── CRUD – Notas ───────────────────────────────────────────────────────────
export const getAllNotes = async (showOnlyImportant = false, sortBy = 'date') => {
  if (!db) await openDatabase();

  const orderClause =
    sortBy === 'alpha' ? 'title COLLATE NOCASE ASC' : 'createdAt DESC';
  const whereClause = showOnlyImportant ? 'WHERE isImportant = 1' : '';

  return await db.getAllAsync(
    `SELECT * FROM notes ${whereClause} ORDER BY ${orderClause}`
  );
};

export const searchNotes = async (query, showOnlyImportant = false, sortBy = 'date') => {
  if (!db) await openDatabase();

  const orderClause =
    sortBy === 'alpha' ? 'title COLLATE NOCASE ASC' : 'createdAt DESC';
  const importantClause = showOnlyImportant ? 'AND isImportant = 1' : '';

  return await db.getAllAsync(
    `SELECT * FROM notes
     WHERE (title LIKE ? OR content LIKE ?) ${importantClause}
     ORDER BY ${orderClause}`,
    [`%${query}%`, `%${query}%`]
  );
};

export const addNote = async (title, content, isImportant = 0) => {
  if (!db) await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO notes (title, content, isImportant) VALUES (?, ?, ?)`,
    [title, content, isImportant]
  );
  return result.lastInsertRowId;
};

export const deleteNote = async (id) => {
  if (!db) await openDatabase();
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
};

export const toggleImportant = async (id, currentValue) => {
  if (!db) await openDatabase();
  await db.runAsync(`UPDATE notes SET isImportant = ? WHERE id = ?`, [
    currentValue ? 0 : 1,
    id,
  ]);
};

// ─── Preferencias ───────────────────────────────────────────────────────────
export const getPreferences = async () => {
  if (!db) await openDatabase();
  return await db.getFirstAsync(`SELECT * FROM preferences LIMIT 1`);
};

export const updatePreferences = async (showOnlyImportant, sortBy) => {
  if (!db) await openDatabase();
  await db.runAsync(
    `UPDATE preferences SET showOnlyImportant = ?, sortBy = ? WHERE id = 1`,
    [showOnlyImportant ? 1 : 0, sortBy]
  );
};
