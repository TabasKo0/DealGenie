import Database from 'better-sqlite3';

const transactionDb = new Database('transactions.db', { verbose: console.log });

transactionDb.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    amount INTEGER,
    type TEXT,
    date TEXT,
    remarks TEXT
   
  )
`);

export default transactionDb;
