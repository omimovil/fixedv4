const sqlite3 = require('sqlite3').verbose();

async function verifySQLiteUsers() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');
    
    console.log('\n=== Verificando Usuarios en SQLite ===');
    
    // Obtener información de usuarios
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`\nEncontrados ${users.length} usuarios:`);
    users.forEach(user => {
      console.log(`\nUsuario ID: ${user.id}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Created_at: ${user.created_at}`);
    });
    
    // Verificar marcas y sus creadores en SQLite
    console.log('\n=== Verificando Marcas y sus Creadores en SQLite ===');
    const brands = await new Promise((resolve, reject) => {
      db.all(`
        SELECT b.id, b.name, b.created_by_id, u.username as creator_username 
        FROM brands b
        LEFT JOIN strapi_users u ON b.created_by_id = u.id
        ORDER BY b.id
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

verifySQLiteUsers();
