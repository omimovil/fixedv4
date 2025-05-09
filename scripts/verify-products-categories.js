const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyProductsCategories() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando estructura de products_categories ===');
    const columns = await pgPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products_categories'
      ORDER BY ordinal_position
    `);

    console.log('\nColumnas de products_categories:');
    columns.rows.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type})`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar columnas:', error);
  }
}

verifyProductsCategories();
