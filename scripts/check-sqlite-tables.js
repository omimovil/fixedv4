// Script para verificar las tablas existentes en SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos SQLite
const sqliteDbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../.tmp/data.db');

async function checkSqliteTables() {
  console.log(`Verificando tablas en SQLite: ${sqliteDbPath}`);
  
  // Verificar que la base de datos SQLite existe
  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`Error: Base de datos SQLite no encontrada en ${sqliteDbPath}`);
    return;
  }
  
  // Abrir conexión a SQLite
  const sqliteDb = new sqlite3.Database(sqliteDbPath);
  
  // Obtener lista de tablas desde SQLite
  sqliteDb.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", 
    (err, rows) => {
      if (err) {
        console.error('Error al consultar tablas:', err);
        sqliteDb.close();
        return;
      }
      
      const tables = rows.map(row => row.name);
      console.log('Tablas encontradas en SQLite:', tables);
      console.log(`Total de tablas: ${tables.length}`);
      
      // Cerrar conexión a SQLite
      sqliteDb.close();
    }
  );
}

// Ejecutar la verificación
checkSqliteTables();