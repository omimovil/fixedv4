const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixUserReferences() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Corrigiendo Referencias de Usuarios ===');
    
    // 1. Obtener todos los usuarios existentes
    const users = await pgPool.query('SELECT id, username FROM strapi_users ORDER BY id');
    console.log(`\nEncontrados ${users.rows.length} usuarios en PostgreSQL:`);
    users.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}`);
    });
    
    // 2. Verificar las referencias en shopping_carts_author_id_lnk
    const links = await pgPool.query(`
      SELECT id, shopping_cart_id, user_id 
      FROM shopping_carts_author_id_lnk 
      ORDER BY id
    `);
    
    console.log(`\nEncontradas ${links.rows.length} referencias en shopping_carts_author_id_lnk:`);
    
    // 3. Crear un usuario dummy para referencias inválidas
    console.log('\n=== Creando usuario dummy ===');
    const dummyUser = await pgPool.query(`
      INSERT INTO strapi_users (
        username, email, provider, confirmed, blocked, role,
        created_at, updated_at
      ) VALUES (
        'user_fix_2025', 'user_fix_2025@ominey.com', 'local', true, false, 1,
        NOW(), NOW()
      ) RETURNING id
    `);
    const dummyUserId = dummyUser.rows[0].id;
    console.log(`Usuario dummy creado con ID: ${dummyUserId}`);
    
    // 4. Actualizar referencias inválidas
    console.log('\n=== Actualizando referencias inválidas ===');
    await pgPool.query(`
      UPDATE shopping_carts_author_id_lnk 
      SET user_id = $1 
      WHERE user_id NOT IN (SELECT id FROM strapi_users)
    `, [dummyUserId]);
    
    // 5. Verificar las referencias después de la corrección
    console.log('\n=== Verificando referencias después de la corrección ===');
    const invalidLinks = await pgPool.query(`
      SELECT id, shopping_cart_id, user_id 
      FROM shopping_carts_author_id_lnk 
      WHERE user_id NOT IN (SELECT id FROM strapi_users)
    `);
    
    if (invalidLinks.rows.length > 0) {
      console.log(`\n¡Error! Aún hay ${invalidLinks.rows.length} referencias inválidas:`);
      invalidLinks.rows.forEach(link => {
        console.log(`- ID: ${link.id}, shopping_cart_id: ${link.shopping_cart_id}, user_id: ${link.user_id}`);
      });
    } else {
      console.log('\n¡Perfecto! Todas las referencias están válidas');
    }
    
    pgPool.end();
    
    console.log('\n=== Proceso de corrección completado ===');
  } catch (error) {
    console.error('Error en la corrección:', error);
  }
}

fixUserReferences();
