/**
 * Script para solucionar el problema de formato de fecha en la migración a PostgreSQL
 * 
 * Este script modifica el formato de fecha para que sea compatible con PostgreSQL
 * Error: date/time field value out of range: "1746803206761"
 */

const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixDateFormat() {
  try {
    console.log('Conectando a PostgreSQL...');
    const pgPool = new Pool(pgConfig);
    const client = await pgPool.connect();
    
    // Configurar el estilo de fecha en PostgreSQL para que sea más flexible
    console.log('Configurando estilo de fecha en PostgreSQL...');
    await client.query("SET datestyle = 'ISO, MDY';");
    
    console.log('Configuración de estilo de fecha completada.');
    
    // Verificar la configuración actual
    const result = await client.query('SHOW datestyle;');
    console.log(`Estilo de fecha actual: ${result.rows[0].datestyle}`);
    
    console.log('\nProceso completado. Ahora puedes intentar la migración nuevamente.');
    
    client.release();
    await pgPool.end();
  } catch (error) {
    console.error('Error al configurar el formato de fecha:', error);
  }
}

fixDateFormat();