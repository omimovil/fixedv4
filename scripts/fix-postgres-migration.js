/**
 * Script para solucionar problemas de migración a PostgreSQL
 * 
 * Este script realiza las siguientes acciones:
 * 1. Limpia las transacciones abortadas en PostgreSQL
 * 2. Reinicia las migraciones de Strapi
 * 3. Configura el formato de fecha correcto
 * 4. Prepara la base de datos para un inicio limpio de Strapi
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

async function fixPostgresMigration() {
  try {
    console.log('Conectando a PostgreSQL...');
    const pgPool = new Pool(pgConfig);
    const client = await pgPool.connect();
    
    // 1. Limpiar transacciones abortadas
    console.log('\n=== Limpiando transacciones abortadas ===');
    try {
      await client.query('ROLLBACK');
      console.log('Transacciones abortadas limpiadas correctamente.');
    } catch (error) {
      console.log('No hay transacciones abortadas para limpiar:', error.message);
    }
    
    // 2. Configurar el estilo de fecha en PostgreSQL
    console.log('\n=== Configurando estilo de fecha en PostgreSQL ===');
    await client.query("SET datestyle = 'ISO, MDY';");
    const result = await client.query('SHOW datestyle;');
    console.log(`Estilo de fecha actual: ${result.rows[0].datestyle}`);
    
    // 3. Verificar si la tabla de migraciones existe y limpiarla
    console.log('\n=== Verificando tabla de migraciones ===');
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
      
      // Reiniciar la secuencia de ID
      await client.query('ALTER SEQUENCE strapi_migrations_id_seq RESTART WITH 1');
      console.log('Secuencia de ID reiniciada.');
    } else {
      console.log('La tabla strapi_migrations no existe. No es necesario reiniciar.');
    }
    
    // 4. Verificar y limpiar la tabla strapi_migrations_internal si existe
    console.log('\n=== Verificando tabla de migraciones internas ===');
    const internalTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations_internal'
      );
    `);
    
    if (internalTableExists.rows[0].exists) {
      console.log('Tabla de migraciones internas encontrada. Eliminando registros...');
      await client.query('DELETE FROM strapi_migrations_internal');
      console.log('Registros de migraciones internas eliminados correctamente.');
      
      // Reiniciar la secuencia de ID
      await client.query('ALTER SEQUENCE strapi_migrations_internal_id_seq RESTART WITH 1');
      console.log('Secuencia de ID reiniciada.');
    } else {
      console.log('La tabla strapi_migrations_internal no existe. No es necesario reiniciar.');
    }
    
    // 5. Verificar y limpiar la tabla strapi_database_schema si existe
    console.log('\n=== Verificando tabla de esquema de base de datos ===');
    const schemaTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_database_schema'
      );
    `);
    
    if (schemaTableExists.rows[0].exists) {
      console.log('Tabla de esquema de base de datos encontrada. Eliminando registros...');
      await client.query('DELETE FROM strapi_database_schema');
      console.log('Registros de esquema de base de datos eliminados correctamente.');
    } else {
      console.log('La tabla strapi_database_schema no existe. No es necesario reiniciar.');
    }
    
    console.log('\n=== Proceso completado ===');
    console.log('La base de datos PostgreSQL ha sido preparada para un inicio limpio de Strapi.');
    console.log('Ahora puedes ejecutar: npm run develop');
    
    client.release();
    await pgPool.end();
  } catch (error) {
    console.error('Error al preparar la base de datos PostgreSQL:', error);
  }
}

fixPostgresMigration();