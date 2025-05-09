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

async function migrateUsersWithPasswords() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migrando Usuarios con Contraseñas ===');
    
    // Obtener todos los usuarios de SQLite
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
    
    // Desactivar las restricciones de clave foránea temporalmente
    console.log('\n=== Desactivando restricciones de clave foránea ===');
    await pgPool.query(`
      SET CONSTRAINTS ALL DEFERRED;
    `);
    
    // Eliminar usuarios existentes en PostgreSQL (excepto el admin por defecto)
    console.log('\n=== Eliminando usuarios existentes (excepto admin) ===');
    await pgPool.query(`
      DELETE FROM strapi_users 
      WHERE id != 1
    `);
    
    // Reactivar las restricciones de clave foránea
    console.log('\n=== Reactivando restricciones de clave foránea ===');
    await pgPool.query(`
      SET CONSTRAINTS ALL IMMEDIATE;
    `);
    
    // Migrar los usuarios
    console.log('\n=== Migrando usuarios ===');
    const adminClient = await pgPool.connect();
    try {
      for (const user of users) {
        // Insertar el usuario con sus datos originales
        await adminClient.query(`
          INSERT INTO strapi_users (
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
        
        console.log(`\nMigrado usuario: ${user.username} (ID: ${user.id})`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: Administrador`);
      }
    } finally {
      adminClient.release();
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración completada ===');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

migrateUsersWithPasswords();
