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

async function safeMigrateUsers() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración Segura de Usuarios ===');
    
    // 1. Obtener todos los usuarios de SQLite
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`\nEncontrados ${users.length} usuarios en SQLite:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // 2. Crear una tabla temporal para los nuevos usuarios
    console.log('\n=== Creando tabla temporal ===');
    await pgPool.query(`
      CREATE TEMP TABLE temp_users (
        id INTEGER PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255),
        provider VARCHAR(255),
        password TEXT,
        reset_password_token TEXT,
        confirmation_token TEXT,
        confirmed BOOLEAN,
        blocked BOOLEAN,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        created_by_id INTEGER,
        updated_by_id INTEGER,
        lastname VARCHAR(255),
        document_id VARCHAR(255),
        locale VARCHAR(255),
        published_at TIMESTAMP,
        role INTEGER
      )
    `);
    
    // 3. Insertar usuarios en la tabla temporal
    console.log('\n=== Insertando usuarios en tabla temporal ===');
    for (const user of users) {
      await pgPool.query(`
        INSERT INTO temp_users (
          id, username, email, provider, password, reset_password_token,
          confirmation_token, confirmed, blocked, created_at, updated_at,
          created_by_id, updated_by_id, lastname, document_id, locale,
          published_at, role
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18
        )
      `, [
        user.id,
        user.username,
        user.email,
        user.provider,
        user.password,
        user.reset_password_token,
        user.confirmation_token,
        user.confirmed,
        user.blocked,
        new Date(user.created_at).toISOString(),
        new Date(user.updated_at).toISOString(),
        user.created_by_id,
        user.updated_by_id,
        user.lastname,
        user.document_id,
        user.locale,
        new Date(user.published_at).toISOString(),
        1 // Asignar rol de Administrador
      ]);
    }
    
    // 4. Actualizar las referencias en las tablas relacionadas
    console.log('\n=== Actualizando referencias ===');
    
    // Actualizar shopping_carts
    await pgPool.query(`
      UPDATE shopping_carts 
      SET costumer_id = t.id
      FROM temp_users t
      WHERE shopping_carts.costumer_id = t.id
    `);
    
    // Actualizar shopping_carts_author_id_lnk
    await pgPool.query(`
      UPDATE shopping_carts_author_id_lnk 
      SET user_id = t.id
      FROM temp_users t
      WHERE shopping_carts_author_id_lnk.user_id = t.id
    `);
    
    // 5. Eliminar usuarios existentes (excepto admin)
    console.log('\n=== Eliminando usuarios existentes ===');
    await pgPool.query(`
      DELETE FROM strapi_users 
      WHERE id != 1
    `);
    
    // 6. Mover usuarios de la tabla temporal a strapi_users
    console.log('\n=== Migrando usuarios finales ===');
    await pgPool.query(`
      INSERT INTO strapi_users (
        id, username, email, provider, password, reset_password_token,
        confirmation_token, confirmed, blocked, created_at, updated_at,
        created_by_id, updated_by_id, lastname, document_id, locale,
        published_at, role
      )
      SELECT 
        id, username, email, provider, password, reset_password_token,
        confirmation_token, confirmed, blocked, created_at, updated_at,
        created_by_id, updated_by_id, lastname, document_id, locale,
        published_at, role
      FROM temp_users
    `);
    
    // 7. Limpiar la tabla temporal
    console.log('\n=== Limpiando tabla temporal ===');
    await pgPool.query('DROP TABLE temp_users');
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración completada exitosamente ===');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

safeMigrateUsers();
