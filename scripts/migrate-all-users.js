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

async function migrateAllUsers() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración de Todos los Usuarios ===');
    
    // 1. Obtener usuarios de up_users
    console.log('\n=== Migrando usuarios de up_users ===');
    const upUsers = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM up_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    // 2. Obtener usuarios de admin_users
    console.log('\n=== Migrando usuarios de admin_users ===');
    const adminUsers = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM admin_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    // 3. Crear una tabla temporal para los usuarios
    console.log('\n=== Creando tabla temporal ===');
    await pgPool.query(`
      CREATE TEMP TABLE temp_users (
        id INTEGER PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255),
        provider VARCHAR(255),
        confirmed BOOLEAN,
        blocked BOOLEAN,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        role INTEGER
      )
    `);
    
    // 4. Insertar usuarios de up_users
    console.log('\n=== Insertando usuarios de up_users ===');
    for (const user of upUsers) {
      // Intentar insertar el usuario
      try {
        await pgPool.query(`
          INSERT INTO temp_users (
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
    
    // 5. Insertar usuarios de admin_users
    console.log('\n=== Insertando usuarios de admin_users ===');
    for (const user of adminUsers) {
      // Intentar insertar el usuario
      try {
        await pgPool.query(`
          INSERT INTO temp_users (
            id, username, email, provider, confirmed, blocked, created_at, updated_at, role
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
        `, [
          user.id,
          user.username || user.firstname,
          user.email,
          user.provider || 'local',
          user.is_active,
          user.blocked,
          new Date(user.created_at).toISOString(),
          new Date(user.updated_at).toISOString(),
          1 // Asignar rol de Administrador
        ]);
        console.log(`Usuario ${user.firstname} (ID: ${user.id}) insertado correctamente`);
      } catch (error) {
        if (error.code === '23505') {
          console.log(`Usuario ${user.firstname} (ID: ${user.id}) ya existe, omitiendo...`);
        } else {
          console.error(`Error al insertar usuario ${user.firstname}:`, error);
        }
      }
    }
    
    // 6. Eliminar usuarios existentes (excepto admin)
    console.log('\n=== Eliminando usuarios existentes ===');
    
    // Primero obtener los IDs de los usuarios existentes
    const existingUsers = await pgPool.query(`
      SELECT id FROM strapi_users
    `);
    
    // Eliminar usuarios uno por uno para evitar problemas con referencias
    for (const user of existingUsers.rows) {
      if (user.id !== 1) { // Mantener el usuario admin
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
    }
    
    // 7. Mover usuarios de la tabla temporal a strapi_users
    console.log('\n=== Migrando usuarios finales ===');
    await pgPool.query(`
      INSERT INTO strapi_users (
        id, username, email, provider, confirmed, blocked, created_at, updated_at, role
      )
      SELECT 
        id, username, email, provider, confirmed, blocked, created_at, updated_at, role
      FROM temp_users
    `);
    
    // 8. Limpiar la tabla temporal
    console.log('\n=== Limpiando tabla temporal ===');
    await pgPool.query('DROP TABLE temp_users');
    
    // 9. Verificar los usuarios migrados
    console.log('\n=== Verificando usuarios migrados ===');
    const migratedUsers = await pgPool.query('SELECT id, username, email FROM strapi_users ORDER BY id');
    console.log(`\nEncontrados ${migratedUsers.rows.length} usuarios:`);
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

migrateAllUsers();
