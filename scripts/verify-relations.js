const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
});

async function verifyRelations() {
  try {
    const client = await pool.connect();
    
    // Obtener todas las tablas
    console.log('\nTablas en la base de datos:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Verificar relaciones
    console.log('\n\nRelaciones entre tablas:');
    const relations = await client.query(`
      SELECT 
        tc.table_name as table,
        kcu.column_name as column,
        ccu.table_name as foreign_table,
        ccu.column_name as foreign_column
      FROM 
        information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    relations.rows.forEach(relation => {
      console.log(`- ${relation.table}.${relation.column} -> ${relation.foreign_table}.${relation.foreign_column}`);
    });
    
    // Verificar datos en las tablas principales
    console.log('\n\nDatos en las tablas principales:');
    const mainTables = ['strapi_roles', 'strapi_users', 'available_categories'];
    
    for (const table of mainTables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`- ${table}: ${result.rows[0].count} registros`);
    }
    
    client.release();
  } catch (error) {
    console.error('Error al verificar relaciones:', error);
  }
}

verifyRelations();
