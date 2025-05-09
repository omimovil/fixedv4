const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tablas que necesitamos migrar
const TABLES_TO_MIGRATE = [
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

async function verifyStructure() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\nVerificando estructura de tablas en SQLite...');
    
    for (const tableName of TABLES_TO_MIGRATE) {
      console.log(`\nTabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const columns = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      console.log('Columnas:');
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
      
      // Obtener datos
      const data = await new Promise((resolve, reject) => {
        db.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      console.log(`Total registros: ${data[0].count}`);
    }
    
    db.close();
    console.log('\nVerificación de estructura completada');
  } catch (error) {
    console.error('Error al verificar estructura:', error);
  }
}

verifyStructure();
