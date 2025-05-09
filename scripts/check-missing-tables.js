const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkMissingTables() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n=== Tablas en SQLite ===');
    
    // Obtener todas las tablas de SQLite
    const sqliteTables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    // Tablas que ya hemos migrado
    const migratedTables = new Set([
      'strapi_users',
      'strapi_roles',
      'admin_users',
      'admin_users_roles',
      'up_users',
      'up_roles',
      'up_users_role',
      'brands',
      'categories',
      'colors',
      'delivery_dates',
      'orders',
      'payment_methods',
      'products',
      'shipping_states',
      'sizes',
      'available_categories',
      'personal_addresses',
      'addresses',
      'purchases',
      'ratings',
      'reviews',
      'shopping_carts',
      'shippings',
      'products_sub_categories',
      'products_colors',
      'products_sizes',
      'products_brands',
      'products_delivery_dates',
      'products_payment_methods',
      'products_shipping_states'
    ]);
    
    console.log('\n=== Tablas que faltan migrar ===');
    sqliteTables.forEach(tableName => {
      if (!migratedTables.has(tableName)) {
        console.log(`- ${tableName}`);
        
        // Mostrar información adicional sobre la tabla
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          if (err) {
            console.error(`Error al obtener columnas de ${tableName}:`, err);
            return;
          }
          
          if (columns.length > 0) {
            console.log('  Columnas:');
            columns.forEach(col => {
              console.log(`  - ${col.name} (${col.type})`);
            });
          }
        });
      }
    });
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMissingTables();
