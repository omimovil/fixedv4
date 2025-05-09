const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function handleReferences() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Manejando Referencias ===');
    
    // 1. Crear un usuario dummy para las referencias
    console.log('\n=== Creando usuario dummy ===');
    await pgPool.query(`
      INSERT INTO strapi_users (
        username, email, provider, confirmed, blocked,
        created_at, updated_at, role
      ) VALUES (
        'dummy_user', 'dummy_user_ref@ref.com', 'local', 
        true, false,
        NOW(), NOW(), 1
      )
      RETURNING id
    `);
    
    // 2. Actualizar las referencias en shopping_carts_author_id_lnk
    console.log('\n=== Actualizando referencias en shopping_carts_author_id_lnk ===');
    const dummyUserId = await pgPool.query(`
      SELECT id FROM strapi_users WHERE username = 'dummy_user'
    `);
    
    if (dummyUserId.rows.length > 0) {
      const userId = dummyUserId.rows[0].id;
      await pgPool.query(`
        UPDATE shopping_carts_author_id_lnk
        SET user_id = $1
        WHERE user_id NOT IN (
          SELECT id FROM strapi_users
        )
      `, [userId]);
      
      // Verificar las referencias actualizadas
      console.log('\n=== Verificando referencias ===');
      const remainingReferences = await pgPool.query(`
        SELECT COUNT(*) as count
        FROM shopping_carts_author_id_lnk
        WHERE user_id NOT IN (
          SELECT id FROM strapi_users
        )
      `);
      
      console.log(`\nQuedan ${remainingReferences.rows[0].count} referencias pendientes`);
    } else {
      console.error('No se encontró el usuario dummy');
    }
    
    // 3. Verificar las referencias actualizadas
    console.log('\n=== Verificando referencias ===');
    const remainingReferences = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM shopping_carts_author_id_lnk
      WHERE user_id NOT IN (
        SELECT id FROM temp_users
      )
    `);
    
    console.log(`\nQuedan ${remainingReferences.rows[0].count} referencias pendientes`);
    
    pgPool.end();
    console.log('\n=== Manejo de referencias completado ===');
  } catch (error) {
    console.error('Error al manejar referencias:', error);
  }
}

handleReferences();
