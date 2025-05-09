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

// Tablas en orden de dependencia
const MIGRATION_ORDER = {
  system: [
    'strapi_roles',
    'strapi_users',
    'strapi_permissions',
    'strapi_webhooks',
    'strapi_files',
    'strapi_file_morph',
    'strapi_content_types',
    'strapi_content_type_lifecycles',
    'strapi_workflows',
    'strapi_workflow_stages',
    'strapi_workflow_stage_permissions',
    'strapi_transfers',
    'strapi_transfer_tokens',
    'strapi_transfer_token_permissions'
  ],
  content: [
    'address',
    'available_categories',
    'brands',
    'categories',
    'colors',
    'contact_addresses',
    'cookies',
    'cookie_categories',
    'cookie_popups',
    'customers',
    'countries',
    'delivery_dates',
    'favorite_products',
    'orders',
    'payment_methods',
    'payments',
    'personal_addresses',
    'product_in_cart',
    'products',
    'purchases',
    'ratings',
    'reviews',
    'shipping',
    'shipping_states',
    'shopping_carts',
    'sizes'
  ]
};

// Tipos de datos específicos para cada tabla
const columnTypes = {
  available_categories: {
    category_id: 'INTEGER',
    created_by_id: 'INTEGER',
    updated_by_id: 'INTEGER',
    document_id: 'INTEGER'
  },
  strapi_users: {
    role: 'INTEGER'
  }
};

// Función para crear tablas
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

// Función para migrar datos
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
      // Crear un array para almacenar los IDs mapeados
      const idMap = new Map();
      
      for (const row of rows) {
        // Preparar valores para PostgreSQL
        const values = columns.map(col => {
          const value = row[col];
          
          // Manejar tipos de datos específicos
          if (columnTypes[tableName] && columnTypes[tableName][col]) {
            if (value && !isNaN(value)) {
              return parseInt(value, 10);
            }
            return null;
          }
          
          // Manejar campos de fecha
          if (col.endsWith('_at')) {
            if (value && !isNaN(value)) {
              return new Date(parseInt(value)).toISOString();
            }
            return null;
          }
          
          // Mapear IDs de relaciones
          if (col.includes('_id') && value && !isNaN(value)) {
            const relatedTable = col.replace('_id', '');
            const relatedId = parseInt(value, 10);
            
            // Si no existe el mapeo, buscar en la tabla relacionada
            if (!idMap.has(relatedTable)) {
              const relatedRows = await new Promise((resolve, reject) => {
                sqliteDb.all(`SELECT id FROM ${relatedTable} WHERE id = ?`, [relatedId], (err, rows) => {
                  if (err) reject(err);
                  resolve(rows);
                });
              });
              
              if (relatedRows.length > 0) {
                idMap.set(relatedTable, new Map());
                idMap.get(relatedTable).set(relatedId, relatedId);
              }
            }
            
            return idMap.get(relatedTable)?.get(relatedId) || null;
          }
          
          return value;
        });

        // Construir la consulta de inserción
        const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
        
        const result = await client.query(query, values);
        
        // Guardar el mapeo de IDs si es necesario
        if (result.rows.length > 0) {
          const newId = result.rows[0].id;
          if (!idMap.has(tableName)) {
            idMap.set(tableName, new Map());
          }
          idMap.get(tableName).set(row.id, newId);
        }
        
        console.log(`Migrado registro de ${tableName}`);
      }
      
      console.log(`Migrados ${rows.length} registros de ${tableName} en total`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error migrando tabla ${tableName}:`, error);
  } finally {
    sqliteDb.close();
    pgClient.end();
  }
}

// Función para migrar archivos
async function migrateFiles() {
  try {
    console.log('\nMigrando archivos...');
    
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgClient = new Pool(pgConfig);
    
    // Obtener todos los archivos
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_files', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (rows.length === 0) {
      console.log('No se encontraron archivos para migrar');
      return;
    }

    const client = await pgClient.connect();
    
    try {
      for (const file of rows) {
        // Verificar si el archivo existe en el sistema de archivos
        const filePath = path.join('.tmp', 'uploads', file.hash + file.ext);
        if (fs.existsSync(filePath)) {
          // Copiar el archivo al nuevo directorio
          const newFilePath = path.join('public', 'uploads', file.hash + file.ext);
          fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
          fs.copyFileSync(filePath, newFilePath);
          
          // Actualizar la ruta en la base de datos
          const query = `
            UPDATE strapi_files 
            SET url = $1, 
                previewUrl = $2 
            WHERE id = $3
          `;
          await client.query(query, [
            `/uploads/${file.hash}${file.ext}`,
            `/uploads/${file.hash}_preview${file.ext}`,
            file.id
          ]);
          
          console.log(`Migrado archivo: ${file.hash}${file.ext}`);
        } else {
          console.warn(`Archivo no encontrado: ${filePath}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error migrando archivos:', error);
  }
}

// Función principal de migración
async function fullMigration() {
  try {
    // Crear todas las tablas del sistema
    console.log('\n=== Iniciando migración del sistema ===');
    for (const tableName of MIGRATION_ORDER.system) {
      await createTable(tableName);
      await migrateTable(tableName);
    }

    // Crear y migrar tablas de contenido
    console.log('\n=== Iniciando migración de contenido ===');
    for (const tableName of MIGRATION_ORDER.content) {
      await createTable(tableName);
      await migrateTable(tableName);
    }

    // Migrar archivos
    await migrateFiles();

    // Verificación final
    console.log('\n=== Verificando integridad ===');
    const pgClient = new Pool(pgConfig);
    const client = await pgClient.connect();
    
    try {
      // Verificar relaciones
      for (const tableName of [...MIGRATION_ORDER.system, ...MIGRATION_ORDER.content]) {
        const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM ${tableName} 
          WHERE created_by_id IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM strapi_users WHERE id = ${tableName}.created_by_id
          )
        `);
        
        if (result.rows[0].count > 0) {
          console.warn(`¡Advertencia! Hay ${result.rows[0].count} registros en ${tableName} con referencias inválidas`);
        }
      }
    } finally {
      client.release();
      pgClient.end();
    }

    console.log('\nMigración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

fullMigration();
