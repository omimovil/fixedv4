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

async function createMissingTables() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Creando Tablas Faltantes ===');
    
    // 1. Crear tabla de permisos
    console.log('\n=== Creando strapi_permissions ===');
    await pgPool.query(`
      CREATE TABLE strapi_permissions (
        id SERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        subject TEXT,
        properties JSONB,
        conditions JSONB,
        role INTEGER REFERENCES strapi_roles(id),
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // 2. Crear tabla de archivos
    console.log('\n=== Creando upload_files ===');
    await pgPool.query(`
      CREATE TABLE upload_files (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        alternativeText TEXT,
        caption TEXT,
        width INTEGER,
        height INTEGER,
        formats JSONB,
        hash TEXT NOT NULL,
        ext TEXT,
        mime TEXT NOT NULL,
        size DECIMAL(10,2) NOT NULL,
        url TEXT NOT NULL,
        previewUrl TEXT,
        provider TEXT NOT NULL,
        provider_metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        created_by_id INTEGER REFERENCES strapi_users(id),
        updated_by_id INTEGER REFERENCES strapi_users(id)
      )
    `);
    
    // 3. Crear tabla de carpetas
    console.log('\n=== Creando upload_folders ===');
    await pgPool.query(`
      CREATE TABLE upload_folders (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        path_id INTEGER,
        path TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        created_by_id INTEGER REFERENCES strapi_users(id),
        updated_by_id INTEGER REFERENCES strapi_users(id)
      )
    `);
    
    // 4. Crear tabla de relaciones archivo-carpeta
    console.log('\n=== Creando upload_file_folders ===');
    await pgPool.query(`
      CREATE TABLE upload_file_folders (
        id SERIAL PRIMARY KEY,
        folder_id INTEGER REFERENCES upload_folders(id),
        file_id INTEGER REFERENCES upload_files(id),
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    console.log('\n=== Tablas creadas exitosamente ===');
    
    // 5. Migrar datos de medios desde SQLite
    console.log('\n=== Migrando datos de medios ===');
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    
    // Migrar archivos
    const files = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM strapi_files ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (files.length > 0) {
      const client = await pgPool.connect();
      try {
        for (const file of files) {
          await client.query(`
            INSERT INTO upload_files (
              id, name, alternativeText, caption, width, height,
              formats, hash, ext, mime, size, url, previewUrl,
              provider, provider_metadata, created_at, updated_at,
              created_by_id, updated_by_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          `, [
            file.id,
            file.name,
            file.alternativeText,
            file.caption,
            file.width,
            file.height,
            file.formats,
            file.hash,
            file.ext,
            file.mime,
            file.size,
            file.url,
            file.previewUrl,
            file.provider,
            file.provider_metadata,
            convertTimestamp(file.created_at),
            convertTimestamp(file.updated_at),
            file.created_by_id,
            file.updated_by_id
          ]);
        }
        console.log(`Migrados ${files.length} archivos`);
      } finally {
        client.release();
      }
    }
    
    // Migrar carpetas
    const folders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM upload_folders ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (folders.length > 0) {
      const client = await pgPool.connect();
      try {
        for (const folder of folders) {
          await client.query(`
            INSERT INTO upload_folders (
              id, name, path_id, path,
              created_at, updated_at,
              created_by_id, updated_by_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            folder.id,
            folder.name,
            folder.path_id,
            folder.path,
            convertTimestamp(folder.created_at),
            convertTimestamp(folder.updated_at),
            folder.created_by_id,
            folder.updated_by_id
          ]);
        }
        console.log(`Migradas ${folders.length} carpetas`);
      } finally {
        client.release();
      }
    }
    
    // Migrar relaciones archivo-carpeta
    const fileFolders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM upload_file_folders ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (fileFolders.length > 0) {
      const client = await pgPool.connect();
      try {
        for (const rel of fileFolders) {
          await client.query(`
            INSERT INTO upload_file_folders (
              id, folder_id, file_id,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            rel.id,
            rel.folder_id,
            rel.file_id,
            convertTimestamp(rel.created_at),
            convertTimestamp(rel.updated_at)
          ]);
        }
        console.log(`Migradas ${fileFolders.length} relaciones archivo-carpeta`);
      } finally {
        client.release();
      }
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración de medios completada ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para convertir timestamps
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  return new Date(timestamp).toISOString();
}

createMissingTables();
