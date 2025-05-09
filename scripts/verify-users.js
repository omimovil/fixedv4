const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos SQLite
const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new sqlite3.Database(dbPath);

// Verificar usuarios en SQLite
console.log('\nUsuarios en SQLite:');
db.all('SELECT * FROM strapi_users', [], (err, rows) => {
  if (err) {
    console.error('Error al obtener usuarios de SQLite:', err);
    return;
  }
  console.log(`Total usuarios en SQLite: ${rows.length}`);
  rows.forEach(row => {
    console.log(`- ID: ${row.id}, Email: ${row.email}, Role: ${row.role}`);
  });

  // Verificar roles en SQLite
  console.log('\n\nRoles en SQLite:');
  db.all('SELECT * FROM strapi_roles', [], (err, roles) => {
    if (err) {
      console.error('Error al obtener roles de SQLite:', err);
      return;
    }
    console.log(`Total roles en SQLite: ${roles.length}`);
    roles.forEach(role => {
      console.log(`- ID: ${role.id}, Name: ${role.name}, Type: ${role.type}`);
    });

    // Cerrar la conexión
    db.close();
  });
});
