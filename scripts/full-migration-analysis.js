const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function analyzeFullMigration() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Análisis Completo de Migración ===');
    
    // 1. Obtener todas las tablas
    console.log('\n=== Tablas ===');
    db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, tables) => {
      if (err) {
        console.error('Error al obtener tablas:', err);
        return;
      }
      
      tables.forEach(table => {
        const tableName = table.name;
        
        console.log(`\n=== ${tableName} ===`);
        
        // 2. Obtener columnas
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) {
            console.error(`Error al obtener columnas de ${tableName}:`, err);
            return;
          }
          
          console.log('Columnas:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
          
          // 3. Obtener índices
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
          
          // 4. Obtener claves foráneas
          db.all(`PRAGMA foreign_key_list(${tableName})`, (err, foreignKeys) => {
            if (err) {
              console.error(`Error al obtener claves foráneas de ${tableName}:`, err);
              return;
            }
            
            if (foreignKeys.length > 0) {
              console.log('Claves foráneas:');
              foreignKeys.forEach(fk => {
                console.log(`- ${fk.from} -> ${fk.table}(${fk.to})`);
              });
            }
          });
          
          // 5. Verificar datos
          db.all(`SELECT * FROM ${tableName} LIMIT 1`, (err, rows) => {
            if (err) {
              console.error(`Error al obtener datos de ${tableName}:`, err);
              return;
            }
            
            if (rows.length > 0) {
              console.log('Ejemplo de datos:');
              Object.entries(rows[0]).forEach(([key, value]) => {
                console.log(`- ${key}: ${value}`);
              });
            }
          });
        });
      });
    });
    
    // 6. Obtener triggers
    console.log('\n=== Triggers ===');
    db.all('SELECT name, sql FROM sqlite_master WHERE type="trigger" ORDER BY name', (err, triggers) => {
      if (err) {
        console.error('Error al obtener triggers:', err);
        return;
      }
      
      triggers.forEach(trigger => {
        console.log(`\n${trigger.name}:`);
        console.log(trigger.sql);
      });
    });
    
    // 7. Obtener vistas
    console.log('\n=== Vistas ===');
    db.all('SELECT name, sql FROM sqlite_master WHERE type="view" ORDER BY name', (err, views) => {
      if (err) {
        console.error('Error al obtener vistas:', err);
        return;
      }
      
      views.forEach(view => {
        console.log(`\n${view.name}:`);
        console.log(view.sql);
      });
    });
    
    // 8. Verificar integridad de referencias
    console.log('\n=== Integridad de Referencias ===');
    db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, tables) => {
      if (err) {
        console.error('Error al verificar integridad:', err);
        return;
      }
      
      tables.forEach(table => {
        const tableName = table.name;
        
        // Verificar referencias a usuarios
        if (tableName !== 'strapi_users') {
          db.all(`
            SELECT COUNT(*) as count 
            FROM ${tableName} 
            WHERE created_by_id IS NOT NULL 
            AND NOT EXISTS (
              SELECT 1 FROM strapi_users WHERE id = ${tableName}.created_by_id
            )
          `, (err, result) => {
            if (err) {
              console.error(`Error al verificar referencias en ${tableName}:`, err);
              return;
            }
            
            if (result[0].count > 0) {
              console.log(`¡Advertencia! ${result[0].count} registros en ${tableName} con referencias inválidas a usuarios`);
            }
          });
        }
        
        // Verificar referencias a roles
        if (tableName !== 'strapi_roles') {
          db.all(`
            SELECT COUNT(*) as count 
            FROM ${tableName} 
            WHERE role IS NOT NULL 
            AND NOT EXISTS (
              SELECT 1 FROM strapi_roles WHERE id = ${tableName}.role
            )
          `, (err, result) => {
            if (err) {
              console.error(`Error al verificar referencias en ${tableName}:`, err);
              return;
            }
            
            if (result[0].count > 0) {
              console.log(`¡Advertencia! ${result[0].count} registros en ${tableName} con referencias inválidas a roles`);
            }
          });
        }
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeFullMigration();
