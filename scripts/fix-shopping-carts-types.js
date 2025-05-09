const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixShoppingCartsTypes() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Corrigiendo tipos de datos en shopping_carts ===');
    
    // 1. Crear una nueva columna temporal con el tipo correcto
    console.log('\n=== Creando columna temporal ===');
    await pgPool.query(`
      ALTER TABLE shopping_carts 
      ADD COLUMN temp_customer_id INTEGER
    `);
    
    // 2. Mover los datos de la columna original a la temporal
    console.log('\n=== Moviendo datos a columna temporal ===');
    await pgPool.query(`
      UPDATE shopping_carts 
      SET temp_customer_id = CAST(costumer_id AS INTEGER)
      WHERE costumer_id IS NOT NULL
    `);
    
    // 3. Eliminar la columna original
    console.log('\n=== Eliminando columna original ===');
    await pgPool.query(`
      ALTER TABLE shopping_carts 
      DROP COLUMN costumer_id
    `);
    
    // 4. Renombrar la columna temporal a la original
    console.log('\n=== Renombrando columna temporal ===');
    await pgPool.query(`
      ALTER TABLE shopping_carts 
      RENAME COLUMN temp_customer_id TO costumer_id
    `);
    
    // 5. Verificar los datos
    console.log('\n=== Verificando datos ===');
    const data = await pgPool.query(`
      SELECT id, costumer_id 
      FROM shopping_carts 
      WHERE costumer_id IS NOT NULL 
      ORDER BY id LIMIT 5
    `);
    
    console.log('\nDatos de ejemplo (primeros 5 registros):');
    data.rows.forEach(row => {
      console.log(`- ID: ${row.id}, costumer_id: ${row.costumer_id}`);
    });
    
    // 6. Crear índice para mejorar el rendimiento
    console.log('\n=== Creando índice ===');
    await pgPool.query(`
      CREATE INDEX idx_shopping_carts_costumer_id ON shopping_carts(costumer_id)
    `);
    
    pgPool.end();
    
    console.log('\n=== Tipos de datos corregidos exitosamente ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixShoppingCartsTypes();
