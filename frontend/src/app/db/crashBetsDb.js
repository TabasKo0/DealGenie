const Database = require('better-sqlite3');

const crashBetsDb = new Database('crashBets.db', { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : null 
});

crashBetsDb.exec(`
  CREATE TABLE IF NOT EXISTS crashBets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    gameid TEXT,
    betAmount INTEGER,
    multiplier REAL,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default crashBetsDb;