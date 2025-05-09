const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function verifySQLiteData() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Verificando datos de SQLite ===\n');
    
    // Verificar roles
    console.log('=== Roles ===');
    await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_roles', (err, rows) => {
        if (err) {
          console.error('Error al obtener roles:', err);
          resolve();
          return;
        }
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Nombre: ${row.name}, Tipo: ${row.type}`);
        });
        resolve();
      });
    });
    
    // Verificar usuarios
    console.log('\n=== Usuarios ===');
    await new Promise((resolve, reject) => {
      db.all('SELECT * FROM strapi_users', (err, rows) => {
        if (err) {
          console.error('Error al obtener usuarios:', err);
          resolve();
          return;
        }
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Email: ${row.email}, Rol: ${row.role}, Provider: ${row.provider}`);
        });
        resolve();
      });
    });
    
    // Verificar tablas de contenido
    const contentTables = [
      'address',
      'brands',
      'categories',
      'colors',
      'contact_addresses',
      'countries',
      'delivery_dates',
      'favorite_products',
      'orders',
      'payment_methods',
      'payments',
      'personal_addresses',
      'products',
      'purchases',
      'ratings',
      'reviews',
      'shipping_states',
      'shopping_carts',
      'sizes'
    ];
    
    for (const table of contentTables) {
      console.log(`\n=== ${table} ===`);
      
      // Contar registros
      await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (err) {
            console.error(`Error al contar registros en ${table}:`, err);
            resolve();
            return;
          }
          console.log(`Total registros: ${row.count}`);
          resolve();
        });
      });
      
      // Verificar referencias a usuarios
      console.log('\nReferencias a usuarios:');
      await new Promise((resolve, reject) => {
        db.all(`
          SELECT DISTINCT created_by_id, COUNT(*) as count 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL 
          GROUP BY created_by_id
        `, (err, rows) => {
          if (err) {
            console.error(`Error al verificar referencias en ${table}:`, err);
            resolve();
            return;
          }
          if (rows && rows.length > 0) {
            rows.forEach(row => {
              console.log(`- ID: ${row.created_by_id}, Conteo: ${row.count}`);
            });
          } else {
            console.log('No hay referencias de created_by_id');
          }
          resolve();
        });
      });
    }
    
    db.close();
    console.log('\nVerificación completada');
  } catch (error) {
    console.error('Error general:', error);
  }
}

verifySQLiteData();
