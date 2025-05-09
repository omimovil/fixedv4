const sqlite3 = require('sqlite3').verbose();

async function verifySQLiteColumns() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');

    const tables = ['payment_methods', 'delivery_dates', 'orders'];

    for (const table of tables) {
      console.log(`\n=== Columnas de ${table} ===`);
      db.all(`PRAGMA table_info(${table})`, (err, rows) => {
        if (err) throw err;
        rows.forEach(row => {
          console.log(`- ${row.name} (${row.type})`);
        });
      });
    }

    db.close();
  } catch (error) {
    console.error('Error al verificar columnas:', error);
  }
}

verifySQLiteColumns();
