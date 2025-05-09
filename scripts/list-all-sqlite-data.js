const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function listAllSQLiteData() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Datos en SQLite ===');
    
    // Obtener todas las tablas
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    // Para cada tabla, mostrar su estructura y datos
    for (const tableName of tables) {
      console.log(`\n=== ${tableName} ===`);
      
      // Mostrar columnas
      const columns = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      console.log('\nColumnas:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
      
      // Mostrar datos
      const data = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName} ORDER BY id LIMIT 5`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      console.log('\nDatos (primeros 5 registros):');
      data.forEach(row => {
        console.log('\nRegistro:');
        Object.keys(row).forEach(key => {
          console.log(`- ${key}: ${row[key]}`);
        });
      });
      
      // Mostrar número total de registros
      const count = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
          if (err) reject(err);
          resolve(row.count);
        });
      });
      
      console.log(`\nTotal registros: ${count}`);
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllSQLiteData();
