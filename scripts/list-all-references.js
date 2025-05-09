const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function listAllReferences() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Listando Todas las Referencias ===');
    
    // 1. Listar usuarios existentes
    console.log('\n=== Usuarios ===');
    const users = await pgPool.query('SELECT id, username, email FROM strapi_users ORDER BY id');
    console.log(`\nEncontrados ${users.rows.length} usuarios:`);
    users.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // 2. Listar carritos y sus relaciones
    console.log('\n=== Carritos y sus Relaciones ===');
    const carts = await pgPool.query(`
      SELECT 
        c.id as cart_id,
        c.costumer_id,
        l.id as link_id,
        l.user_id
      FROM shopping_carts c
      LEFT JOIN shopping_carts_author_id_lnk l ON c.id = l.shopping_cart_id
      ORDER BY c.id
    `);
    
    console.log(`\nEncontrados ${carts.rows.length} carritos:`);
    carts.rows.forEach(cart => {
      console.log(`\nCarrito ID: ${cart.cart_id}`);
      console.log(`- costumer_id: ${cart.costumer_id}`);
      console.log(`- Link ID: ${cart.link_id}`);
      console.log(`- user_id: ${cart.user_id}`);
    });
    
    // 3. Verificar referencias inválidas
    console.log('\n=== Referencias Inválidas ===');
    
    // Carritos con costumer_id inválido
    const invalidCostumers = await pgPool.query(`
      SELECT c.id as cart_id, c.costumer_id 
      FROM shopping_carts c
      WHERE c.costumer_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM strapi_users u WHERE u.id = c.costumer_id
      )
      ORDER BY c.id
    `);
    
    if (invalidCostumers.rows.length > 0) {
      console.log(`\nCarritos con costumer_id inválido (${invalidCostumers.rows.length}):`);
      invalidCostumers.rows.forEach(cart => {
        console.log(`- Carrito ID: ${cart.cart_id}, costumer_id: ${cart.costumer_id}`);
      });
    }
    
    // Links con user_id inválido
    const invalidLinks = await pgPool.query(`
      SELECT l.id as link_id, l.shopping_cart_id, l.user_id
      FROM shopping_carts_author_id_lnk l
      WHERE l.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM strapi_users u WHERE u.id = l.user_id
      )
      ORDER BY l.id
    `);
    
    if (invalidLinks.rows.length > 0) {
      console.log(`\nLinks con user_id inválido (${invalidLinks.rows.length}):`);
      invalidLinks.rows.forEach(link => {
        console.log(`- Link ID: ${link.link_id}, shopping_cart_id: ${link.shopping_cart_id}, user_id: ${link.user_id}`);
      });
    }
    
    pgPool.end();
    
    console.log('\n=== Análisis Completo ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

listAllReferences();
