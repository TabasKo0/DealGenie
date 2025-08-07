const Database = require('better-sqlite3');

const db = new Database('users.db', { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : null 
});

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    balance INTEGER DEFAULT 0,
    transactions TEXT,
    password TEXT
  )
`);

export default db;
