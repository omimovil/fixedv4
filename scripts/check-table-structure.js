const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function checkTableStructure() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificando Estructura de Tablas ===');
    
    // Verificar estructura de strapi_users
    console.log('\n=== Estructura de strapi_users ===');
    const strapiUsersColumns = await pgPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'strapi_users'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumnas de strapi_users:');
    strapiUsersColumns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar estructura de shopping_carts_author_id_lnk
    console.log('\n=== Estructura de shopping_carts_author_id_lnk ===');
    const shoppingCartsColumns = await pgPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shopping_carts_author_id_lnk'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumnas de shopping_carts_author_id_lnk:');
    shoppingCartsColumns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error al verificar estructura:', error);
  }
}

checkTableStructure();
