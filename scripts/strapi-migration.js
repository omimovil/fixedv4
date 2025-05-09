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

async function strapiMigration() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración de Strapi ===');
    
    // 1. Primero migramos los roles
    console.log('\n=== Migrando roles ===');
    const roles = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_roles ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (roles.length > 0) {
      const client = await pgPool.connect();
      try {
        for (const role of roles) {
          await client.query(`
            INSERT INTO strapi_roles (
              id, name, description, type,
              created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            role.id,
            role.name,
            role.description,
            role.type,
            new Date(role.created_at).toISOString(),
            new Date(role.updated_at).toISOString()
          ]);
        }
        console.log(`Migrados ${roles.length} roles`);
      } finally {
        client.release();
      }
    }
    
    // 2. Migramos los usuarios
    console.log('\n=== Migrando usuarios ===');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (users.length > 0) {
      const client = await pgPool.connect();
      try {
        for (const user of users) {
          await client.query(`
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
        console.log(`Migrados ${users.length} usuarios`);
      } finally {
        client.release();
      }
    }
    
    // 3. Migrar las tablas de contenido
    const contentTables = [
      'brands',
      'categories',
      'colors',
      'delivery_dates',
      'orders',
      'payment_methods',
      'products',
      'shipping_states',
      'sizes'
    ];
    
    for (const table of contentTables) {
      console.log(`\n=== Migrando ${table} ===`);
      
      // Obtener datos de SQLite
      const rows = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${table} ORDER BY id`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      if (rows.length > 0) {
        const client = await pgPool.connect();
        try {
          // Obtener columnas de la tabla
          const columns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 
            ORDER BY ordinal_position
          `, [table]);
          
          const columnNames = columns.rows.map(row => row.column_name);
          
          // Insertar datos
          for (const row of rows) {
            const values = columnNames.map(col => {
              const value = row[col];
              if (value instanceof Date) {
                return value.toISOString();
              }
              return value;
            });
            
            const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
            
            await client.query(`
              INSERT INTO ${table} (${columnNames.join(', ')}) 
              VALUES (${placeholders})
            `, values);
          }
          
          console.log(`Migrados ${rows.length} registros de ${table}`);
        } finally {
          client.release();
        }
      }
    }
    
    // 4. Verificar integridad
    console.log('\n=== Verificando integridad ===');
    const client = await pgPool.connect();
    try {
      // Verificar referencias a usuarios
      for (const table of contentTables) {
        const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM strapi_users WHERE id = ${table}.created_by_id
          )
        `);
        
        if (result.rows[0].count > 0) {
          console.warn(`¡Advertencia! Hay ${result.rows[0].count} registros en ${table} con referencias inválidas`);
        }
      }
    } finally {
      client.release();
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\nMigración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

strapiMigration();
