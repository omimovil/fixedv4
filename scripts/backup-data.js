const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function backupData() {
  try {
    const pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    // Crear directorio de respaldo si no existe
    const backupDir = path.join(__dirname, '../backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Obtener todas las tablas
    const tables = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      console.log(`\nHaciendo respaldo de ${tableName}...`);
      
      // Obtener estructura de la tabla
      const columns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      const columnNames = columns.rows.map(row => row.column_name);
      
      // Obtener datos
      const data = await client.query(`
        SELECT ${columnNames.join(', ')} 
        FROM ${tableName}
      `);
      
      // Escribir respaldo
      const backupPath = path.join(backupDir, `${tableName}.json`);
      fs.writeFileSync(backupPath, JSON.stringify({
        columns: columnNames,
        data: data.rows
      }, null, 2));
      
      console.log(`Respaldo completado para ${tableName}`);
    }
    
    client.release();
    pool.end();
    
    console.log('\nRespaldo completado exitosamente');
  } catch (error) {
    console.error('Error al hacer respaldo:', error);
  }
}

backupData();
