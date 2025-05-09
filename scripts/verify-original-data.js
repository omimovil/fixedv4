const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function verifyOriginalData() {
  try {
    // Verificar si existe la base de datos original
    const originalDbPath = path.join(__dirname, '../data.db');
    if (!fs.existsSync(originalDbPath)) {
      console.log('No se encontró la base de datos original');
      return;
    }
    
    console.log(`\n=== Verificando base de datos original en: ${originalDbPath} ===`);
    const db = new sqlite3.Database(originalDbPath);
    
    // Verificar tablas
    console.log('\n=== Tablas ===');
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
      if (err) {
        console.error('Error al listar tablas:', err);
        return;
      }
      rows.forEach(row => {
        console.log(`Tabla: ${row.name}`);
        // Verificar columnas
        db.all(`PRAGMA table_info(${row.name})`, (err, columns) => {
          if (err) {
            console.error(`Error al obtener columnas de ${row.name}:`, err);
            return;
          }
          console.log('Columnas:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
        });
      });
    });
    
    // Verificar datos de roles
    console.log('\n=== Datos de roles ===');
    db.all('SELECT * FROM strapi_roles', (err, roles) => {
      if (err) {
        console.error('Error al obtener roles:', err);
        return;
      }
      console.log(`Total roles: ${roles.length}`);
      roles.forEach(role => {
        console.log(`ID: ${role.id}, Nombre: ${role.name}, Tipo: ${role.type}`);
      });
    });
    
    // Verificar datos de usuarios
    console.log('\n=== Datos de usuarios ===');
    db.all('SELECT * FROM strapi_users', (err, users) => {
      if (err) {
        console.error('Error al obtener usuarios:', err);
        return;
      }
      console.log(`Total usuarios: ${users.length}`);
      users.forEach(user => {
        console.log(`ID: ${user.id}, Email: ${user.email}, Rol: ${user.role}`);
      });
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyOriginalData();
