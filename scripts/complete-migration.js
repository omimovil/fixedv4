const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configuración de PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

// Tablas de contenido a migrar
const CONTENT_TABLES = [
  'address',
  'available_categories',
  'brands',
  'categories',
  'colors',
  'contact_addresses',
  'countries',
  'delivery_dates',
  'favorite_products',
  'orders',
  'payment_methods',
  'payments',
  'personal_addresses',
  'products',
  'purchases',
  'ratings',
  'reviews',
  'shipping_states',
  'shopping_carts',
  'sizes'
];

// Función para crear una tabla
async function createTable(tableName) {
  const pgClient = new Pool(pgConfig);
  
  try {
    console.log(`\nCreando tabla: ${tableName}`);
    
    // Obtener estructura de la tabla en SQLite
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const columns = await new Promise((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Construir la definición de la tabla
    const columnDefs = columns.map(col => {
      let type = 'TEXT'; // Tipo por defecto
      
      // Determinar tipo de datos basado en el nombre de la columna
      if (col === 'id') type = 'SERIAL PRIMARY KEY';
      else if (col.includes('_at')) type = 'TIMESTAMP';
      else if (col.includes('id')) type = 'INTEGER';
      else if (col.includes('boolean')) type = 'BOOLEAN';
      else if (col.includes('decimal')) type = 'DECIMAL';
      else if (col.includes('integer')) type = 'INTEGER';
      
      // Agregar referencias a tablas relacionadas
      if (col === 'role') type += ' REFERENCES strapi_roles(id)';
      if (col === 'created_by_id' || col === 'updated_by_id') type += ' REFERENCES strapi_users(id)';
      if (col === 'file') type += ' REFERENCES strapi_files(id)';
      
      return `${col} ${type}`;
    });

    // Agregar campos de auditoría
    const auditColumns = 'created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NOT NULL';
    
    // Crear la tabla
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs.join(', ')}, ${auditColumns})`;
    const client = await pgClient.connect();
    
    try {
      await client.query(createQuery);
      console.log(`Tabla ${tableName} creada exitosamente`);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error(`Error creando tabla ${tableName}:`, error);
  } finally {
    pgClient.end();
  }
}

// Función para migrar datos de una tabla
async function migrateTable(tableName) {
  const sqliteDb = new sqlite3.Database('.tmp/data.db');
  const pgClient = new Pool(pgConfig);

  try {
    console.log(`\nMigrando tabla: ${tableName}`);

    // Obtener estructura de la tabla
    const columns = await new Promise((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Obtener datos de SQLite
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (rows.length === 0) {
      console.log(`No se encontraron datos en la tabla ${tableName}`);
      return;
    }

    console.log(`Encontrados ${rows.length} registros`);

    const client = await pgClient.connect();
    
    try {
      for (const row of rows) {
        // Preparar valores para PostgreSQL
async function completeMigration() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración Completa ===');
    
    // 1. Verificar referencias problemáticas
    console.log('\n=== Verificando referencias problemáticas ===');
    const references = await pgPool.query(`
      SELECT DISTINCT user_id
      FROM shopping_carts_author_id_lnk
      WHERE user_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nEncontradas ${references.rows.length} referencias problemáticas:`);
    references.rows.forEach(ref => {
      console.log(`- User ID: ${ref.user_id}`);
    });
    
    // 2. Crear un usuario dummy para las referencias
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
    
    // 4. Obtener usuarios de SQLite
    console.log('\n=== Obteniendo usuarios de SQLite ===');
    const upUsers = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM up_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    // 5. Crear una tabla temporal para los usuarios
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
    
    // 6. Insertar usuarios en la tabla temporal
    console.log('\n=== Insertando usuarios en tabla temporal ===');
    for (const user of upUsers) {
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
    
    // 7. Eliminar usuarios existentes (excepto admin)
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
    
    // 8. Mover usuarios de la tabla temporal a strapi_users
    console.log('\n=== Migrando usuarios finales ===');
    await pgPool.query(`
      INSERT INTO strapi_users (
        id, username, email, provider, confirmed, blocked, created_at, updated_at, role
      )
      SELECT 
        id, username, email, provider, confirmed, blocked, created_at, updated_at, role
      FROM temp_users
    `);
    
    // 9. Limpiar la tabla temporal
    console.log('\n=== Limpiando tabla temporal ===');
    await pgPool.query('DROP TABLE temp_users');
    
    // 10. Verificar la migración
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

completeMigration();
