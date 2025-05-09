const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyShoppingCarts() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificando Carritos de Compra ===');
    
    // Verificar referencias problemáticas en carritos
    const invalidCarts = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM shopping_carts
      WHERE created_by_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nNúmero de carritos con referencias inválidas: ${invalidCarts.rows[0].count}`);
    
    // Verificar referencias en shopping_carts_author_id_lnk
    const invalidLinks = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM shopping_carts_author_id_lnk
      WHERE user_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nNúmero de referencias inválidas en shopping_carts_author_id_lnk: ${invalidLinks.rows[0].count}`);
    
    // Obtener información de las referencias en shopping_carts_author_id_lnk
    const cartLinks = await pgPool.query(`
      SELECT 
        c.id as cart_id,
        l.user_id,
        u.username as user_username
      FROM shopping_carts_author_id_lnk l
      JOIN shopping_carts c ON l.shopping_cart_id = c.id
      LEFT JOIN strapi_users u ON l.user_id = u.id
      ORDER BY c.id
    `);
    
    console.log(`\nEncontradas ${cartLinks.rows.length} relaciones de carrito:`);
    cartLinks.rows.forEach(link => {
      console.log(`\nCarrito ID: ${link.cart_id}`);
      console.log(`- Nombre: ${link.cart_name}`);
      console.log(`- Usuario ID: ${link.user_id}`);
      console.log(`- Usuario: ${link.user_username}`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error al verificar carritos:', error);
  }
}

verifyShoppingCarts();
