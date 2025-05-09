const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function listUsersAndRoles() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Roles ===');
    await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_roles ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error al obtener roles:', err);
          resolve();
          return;
        }
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Nombre: ${row.name}, Tipo: ${row.type}, Descripción: ${row.description}`);
        });
        resolve();
      });
    });
    
    console.log('\n=== Usuarios ===');
    await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_users ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error al obtener usuarios:', err);
          resolve();
          return;
        }
        rows.forEach(row => {
          console.log(`
ID: ${row.id}
Email: ${row.email}
Username: ${row.username}
Provider: ${row.provider}
Confirmed: ${row.confirmed}
Blocked: ${row.blocked}
Rol: ${row.role}
Created at: ${new Date(row.created_at).toISOString()}
Updated at: ${new Date(row.updated_at).toISOString()}
`);
        });
        resolve();
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsersAndRoles();
