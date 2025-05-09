const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function showAllData() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Mostrando todos los datos ===');
    
    // Obtener todas las tablas
    db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, tables) => {
      if (err) {
        console.error('Error al obtener tablas:', err);
        return;
      }
      
      tables.forEach(table => {
        const tableName = table.name;
        
        console.log(`\n=== Tabla: ${tableName} ===`);
        
        // Obtener columnas
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) {
            console.error(`Error al obtener columnas de ${tableName}:`, err);
            return;
          }
          
          console.log('Columnas:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
          
          // Obtener todos los datos
          db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
              console.error(`Error al obtener datos de ${tableName}:`, err);
              return;
            }
            
            console.log(`\nTotal registros: ${rows.length}`);
            
            if (rows.length > 0) {
              console.log('\nDatos:');
              rows.forEach((row, index) => {
                console.log(`\nRegistro ${index + 1}:`);
                Object.entries(row).forEach(([key, value]) => {
                  if (key === 'created_at' || key === 'updated_at') {
                    console.log(`- ${key}: ${new Date(value * 1000).toISOString()}`);
                  } else {
                    console.log(`- ${key}: ${value}`);
                  }
                });
              });
            } else {
              console.log('No hay datos en esta tabla');
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

showAllData();
