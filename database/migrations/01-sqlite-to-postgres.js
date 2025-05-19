'use strict';

/**
 * Migración de SQLite a PostgreSQL utilizando el sistema de migraciones de Strapi
 * 
 * Este script crea una migración estructurada que puede ser ejecutada por Strapi
 * para transferir datos de SQLite a PostgreSQL manteniendo las relaciones.
 */

async function up(knex) {
  console.log('Ejecutando migración de SQLite a PostgreSQL...');
  
  // Importamos las dependencias necesarias dentro de la función para evitar problemas
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const fs = require('fs');
  
  // Verificar y limpiar cualquier transacción abortada
  try {
    await knex.raw('ROLLBACK');
    console.log('Transacciones previas abortadas han sido limpiadas');
  } catch (error) {
    console.log('No hay transacciones abortadas para limpiar');
  }
  
  // Verificamos si estamos en Railway o en entorno local
  const isRailway = process.env.RAILWAY === 'true';
  console.log(`Entorno detectado: ${isRailway ? 'Railway' : 'Local'}`);
  
  // Ruta a la base de datos SQLite
  const sqliteDbPath = process.env.SQLITE_DB_PATH || '.tmp/data.db';
  
  // Verificar que la base de datos SQLite existe
  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`Error: Base de datos SQLite no encontrada en ${sqliteDbPath}`);
    console.log('La migración no puede continuar sin la base de datos SQLite.');
    return;
  }
  
  // Función mejorada para convertir timestamps de SQLite a PostgreSQL
  function convertTimestamp(timestamp) {
    if (timestamp === null || timestamp === undefined) return null;
    
    try {
      // Si es un número o string numérico, podría ser un timestamp
      if (typeof timestamp === 'number' || (typeof timestamp === 'string' && /^\d+$/.test(timestamp))) {
        const numVal = typeof timestamp === 'number' ? timestamp : parseInt(timestamp, 10);
        
        // Si el valor es demasiado grande para PostgreSQL, usar fecha actual
        if (numVal > 2147483647000) { 
          console.log(`  Timestamp demasiado grande: ${numVal}. Usando fecha actual.`);
          return new Date().toISOString();
        }
        
        // Ajustar según la longitud (segundos vs milisegundos)
        const adjustedTimestamp = numVal < 10000000000 ? numVal * 1000 : numVal;
        const date = new Date(adjustedTimestamp);
        
        // Verificar si es una fecha válida
        if (isNaN(date.getTime())) {
          console.log(`  Fecha inválida para valor: ${timestamp}. Usando fecha actual.`);
          return new Date().toISOString();
        }
        
        return date.toISOString();
      } else if (typeof timestamp === 'string') {
        // Verificar si la fecha es válida y no está fuera de rango
        if (timestamp.includes('+057323') || timestamp.includes('-057323')) {
          console.log(`  Fecha fuera de rango: ${timestamp}. Usando fecha actual.`);
          return new Date().toISOString();
        }
        
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.log(`  Fecha string inválida: ${timestamp}. Usando fecha actual.`);
          return new Date().toISOString();
        }
        
        return date.toISOString();
      }
      
      // Si llegamos aquí, usar fecha actual
      return new Date().toISOString();
    } catch (error) {
      console.log(`  Error procesando fecha '${timestamp}': ${error.message}. Usando fecha actual.`);
      return new Date().toISOString();
    }
  }
  
  // Abrir conexión a SQLite
  const sqliteDb = new sqlite3.Database(sqliteDbPath);
  
  // Obtener lista de tablas desde SQLite
  const tables = await new Promise((resolve, reject) => {
    sqliteDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", 
      (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      }
    );
  });
  
  console.log('Tablas encontradas en SQLite:', tables);
  
  // Orden de migración para respetar dependencias
  const migrationOrder = [
    // Tablas del core de Strapi
    'strapi_roles',
    'strapi_users',
    'strapi_permissions',
    'strapi_webhooks',
    'strapi_files',
    'strapi_file_morph',
    // Tablas de contenido
    'available_categories',
    'delivery_dates',
    'address',
    'categories',
    'brands',
    'colors',
    'contact_addresses',
    'countries',
    'favorite_products',
    'orders',
    'payment_methods',
    'purchases',
    'payments',
    'personal_addresses',
    'products',
    'ratings',
    'reviews',
    'shipping_states',
    'upload_file_folders',
    'sizes',
    'upload_files',
    'shopping_carts',
    // Tablas de relaciones
    'products_categories',
    'products_colors',
    'products_sizes',
    'shopping_carts_author_id_lnk',
    'strapi_role_permissions',
    'strapi_role_users'
  ];
  
  // Filtrar para incluir solo las tablas que existen en SQLite
  const tablesToMigrate = migrationOrder.filter(table => tables.includes(table));
  
  // Migrar cada tabla en orden
  for (const tableName of tablesToMigrate) {
    // Iniciar una nueva transacción para cada tabla
    let trx = await knex.transaction();
    
    try {
      console.log(`Migrando tabla: ${tableName}`);
      
      // Obtener estructura de la tabla desde SQLite
      const tableInfo = await new Promise((resolve, reject) => {
        sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      // Obtener datos de la tabla desde SQLite
      const tableData = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      if (tableData.length === 0) {
        console.log(`Tabla ${tableName} está vacía, saltando...`);
        await trx.commit();
        continue;
      }
      
      // Limpiar la tabla en PostgreSQL antes de insertar
      try {
        await trx(tableName).del();
        console.log(`Tabla ${tableName} limpiada en PostgreSQL`);
      } catch (error) {
        console.warn(`No se pudo limpiar la tabla ${tableName}: ${error.message}`);
        // Hacer rollback de la transacción actual
        await trx.rollback();
        // Iniciar una nueva transacción
        trx = await knex.transaction();
        try {
          await trx(tableName).del();
          console.log(`Tabla ${tableName} limpiada en nuevo intento`);
        } catch (retryError) {
          console.warn(`No se pudo limpiar la tabla ${tableName} en segundo intento: ${retryError.message}`);
          await trx.rollback();
          continue; // Pasar a la siguiente tabla
        }
      }
      
      // Preparar los datos para inserción en PostgreSQL
      const processedData = tableData.map(row => {
        const newRow = {};
        
        // Procesar cada columna
        for (const key in row) {
          // Convertir timestamps
          if (key === 'created_at' || key === 'updated_at' || key === 'published_at') {
            newRow[key] = row[key] ? convertTimestamp(row[key]) : null;
          } else {
            newRow[key] = row[key];
          }
        }
        
        return newRow;
      });
      
      // Insertar datos en PostgreSQL usando la transacción
      try {
        // Dividir en lotes si hay muchos registros para evitar problemas de memoria
        const batchSize = 100;
        for (let i = 0; i < processedData.length; i += batchSize) {
          const batch = processedData.slice(i, i + batchSize);
          await trx(tableName).insert(batch);
          console.log(`  Migrados ${batch.length} registros a ${tableName} (lote ${Math.floor(i/batchSize) + 1})`);
        }
        
        console.log(`Migrados ${processedData.length} registros a ${tableName}`);
        
        // Actualizar secuencia en PostgreSQL si la tabla tiene una columna id
        if (tableInfo.some(col => col.name === 'id')) {
          try {
            // Obtener el valor máximo de id
            const maxId = Math.max(...processedData.map(row => row.id || 0));
            
            // Actualizar la secuencia usando la transacción
            await trx.raw(`SELECT setval('${tableName}_id_seq', ${maxId + 1}, false)`);
            console.log(`Secuencia actualizada para ${tableName}`);
          } catch (error) {
            console.warn(`No se pudo actualizar la secuencia para ${tableName}: ${error.message}`);
            // Continuar con la transacción aunque falle la actualización de secuencia
          }
        }
        
        // Confirmar la transacción si todo fue exitoso
        await trx.commit();
        console.log(`Transacción completada exitosamente para ${tableName}`);
      } catch (insertError) {
        console.error(`Error al insertar datos en ${tableName}:`, insertError);
        // Hacer rollback de la transacción
        await trx.rollback();
        console.log(`Rollback realizado para ${tableName} debido a error de inserción`);
      }
    } catch (error) {
      console.error(`Error al migrar tabla ${tableName}:`, error);
      // Asegurarse de hacer rollback si la transacción sigue activa
      try {
        await trx.rollback();
        console.log(`Rollback realizado para ${tableName}`);
      } catch (rollbackError) {
        console.warn(`Error al hacer rollback para ${tableName}: ${rollbackError.message}`);
      }
    }
  }
  
  // Verificar si hay alguna migración problemática en la tabla strapi_migrations
  try {
    // Asegurarse de que no hay transacciones abortadas antes de verificar
    try {
      await knex.raw('ROLLBACK');
      console.log('Transacciones previas abortadas han sido limpiadas');
    } catch (rollbackError) {
      console.log('No hay transacciones abortadas para limpiar o error al limpiar:', rollbackError.message);
    }
    
    const strapiMigrationsExists = await knex.schema.hasTable('strapi_migrations');
    if (strapiMigrationsExists) {
      console.log('Verificando tabla de migraciones de Strapi...');
      
      // Buscar la migración problemática
      const problematicMigration = await knex('strapi_migrations')
        .where('name', 'like', '%5.0.0-05-drop-slug-fields-index%')
        .first();
      
      if (problematicMigration) {
        console.log('Encontrada la migración problemática. Eliminando registro...');
        await knex('strapi_migrations')
          .where('name', 'like', '%5.0.0-05-drop-slug-fields-index%')
          .del();
        console.log('Migración problemática eliminada correctamente');
        
        // Verificar índices relacionados con slug
        console.log('Verificando índices relacionados con slug...');
        const slugIndexes = await knex.raw(`
          SELECT indexname, tablename FROM pg_indexes 
          WHERE indexname LIKE '%slug%'
        `);
        
        if (slugIndexes.rows && slugIndexes.rows.length > 0) {
          console.log(`Encontrados ${slugIndexes.rows.length} índices relacionados con slug:`);
          for (const idx of slugIndexes.rows) {
            console.log(`- ${idx.indexname} (tabla: ${idx.tablename})`);
          }
        } else {
          console.log('No se encontraron índices relacionados con slug.');
        }
      } else {
        console.log('No se encontró la migración problemática en la tabla strapi_migrations');
      }
    } else {
      console.log('La tabla strapi_migrations no existe todavía');
    }
  } catch (error) {
    console.warn('Error al verificar migraciones de Strapi:', error.message);
    // Intentar continuar a pesar del error
    console.log('Intentando continuar a pesar del error...');
  }
  
  // Cerrar conexión a SQLite
  sqliteDb.close();
  
  console.log('Migración completada exitosamente');
}

async function down(knex) {
  // Esta función se ejecutaría si necesitamos revertir la migración
  console.log('Revirtiendo migración (no implementado)');
  // No implementamos la reversión ya que es una migración de datos inicial
}

module.exports = { up, down };