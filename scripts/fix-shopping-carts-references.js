const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixShoppingCartsReferences() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Corrigiendo Referencias de Carritos ===');
    
    // 1. Verificar usuarios existentes en PostgreSQL
    console.log('\n=== Verificando usuarios existentes ===');
    const pgUsers = await pgPool.query('SELECT id FROM strapi_users');
    const existingUserIds = new Set(pgUsers.rows.map(row => row.id));
    
    console.log(`Usuarios existentes: ${Array.from(existingUserIds).join(', ')}`);
    
    // 2. Verificar carritos con referencias inválidas
    console.log('\n=== Verificando carritos con referencias inválidas ===');
    const invalidCarts = await pgPool.query(`
      SELECT id, costumer_id 
      FROM shopping_carts 
      WHERE costumer_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM strapi_users WHERE id = shopping_carts.costumer_id
      )
    `);
    
    if (invalidCarts.rows.length > 0) {
      console.log(`\nEncontrados ${invalidCarts.rows.length} carritos con referencias inválidas:`);
      invalidCarts.rows.forEach(cart => {
        console.log(`- Carrito ID: ${cart.id}, customer_id: ${cart.customer_id}`);
      });
      
      // Crear un usuario dummy si no existe
      const adminClient = await pgPool.connect();
      try {
        // Verificar si ya existe un usuario dummy
        const dummyExists = await adminClient.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM strapi_users 
            WHERE email = 'dummy@user.com'
          )
        `);
        
        if (!dummyExists.rows[0].exists) {
          // Crear el usuario dummy
          await adminClient.query(`
            INSERT INTO strapi_users (
              username, email, provider, confirmed, blocked, role,
              created_at, updated_at
            ) VALUES (
              'dummy', 'dummy@user.com', 'local', true, false, 1,
              NOW(), NOW()
            )
          `);
          console.log('Usuario dummy creado exitosamente');
        } else {
          console.log('Usuario dummy ya existe');
        }
      } finally {
        adminClient.release();
      }
      
      // Obtener el ID del usuario dummy
      const dummyUser = await pgPool.query(`
        SELECT id FROM strapi_users WHERE email = 'dummy@user.com'
      `);
      const dummyUserId = dummyUser.rows[0].id;
      
      // Actualizar los carritos con referencias inválidas
      const updateClient = await pgPool.connect();
      try {
        for (const cart of invalidCarts.rows) {
          await updateClient.query(`
            UPDATE shopping_carts 
            SET costumer_id = $1 
            WHERE id = $2
          `, [dummyUserId, cart.id]);
          console.log(`Actualizado carrito ID: ${cart.id} con usuario dummy`);
        }
      } finally {
        updateClient.release();
      }
    } else {
      console.log('No se encontraron carritos con referencias inválidas');
    }
    
    // 3. Migrar las relaciones de carritos
    console.log('\n=== Migrando relaciones de carritos ===');
    const links = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM shopping_carts_author_id_lnk ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    const linkClient = await pgPool.connect();
    try {
      for (const link of links) {
        // Verificar si el usuario existe
        const userExists = await pgPool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM strapi_users 
            WHERE id = $1
          )`, [link.user_id]);
          
        if (!userExists.rows[0].exists) {
          // Usar el usuario dummy si no existe
          const dummyUser = await pgPool.query(`
            SELECT id FROM strapi_users WHERE email = 'dummy@user.com'
          `);
          
          await linkClient.query(`
            INSERT INTO shopping_carts_author_id_lnk (
              id, shopping_cart_id, user_id
            ) VALUES ($1, $2, $3)
          `, [
            link.id,
            link.shopping_cart_id,
            dummyUser.rows[0].id
          ]);
          console.log(`Migrada relación carrito-usuario ID: ${link.id} (usando usuario dummy)`);
        } else {
          await linkClient.query(`
            INSERT INTO shopping_carts_author_id_lnk (
              id, shopping_cart_id, user_id
            ) VALUES ($1, $2, $3)
          `, [
            link.id,
            link.shopping_cart_id,
            link.user_id
          ]);
          console.log(`Migrada relación carrito-usuario ID: ${link.id}`);
        }
      }
    } finally {
      linkClient.release();
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Referencias corregidas y migración completada ===');
  } catch (error) {
    console.error('Error en la corrección:', error);
  }
}

fixShoppingCartsReferences();
