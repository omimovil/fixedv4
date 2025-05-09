const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

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
    
    console.log('\n=== Migrando usuarios ===');
    
    // Obtener todos los usuarios de SQLite
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_users', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`Encontrados ${users.length} usuarios en SQLite`);
    
    // Obtener roles de SQLite
    const roles = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_roles', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`Encontrados ${roles.length} roles en SQLite`);
    
    // Crear roles en PostgreSQL si no existen
    for (const role of roles) {
      await pgPool.query(`
        INSERT INTO strapi_roles (id, name, description, type)
        SELECT $1, $2, $3, $4
        WHERE NOT EXISTS (
          SELECT 1 FROM strapi_roles WHERE id = $1
        )
      `, [role.id, role.name, role.description, role.type]);
    }
    
    console.log('Roles migrados exitosamente');
    
    // Crear usuarios en PostgreSQL
    for (const user of users) {
      await pgPool.query(`
        INSERT INTO strapi_users (
          id, username, email, provider, confirmed, blocked, role,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        user.id,
        user.username,
        user.email,
        user.provider,
        user.confirmed,
        user.blocked,
        user.role,
        new Date(user.created_at).toISOString(),
        new Date(user.updated_at).toISOString()
      ]);
    }
    
    console.log('Usuarios migrados exitosamente');
    
    // Verificar usuarios migrados
    const pgUsers = await pgPool.query('SELECT id, email, role FROM strapi_users');
    console.log('\nUsuarios en PostgreSQL:');
    pgUsers.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Rol: ${user.role}`);
    });
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\nMigración de usuarios completada');
  } catch (error) {
    console.error('Error al migrar usuarios:', error);
  }
}

migrateUsers();
