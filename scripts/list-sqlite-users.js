const sqlite3 = require('sqlite3').verbose();

async function listSQLiteUsers() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');
    
    console.log('\n=== Listando Usuarios en SQLite ===');
    
    // Verificar si la tabla existe
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    console.log('\nTablas en la base de datos:');
    tables.forEach(table => {
      console.log(`- ${table}`);
    });
    
    // Verificar estructura de la tabla strapi_users
    console.log('\n=== Estructura de strapi_users ===');
    const columns = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(strapi_users)', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log('\nColumnas de strapi_users:');
    columns.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    
    // Listar todos los usuarios
    console.log('\n=== Usuarios ===');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`\nEncontrados ${users.length} usuarios:`);
    users.forEach(user => {
      console.log('\nUsuario:');
      Object.keys(user).forEach(key => {
        console.log(`- ${key}: ${user[key]}`);
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listSQLiteUsers();
