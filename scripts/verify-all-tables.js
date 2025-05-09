const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos SQLite
const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new sqlite3.Database(dbPath);

// Obtener todas las tablas
console.log('\nTablas en SQLite:');
db.all('SELECT name FROM sqlite_master WHERE type = "table" ORDER BY name', [], (err, tables) => {
  if (err) {
    console.error('Error al obtener tablas:', err);
    return;
  }
  
  tables.forEach(table => {
    const tableName = table.name;
    console.log(`\nTabla: ${tableName}`);
    
    // Obtener estructura de la tabla
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        console.error(`Error al obtener columnas de ${tableName}:`, err);
        return;
      }
      console.log('Columnas:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
      
      // Obtener datos de la tabla
      db.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, count) => {
        if (err) {
          console.error(`Error al obtener datos de ${tableName}:`, err);
          return;
        }
        console.log(`Total registros: ${count[0].count}`);
      });
    });
  });

  // Cerrar la conexión
  db.close();
});
