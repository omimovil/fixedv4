/**
 * Script para reiniciar las migraciones de Strapi
 * 
 * Este script elimina los registros de la tabla de migraciones de Strapi
 * para permitir que las migraciones se ejecuten nuevamente desde cero.
 * 
 * Útil cuando hay errores en las migraciones internas de Strapi como
 * el error: "MigrationError: Migration 5.0.0-05-drop-slug-fields-index (up) failed"
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

async function resetStrapiMigrations() {
  try {
    console.log('Conectando a PostgreSQL...');
    const pgPool = new Pool(pgConfig);
    const client = await pgPool.connect();
    
    // Verificar si la tabla de migraciones existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Tabla de migraciones encontrada. Eliminando registros...');
      
      // Obtener lista de migraciones actuales para referencia
      const currentMigrations = await client.query('SELECT * FROM strapi_migrations ORDER BY id');
      console.log('\nMigraciones actuales:');
      currentMigrations.rows.forEach(migration => {
        console.log(`- ${migration.name} (${migration.id})`);
      });
      
      // Eliminar todos los registros de la tabla de migraciones
      await client.query('DELETE FROM strapi_migrations');
      console.log('\nRegistros de migraciones eliminados correctamente.');
      
      // Opcional: Reiniciar la secuencia de ID si es necesario
      await client.query('ALTER SEQUENCE strapi_migrations_id_seq RESTART WITH 1');
      console.log('Secuencia de ID reiniciada.');
    } else {
      console.log('La tabla strapi_migrations no existe. No es necesario reiniciar.');
    }
    
    // Verificar si hay transacciones abortadas y limpiarlas
    console.log('\nVerificando y limpiando transacciones abortadas...');
    await client.query('ROLLBACK');
    
    console.log('\nProceso completado. Ahora puedes ejecutar las migraciones nuevamente con:');
    console.log('npx strapi migration:run');
    
    client.release();
    await pgPool.end();
  } catch (error) {
    console.error('Error al reiniciar las migraciones:', error);
  }
}

resetStrapiMigrations();