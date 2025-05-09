const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
});

const TABLES = [
  'strapi_roles',
  'strapi_users',
  'strapi_webhooks',
  'strapi_files',
  'strapi_file_morph',
  'address',
  'available_categories',
  'brands',
  'categories',
  'colors',
  'contact_addresses',
  'cookies',
  'cookie_categories',
  'cookie_popups',
  'customers',
  'countries',
  'delivery_dates',
  'favorite_products',
  'orders',
  'payment_methods',
  'payments',
  'personal_addresses',
  'product_in_cart',
  'products',
  'purchases',
  'ratings',
  'reviews',
  'shipping',
  'shipping_states',
  'shopping_carts',
  'sizes'
];

async function createTables() {
  try {
    const client = await pool.connect();
    
    for (const table of TABLES) {
      console.log(`\nCreando tabla: ${table}`);
      
      // Obtener la estructura de la tabla en SQLite
      const sqliteColumns = await new Promise((resolve, reject) => {
        const sqliteDb = require('sqlite3').verbose().Database('.tmp/data.db');
        sqliteDb.all(`PRAGMA table_info(${table})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });

      // Construir la definición de la tabla
      const columns = sqliteColumns.map(col => {
        let type = col.type.toLowerCase();
        let definition = `${col.name} ${type}`;
        
        // Agregar restricciones especiales
        if (col.name === 'id') {
          definition += ' SERIAL PRIMARY KEY';
        }
        if (col.name.includes('_at')) {
          definition += ' TIMESTAMP';
        }
        if (col.name === 'created_by_id' || col.name === 'updated_by_id') {
          definition += ' INTEGER REFERENCES strapi_users(id)';
        }
        
        return definition;
      }).join(', ');

      // Agregar campos de auditoría
      const auditColumns = 'created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NOT NULL';
      
      // Crear la tabla
      const createQuery = `CREATE TABLE ${table} (${columns}, ${auditColumns})`;
      await client.query(createQuery);
      console.log(`Tabla ${table} creada exitosamente`);
    }
    
    console.log('\nTodas las tablas han sido creadas exitosamente');
    
  } catch (error) {
    console.error('Error creando las tablas:', error);
  } finally {
    pool.end();
  }
}

createTables();
