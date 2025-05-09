const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function listData() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    // Verificar roles
    console.log('\n=== Roles ===');
    db.all('SELECT * FROM strapi_roles', (err, rows) => {
      if (err) {
        console.error('Error al obtener roles:', err);
        return;
      }
      if (rows.length === 0) {
        console.log('No hay roles en la base de datos');
      } else {
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Nombre: ${row.name}, Tipo: ${row.type}`);
        });
      }
    });
    
    // Verificar usuarios
    console.log('\n=== Usuarios ===');
    db.all('SELECT * FROM strapi_users', (err, rows) => {
      if (err) {
        console.error('Error al obtener usuarios:', err);
        return;
      }
      if (rows.length === 0) {
        console.log('No hay usuarios en la base de datos');
      } else {
        rows.forEach(row => {
          console.log(`
ID: ${row.id}
Email: ${row.email}
Username: ${row.username}
Provider: ${row.provider}
Role: ${row.role}
`);
        });
      }
    });
    
    // Verificar datos de contenido
    const contentTables = [
      'brands',
      'categories',
      'colors',
      'delivery_dates',
      'orders',
      'payment_methods',
      'products',
      'shipping_states',
      'sizes'
    ];
    
    for (const table of contentTables) {
      console.log(`\n=== ${table} ===`);
      db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
        if (err) {
          console.error(`Error al contar registros en ${table}:`, err);
          return;
        }
        console.log(`Total registros: ${row.count}`);
      });
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listData();
