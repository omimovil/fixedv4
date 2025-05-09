const sqlite3 = require('sqlite3').verbose();

async function findUsers() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');
    
    console.log('\n=== Buscando Usuarios ===');
    
    // Buscar en todas las tablas que puedan contener usuarios
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    console.log('\nTablas que pueden contener usuarios:');
    
    // Tablas que podrían contener información de usuarios
    const userTables = tables.filter(table => 
      table.includes('user') || 
      table.includes('admin') || 
      table.includes('customer')
    );
    
    for (const table of userTables) {
      console.log(`\n=== Verificando ${table} ===`);
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table} ORDER BY id LIMIT 5`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      if (rows.length > 0) {
        console.log(`\nEncontrados ${rows.length} registros:`);
        rows.forEach(row => {
          console.log('\nRegistro:');
          Object.keys(row).forEach(key => {
            console.log(`- ${key}: ${row[key]}`);
          });
        });
      }
    }
    
    // Verificar referencias en las marcas
    console.log('\n=== Verificando marcas y sus creadores ===');
    const brands = await new Promise((resolve, reject) => {
      db.all(`
        SELECT b.*, u.username as creator_username 
        FROM brands b
        LEFT JOIN strapi_users u ON b.created_by_id = u.id
        ORDER BY b.id
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`\nEncontradas ${brands.length} marcas:`);
    brands.forEach(brand => {
      console.log(`\nMarca ID: ${brand.id}`);
      console.log(`- Nombre: ${brand.name}`);
      console.log(`- Creado por: ${brand.creator_username} (ID: ${brand.created_by_id})`);
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

findUsers();
