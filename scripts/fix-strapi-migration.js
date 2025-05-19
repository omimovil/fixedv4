const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

async function fixStrapiMigration() {
  try {
    // Cargar variables de entorno
    dotenv.config();
    
    console.log('=== SOLUCIÓN PARA ERROR DE MIGRACIÓN EN STRAPI V5 ===');
    console.log('Conectando a PostgreSQL...');
    
    // Usar configuración desde variables de entorno
    const client = new Client({
      user: process.env.DATABASE_USERNAME || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'fixedv4',
      password: process.env.DATABASE_PASSWORD || 'ominey',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    await client.connect();

    try {
      // 1. Finalizar cualquier transacción abortada
      console.log('\n=== Finalizando transacciones abortadas ===');
      try {
        await client.query('ROLLBACK');
        console.log('✅ Transacciones abortadas finalizadas correctamente');
      } catch (rollbackError) {
        console.log('No hay transacciones abortadas para finalizar:', rollbackError.message);
      }

      // 2. Verificar si la tabla de migraciones existe
      console.log('\n=== Verificando tabla de migraciones ===');
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'strapi_migrations'
        );
      `);

      if (tableExists.rows[0].exists) {
        console.log('✅ Tabla de migraciones encontrada');

        // 3. Listar migraciones actuales
        console.log('\n=== Listando migraciones actuales ===');
        const currentMigrations = await client.query('SELECT * FROM strapi_migrations ORDER BY id');
        console.log(`Migraciones encontradas: ${currentMigrations.rows.length}`);

        // 4. Buscar la migración problemática
        const problematicMigration = currentMigrations.rows.find(m => 
          m.name.includes('5.0.0-05-drop-slug-fields-index'));

        if (problematicMigration) {
          console.log(`⚠️ Encontrada la migración problemática: ${problematicMigration.name}`);

          // 5. Eliminar la migración problemática
          console.log('\n=== Eliminando la migración problemática ===');
          await client.query(`
            DELETE FROM strapi_migrations 
            WHERE name LIKE '%5.0.0-05-drop-slug-fields-index%'
          `);
          console.log('✅ Migración problemática eliminada correctamente');
        } else {
          console.log('✅ No se encontró la migración problemática');
        }

        // 6. Verificar índices relacionados con slug
        console.log('\n=== Verificando índices relacionados con slug ===');
        const slugIndexes = await client.query(`
          SELECT indexname, tablename FROM pg_indexes 
          WHERE indexname LIKE '%slug%'
        `);

        if (slugIndexes.rows.length > 0) {
          console.log(`Encontrados ${slugIndexes.rows.length} índices relacionados con slug:`);
          for (const idx of slugIndexes.rows) {
            console.log(`- ${idx.indexname} (tabla: ${idx.tablename})`);
          }
        } else {
          console.log('No se encontraron índices relacionados con slug');
        }
        
        // 7. Verificar y configurar el estilo de fecha en PostgreSQL
        console.log('\n=== Configurando estilo de fecha en PostgreSQL ===');
        await client.query("SET datestyle = 'ISO, MDY';");
        const dateStyleResult = await client.query('SHOW datestyle;');
        console.log(`Estilo de fecha actual: ${dateStyleResult.rows[0].datestyle}`);
        
        // 8. Verificar secuencias de ID
        console.log('\n=== Verificando secuencias de ID ===');
        try {
          await client.query('ALTER SEQUENCE strapi_migrations_id_seq RESTART WITH 1');
          console.log('✅ Secuencia de ID de migraciones reiniciada correctamente');
        } catch (seqError) {
          console.log('No se pudo reiniciar la secuencia de ID:', seqError.message);
        }
      } else {
        console.log('⚠️ La tabla strapi_migrations no existe');
      }

      // 9. Verificar tabla strapi_database_schema
      console.log('\n=== Verificando tabla de esquema de base de datos ===');
      const schemaTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'strapi_database_schema'
        );
      `);
      
      if (schemaTableExists.rows[0].exists) {
        console.log('✅ Tabla de esquema de base de datos encontrada');
        // Opcionalmente, podríamos limpiar esta tabla si hay problemas persistentes
        // await client.query('DELETE FROM strapi_database_schema');
        // console.log('✅ Registros de esquema de base de datos eliminados correctamente');
      } else {
        console.log('⚠️ La tabla strapi_database_schema no existe');
      }
      
      console.log('\n=== SOLUCIÓN COMPLETADA ===');
      console.log('Recomendaciones:');
      console.log('1. Asegúrate de que tu archivo .env tenga la configuración correcta para PostgreSQL');
      console.log('2. Verifica que DATABASE_CLIENT=postgres esté configurado');
      console.log('3. Ahora puedes intentar ejecutar Strapi nuevamente con:');
      console.log('   npm run develop');
      console.log('\nSi el problema persiste, considera reiniciar completamente las migraciones con:');
      console.log('   node scripts/reset-strapi-migrations.js');

    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error durante el proceso de solución:', error);
    process.exit(1);
  }
}

fixStrapiMigration();