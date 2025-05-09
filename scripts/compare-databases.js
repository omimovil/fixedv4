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

async function compareDatabases() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Comparando Bases de Datos ===');

    // 1. Obtener todas las tablas de SQLite
    console.log('\n=== Tablas en SQLite ===');
    const sqliteTables = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT name FROM sqlite_master WHERE type = "table"', (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    console.log('\nTablas en SQLite:');
    sqliteTables.forEach(table => console.log(`- ${table}`));

    // 2. Obtener todas las tablas de PostgreSQL
    console.log('\n=== Tablas en PostgreSQL ===');
    const pgTables = await pgPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\nTablas en PostgreSQL:');
    pgTables.rows.forEach(row => console.log(`- ${row.table_name}`));

    // 3. Comparar tablas
    console.log('\n=== Tablas que faltan migrar ===');
    const sqliteTableSet = new Set(sqliteTables);
    const pgTableSet = new Set(pgTables.rows.map(row => row.table_name));

    const missingTables = Array.from(sqliteTableSet).filter(table => !pgTableSet.has(table));
    
    if (missingTables.length > 0) {
      console.log('\nTablas que faltan migrar:');
      missingTables.forEach(table => console.log(`- ${table}`));
    } else {
      console.log('\n¡No hay tablas faltantes! Todas las tablas han sido migradas.');
    }

    // 4. Verificar datos en cada tabla
    console.log('\n=== Verificando datos en cada tabla ===');
    for (const table of sqliteTables) {
      // Verificar si la tabla existe en PostgreSQL
      if (!pgTableSet.has(table)) continue;

      // Contar registros en SQLite
      const sqliteCount = await new Promise((resolve, reject) => {
        sqliteDb.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (err) reject(err);
          resolve(row.count);
        });
      });

      // Contar registros en PostgreSQL
      const pgCount = await pgPool.query(`
        SELECT COUNT(*) as count 
        FROM ${table}
      `);

      console.log(`\nTabla: ${table}`);
      console.log(`- Registros en SQLite: ${sqliteCount}`);
      console.log(`- Registros en PostgreSQL: ${pgCount.rows[0].count}`);
      
      if (sqliteCount !== pgCount.rows[0].count) {
        console.log(`¡Advertencia! Diferencia en el número de registros`);
      }
    }

    sqliteDb.close();
    pgPool.end();
  } catch (error) {
    console.error('Error al comparar bases de datos:', error);
  }
}

compareDatabases();
