const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function verifyTables() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    // Verificar tablas
    const tables = ['strapi_roles', 'strapi_users'];
    
    for (const table of tables) {
      console.log(`\nVerificando tabla: ${table}`);
      
      // Verificar si la tabla existe
      await new Promise((resolve, reject) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=$1`, [table], (err, row) => {
          if (err) reject(err);
          if (row) {
            console.log('Tabla existe');
            // Verificar columnas
            db.all(`PRAGMA table_info(${table})`, (err, columns) => {
              if (err) reject(err);
              console.log('Columnas:');
              columns.forEach(col => {
                console.log(`- ${col.name} (${col.type})`);
              });
              resolve();
            });
          } else {
            console.log('Tabla no existe');
            resolve();
          }
        });
      });
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyTables();
