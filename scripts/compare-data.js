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

async function compareData() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Comparación de Datos ===');
    
    // Obtener todas las tablas de SQLite
    const sqliteTables = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });
    
    // Obtener todas las tablas de PostgreSQL
    const pgTables = await pgPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    // Comparar tablas
    console.log('\n=== Comparación de Tablas ===');
    sqliteTables.forEach(tableName => {
      const existsInPg = pgTables.rows.some(row => row.table_name === tableName);
      console.log(`${tableName}: ${existsInPg ? '✓' : '✗'} en PostgreSQL`);
    });
    
    // Para cada tabla que existe en ambas bases, comparar el número de registros
    console.log('\n=== Comparación de Registros ===');
    for (const tableName of sqliteTables) {
      if (pgTables.rows.some(row => row.table_name === tableName)) {
        try {
          // Contar registros en SQLite
          const sqliteCount = await new Promise((resolve, reject) => {
            sqliteDb.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
              if (err) reject(err);
              resolve(row.count);
            });
          });
          
          // Contar registros en PostgreSQL
          const pgCount = await pgPool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          
          console.log(`\n${tableName}:`);
          console.log(`- SQLite: ${sqliteCount}`);
          console.log(`- PostgreSQL: ${pgCount.rows[0].count}`);
          
          if (sqliteCount !== pgCount.rows[0].count) {
            console.warn(`¡Advertencia! Diferencia en el número de registros`);
          }
          
          // Verificar si hay diferencias en las columnas
          const sqliteColumns = await new Promise((resolve, reject) => {
            sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
              if (err) reject(err);
              resolve(rows.map(row => row.name));
            });
          });
          
          const pgColumns = await pgPool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 
            ORDER BY ordinal_position
          `, [tableName]);
          
          const pgColumnNames = pgColumns.rows.map(row => row.column_name);
          
          console.log(`\nColumnas en ${tableName}:`);
          sqliteColumns.forEach(col => {
            const existsInPg = pgColumnNames.includes(col);
            console.log(`- ${col}: ${existsInPg ? '✓' : '✗'} en PostgreSQL`);
          });
          
        } catch (error) {
          console.error(`Error comparando ${tableName}:`, error);
        }
      }
    }
    
    // Verificar referencias entre tablas
    console.log('\n=== Verificación de Referencias ===');
    const tablesToCheck = [
      'products',
      'users',
      'orders',
      'categories'
    ];
    
    for (const table of tablesToCheck) {
      try {
        // Verificar referencias a usuarios
        const userRefResult = await pgPool.query(`
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM strapi_users WHERE id = ${table}.created_by_id
          )
        `);
        
        if (userRefResult.rows[0].count > 0) {
          console.warn(`¡Advertencia! Hay ${userRefResult.rows[0].count} registros en ${table} con referencias inválidas a usuarios`);
        }
        
        // Verificar referencias a roles
        const roleRefResult = await pgPool.query(`
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE role IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM strapi_roles WHERE id = ${table}.role
          )
        `);
        
        if (roleRefResult.rows[0].count > 0) {
          console.warn(`¡Advertencia! Hay ${roleRefResult.rows[0].count} registros en ${table} con referencias inválidas a roles`);
        }
        
      } catch (error) {
        console.error(`Error verificando referencias en ${table}:`, error);
      }
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\nComparación completada');
  } catch (error) {
    console.error('Error en la comparación:', error);
  }
}

compareData();
