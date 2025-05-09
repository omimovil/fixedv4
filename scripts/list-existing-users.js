const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function listExistingUsers() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Usuarios Existentes ===');
    
    // Obtener todos los usuarios
    const users = await pgPool.query(`
      SELECT id, username, email FROM strapi_users
      ORDER BY id
    `);
    
    console.log(`\nEncontrados ${users.rows.length} usuarios:`);
    users.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // Verificar referencias en shopping_carts_author_id_lnk
    console.log('\n=== Referencias en shopping_carts_author_id_lnk ===');
    const references = await pgPool.query(`
      SELECT DISTINCT user_id
      FROM shopping_carts_author_id_lnk
      WHERE user_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nReferencias pendientes (${references.rows.length}):`);
    references.rows.forEach(ref => {
      console.log(`- User ID: ${ref.user_id}`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

listExistingUsers();
