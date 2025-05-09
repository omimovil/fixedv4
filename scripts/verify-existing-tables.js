const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function verifyExistingTables() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Tablas Existentes ===');
    db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, tables) => {
      if (err) {
        console.error('Error al obtener tablas:', err);
        return;
      }
      
      tables.forEach(table => {
        console.log(`\n=== ${table.name} ===`);
        
        // Obtener columnas
        db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
          if (err) {
            console.error(`Error al obtener columnas de ${table.name}:`, err);
            return;
          }
          
          console.log('Columnas:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
          
          // Obtener claves foráneas
          db.all(`PRAGMA foreign_key_list(${table.name})`, (err, foreignKeys) => {
            if (err) {
              console.error(`Error al obtener claves foráneas de ${table.name}:`, err);
              return;
            }
            
            if (foreignKeys.length > 0) {
              console.log('Claves foráneas:');
              foreignKeys.forEach(fk => {
                console.log(`- ${fk.from} -> ${fk.table}(${fk.to})`);
              });
            }
          });
        });
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyExistingTables();
