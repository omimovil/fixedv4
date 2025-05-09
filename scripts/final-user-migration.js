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

async function migrateUsers() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración de Usuarios ===');
    
    // 1. Obtener usuarios de SQLite
    console.log('\n=== Obteniendo usuarios de SQLite ===');
    const upUsers = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM up_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    // 2. Crear un usuario dummy para referencias
    console.log('\n=== Creando usuario dummy ===');
    const dummyUserId = await pgPool.query(`
      INSERT INTO strapi_users (
        username, email, provider, confirmed, blocked,
        created_at, updated_at, role
      ) VALUES (
        'dummy_user_migration', 'dummy_migration@user.com', 'local', 
        true, false,
        NOW(), NOW(), 1
      )
      RETURNING id
    `);
    
    const dummyId = dummyUserId.rows[0].id;
    console.log(`\nUsuario dummy creado con ID: ${dummyId}`);
    
    // 3. Actualizar referencias problemáticas
    console.log('\n=== Actualizando referencias problemáticas ===');
    await pgPool.query(`
      UPDATE shopping_carts_author_id_lnk
      SET user_id = $1
      WHERE user_id NOT IN (
        SELECT id FROM strapi_users
      )
    `, [dummyId]);
    
    // 4. Eliminar usuarios existentes (excepto admin)
    console.log('\n=== Eliminando usuarios existentes ===');
    const existingUsers = await pgPool.query(`
      SELECT id FROM strapi_users
      WHERE id != 1
    `);
    
    for (const user of existingUsers.rows) {
      try {
        await pgPool.query(`
          DELETE FROM strapi_users 
          WHERE id = $1
        `, [user.id]);
        console.log(`Usuario con ID ${user.id} eliminado correctamente`);
      } catch (error) {
        console.error(`Error al eliminar usuario con ID ${user.id}:`, error);
      }
    }
    
    // 5. Insertar usuarios de SQLite
    console.log('\n=== Insertando usuarios de SQLite ===');
    for (const user of upUsers) {
      try {
        await pgPool.query(`
          INSERT INTO strapi_users (
            id, username, email, provider, confirmed, blocked, created_at, updated_at, role
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
        `, [
          user.id,
          user.username,
          user.email,
          user.provider,
          user.confirmed,
          user.blocked,
          new Date(user.created_at).toISOString(),
          new Date(user.updated_at).toISOString(),
          1 // Asignar rol de Administrador
        ]);
        console.log(`Usuario ${user.username} (ID: ${user.id}) insertado correctamente`);
      } catch (error) {
        if (error.code === '23505') {
          console.log(`Usuario ${user.username} (ID: ${user.id}) ya existe, omitiendo...`);
        } else {
          console.error(`Error al insertar usuario ${user.username}:`, error);
        }
      }
    }
    
    // 6. Verificar la migración
    console.log('\n=== Verificando migración ===');
    const migratedUsers = await pgPool.query('SELECT id, username, email FROM strapi_users ORDER BY id');
    console.log(`\nEncontrados ${migratedUsers.rows.length} usuarios migrados:`);
    migratedUsers.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración completada exitosamente ===');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

migrateUsers();
