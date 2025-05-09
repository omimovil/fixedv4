const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function analyzeStrapiStructure() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Estructura de Strapi ===');
    
    // Obtener todas las tablas
    console.log('\n=== Tablas ===');
    db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, tables) => {
      if (err) {
        console.error('Error al obtener tablas:', err);
        return;
      }
      
      tables.forEach(table => {
        const tableName = table.name;
        
        console.log(`\n=== ${tableName} ===`);
        
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
          
          // Obtener índices
          db.all(`PRAGMA index_list(${tableName})`, (err, indexes) => {
            if (err) {
              console.error(`Error al obtener índices de ${tableName}:`, err);
              return;
            }
            
            if (indexes.length > 0) {
              console.log('Índices:');
              indexes.forEach(index => {
                console.log(`- ${index.name}`);
              });
            }
          });
        });
      });
    });
    
    // Obtener relaciones
    console.log('\n=== Relaciones ===');
    db.all(`
      SELECT 
        m.name as table_name,
        p.name as column_name,
        f.name as foreign_table,
        f2.name as foreign_column
      FROM 
        sqlite_master m
        JOIN pragma_foreign_key_list(m.name) f ON m.name = f.table
        JOIN sqlite_master f2 ON f2.name = f.table
        JOIN pragma_table_info(f2.name) p ON p.name = f.from
      ORDER BY m.name
    `, (err, relations) => {
      if (err) {
        console.error('Error al obtener relaciones:', err);
        return;
      }
      
      if (relations.length > 0) {
        relations.forEach(relation => {
          console.log(`
Tabla: ${relation.table_name}
Columna: ${relation.column_name}
Relacionada con: ${relation.foreign_table}.${relation.foreign_column}
`);
        });
      }
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeStrapiStructure();
