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

async function analyzeShippingStates() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Análisis de shipping_states ===');
    
    // Verificar datos en SQLite
    console.log('\n=== Datos en SQLite ===');
    const sqliteData = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM shipping_states ORDER BY id`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log(`\nEncontrados ${sqliteData.length} registros en SQLite:`);
    sqliteData.forEach(row => {
      console.log(`\nRegistro ${row.id}:`);
      console.log(`- to_ship: ${row.to_ship}`);
      console.log(`- shipped: ${row.shipped}`);
      console.log(`- return: ${row.return}`);
      console.log(`- delivered: ${row.delivered}`);
    });
    
    // Verificar datos en PostgreSQL
    console.log('\n=== Verificando en PostgreSQL ===');
    const pgClient = await pgPool.connect();
    try {
      // Verificar si la tabla existe
      const tableExists = await pgClient.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'shipping_states'
        )
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('La tabla shipping_states no existe en PostgreSQL');
        
        // Crear la tabla
        console.log('\n=== Creando tabla shipping_states ===');
        await pgClient.query(`
          CREATE TABLE shipping_states (
            id SERIAL PRIMARY KEY,
            to_ship BOOLEAN,
            shipped BOOLEAN,
            return BOOLEAN,
            delivered BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            published_at TIMESTAMP WITH TIME ZONE,
            created_by_id INTEGER,
            updated_by_id INTEGER,
            document_id VARCHAR(255),
            locale VARCHAR(255)
          )
        `);
        console.log('Tabla creada exitosamente');
      }
      
      // Migrar datos
      console.log('\n=== Migrando datos ===');
      for (const row of sqliteData) {
        try {
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
            row.created_by_id,
            row.updated_by_id,
            row.document_id,
            row.locale
          ]);
          console.log(`Migrado registro ${row.id}`);
        } catch (error) {
          console.error(`Error migrando registro ${row.id}:`, error);
        }
      }
      
      // Verificar si los datos se migraron correctamente
      const pgData = await pgClient.query('SELECT * FROM shipping_states ORDER BY id');
      console.log(`\n${pgData.rows.length} registros migrados exitosamente`);
    } finally {
      pgClient.release();
    }
    
    sqliteDb.close();
  } catch (error) {
    console.error('Error en el análisis:', error);
  }
}

// Función para convertir timestamps
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  return new Date(timestamp).toISOString();
}

analyzeShippingStates();
