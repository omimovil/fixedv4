const sqlite3 = require('sqlite3').verbose();

// Crear la base de datos en memoria
const db = new sqlite3.Database(':memory:');

// Definir las tablas
const TABLES = [
  {
    name: 'strapi_users',
    schema: `
      CREATE TABLE strapi_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        provider VARCHAR(255) DEFAULT 'local',
        confirmed BOOLEAN DEFAULT false,
        blocked BOOLEAN DEFAULT false,
        role INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'strapi_roles',
    schema: `
      CREATE TABLE strapi_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        type VARCHAR(255) UNIQUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  // Agregar más tablas según sea necesario
];

// Crear las tablas
TABLES.forEach(table => {
  db.serialize(() => {
    db.run(table.schema, function(err) {
      if (err) {
        console.error(`Error creating table ${table.name}:`, err);
      } else {
        console.log(`Created table ${table.name}`);
      }
    });
  });
});

// Cerrar la conexión
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
