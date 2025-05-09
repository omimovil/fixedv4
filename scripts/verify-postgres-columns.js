const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyPostgresColumns() {
  try {
    const pgPool = new Pool(pgConfig);

    const tables = ['products', 'categories', 'brands', 'colors', 'sizes', 'products_colors', 'products_sizes', 'products_images'];

    for (const table of tables) {
      console.log(`\n=== Columnas de ${table} ===`);
      const result = await pgPool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      result.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
      });
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar columnas:', error);
  }
}

verifyPostgresColumns();
