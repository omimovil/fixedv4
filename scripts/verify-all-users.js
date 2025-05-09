const sqlite3 = require('sqlite3').verbose();

async function verifyAllUsers() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');
    
    console.log('\n=== Verificando Todos los Usuarios ===');
    
    // Obtener todas las tablas relacionadas con usuarios
    console.log('\n=== Tablas de Usuarios ===');
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table" AND name LIKE "%user%" OR name LIKE "%admin%" ORDER BY name', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    tables.forEach(table => {
      console.log(`\n=== Contenido de ${table} ===`);
      db.all(`SELECT * FROM ${table} ORDER BY id`, (err, rows) => {
        if (err) {
          console.error(`Error al leer ${table}:`, err);
          return;
        }
        
        console.log(`\nEncontrados ${rows.length} registros:`);
        rows.forEach(row => {
          console.log('\nRegistro:');
          Object.keys(row).forEach(key => {
            console.log(`- ${key}: ${row[key]}`);
          });
        });
      });
    });
    
    // Verificar roles
    console.log('\n=== Roles ===');
    db.all('SELECT * FROM strapi_roles ORDER BY id', (err, rows) => {
      if (err) {
        console.error('Error al leer roles:', err);
        return;
      }
      
      console.log(`\nEncontrados ${rows.length} roles:`);
      rows.forEach(row => {
        console.log('\nRole:');
        Object.keys(row).forEach(key => {
          console.log(`- ${key}: ${row[key]}`);
        });
      });
    });
    
    // Verificar permisos
    console.log('\n=== Permisos ===');
    db.all('SELECT * FROM strapi_permissions ORDER BY id', (err, rows) => {
      if (err) {
        console.error('Error al leer permisos:', err);
        return;
      }
      
      console.log(`\nEncontrados ${rows.length} permisos:`);
      rows.forEach(row => {
        console.log('\nPermiso:');
        Object.keys(row).forEach(key => {
          console.log(`- ${key}: ${row[key]}`);
        });
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAllUsers();
