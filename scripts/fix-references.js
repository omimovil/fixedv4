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

async function fixReferences() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificación y corrección de referencias ===');
    
    // 1. Verificar usuarios existentes en PostgreSQL
    console.log('\n=== Verificando usuarios ===');
    const pgUsers = await pgPool.query('SELECT id FROM strapi_users');
    const existingUserIds = new Set(pgUsers.rows.map(row => row.id));
    
    console.log(`Usuarios existentes: ${Array.from(existingUserIds).join(', ')}`);
    
    // 2. Verificar roles existentes
    console.log('\n=== Verificando roles ===');
    const pgRoles = await pgPool.query('SELECT id FROM strapi_roles');
    const existingRoleIds = new Set(pgRoles.rows.map(row => row.id));
    
    console.log(`Roles existentes: ${Array.from(existingRoleIds).join(', ')}`);
    
    // 3. Crear un usuario administrador si no existe
    console.log('\n=== Creando usuario administrador ===');
    const adminClient = await pgPool.connect();
    try {
      // Verificar si ya existe un usuario administrador
      const adminExists = await adminClient.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM strapi_users 
          WHERE role = 1
        )
      `);
      
      if (!adminExists.rows[0].exists) {
        // Crear el usuario administrador
        await adminClient.query(`
          INSERT INTO strapi_users (
            username, email, provider, confirmed, blocked, role,
            created_at, updated_at
          ) VALUES (
            'admin', 'admin@example.com', 'local', true, false, 1,
            NOW(), NOW()
          )
        `);
        console.log('Usuario administrador creado exitosamente');
      } else {
        console.log('Usuario administrador ya existe');
      }
    } finally {
      adminClient.release();
    }
    
    // 4. Corregir referencias en shipping_states
    console.log('\n=== Corrigiendo referencias en shipping_states ===');
    const client = await pgPool.connect();
    try {
      // Obtener todos los registros con referencias inválidas
      const invalidRecords = await client.query(`
        SELECT id 
        FROM shipping_states 
        WHERE created_by_id IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1 FROM strapi_users WHERE id = shipping_states.created_by_id
        )
      `);
      
      if (invalidRecords.rows.length > 0) {
        // Actualizar las referencias para usar el usuario administrador
        await client.query(`
          UPDATE shipping_states 
          SET created_by_id = (
            SELECT id FROM strapi_users WHERE role = 1 LIMIT 1
          ),
          updated_by_id = (
            SELECT id FROM strapi_users WHERE role = 1 LIMIT 1
          )
          WHERE created_by_id IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM strapi_users WHERE id = shipping_states.created_by_id
          )
        `);
        console.log(`Corregidas ${invalidRecords.rows.length} referencias`);
      } else {
        console.log('No se encontraron referencias inválidas');
      }
    } finally {
      client.release();
    }
    
    // 5. Intentar migrar shipping_states nuevamente
    console.log('\n=== Intentando migrar shipping_states nuevamente ===');
    const sqliteData = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM shipping_states ORDER BY id`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    const pgClient = await pgPool.connect();
    try {
      for (const row of sqliteData) {
        try {
          // Usar el usuario administrador para las referencias
          const adminId = await pgPool.query(`
            SELECT id FROM strapi_users WHERE role = 1 LIMIT 1
          `);
          
          await pgClient.query(`
            INSERT INTO shipping_states (
              id, to_ship, shipped, return, delivered,
              created_at, updated_at, published_at,
              created_by_id, updated_by_id, document_id, locale
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [
            row.id,
            row.to_ship,
            row.shipped,
            row.return,
            row.delivered,
            convertTimestamp(row.created_at),
            convertTimestamp(row.updated_at),
            convertTimestamp(row.published_at),
            adminId.rows[0].id, // Usar el usuario administrador
            adminId.rows[0].id, // Usar el usuario administrador
            row.document_id,
            row.locale
          ]);
          console.log(`Migrado registro ${row.id}`);
        } catch (error) {
          console.error(`Error migrando registro ${row.id}:`, error);
        }
      }
    } finally {
      pgClient.release();
    }
    
    sqliteDb.close();
  } catch (error) {
    console.error('Error en la corrección:', error);
  }
}

// Función para convertir timestamps
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  return new Date(timestamp).toISOString();
}

fixReferences();
