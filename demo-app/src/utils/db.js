// utils/db.js
// Shared database module — AFTER state pattern
// Prevents the "new Database() inside every route" anti-pattern from BEFORE state

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Single shared connection per database file
const databases = {};

function getDb(name = 'app') {
  if (!databases[name]) {
    const dbPath = path.join(__dirname, '../../', `${name}.db`);
    databases[name] = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error(`[DB] Failed to connect to ${name}.db:`, err.message);
    });
  }
  return databases[name];
}

// Promisified query helpers for async/await usage
function dbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { getDb, dbGet, dbAll, dbRun };
