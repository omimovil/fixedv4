/**
 * Script mejorado para migrar datos de SQLite a PostgreSQL
 * Con manejo especial para formatos de fecha y timestamp
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

// Usar la ruta de SQLite desde la configuración centralizada
const SQLITE_DB_PATH = config.sqliteDbPath || path.join(__dirname, '../.tmp/data.db');

// Clase para manejar la migración
class DataMigrator {
  constructor() {
    this.sqliteDb = null;
    this.pgClient = null;
  }

  async init() {
    try {
      // Verificar SQLite
      if (!fs.existsSync(SQLITE_DB_PATH)) {
        throw new Error(`No se encontró el archivo SQLite en: ${SQLITE_DB_PATH}`);
      }

      // Conectar a SQLite
      this.sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
      
      // Configuración para PostgreSQL desde .env
      const pgConfig = {
        user: process.env.DATABASE_USERNAME || 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        database: process.env.DATABASE_NAME || 'fixedv4',
        password: process.env.DATABASE_PASSWORD || 'ominey',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        ssl: process.env.DATABASE_SSL === 'true'
      };

      this.pgClient = new Client(pgConfig);
      await this.pgClient.connect();
      
      // Configurar el estilo de fecha en PostgreSQL para mayor compatibilidad
      await this.pgClient.query("SET datestyle = 'ISO, MDY';");

      console.log('Conexiones a bases de datos establecidas exitosamente');
      console.log('Conectado a PostgreSQL con configuración:', pgConfig.host, pgConfig.database);
    } catch (error) {
      console.error('Error inicializando migrador:', error);
      throw error;
    }
  }

  async getExistingTables() {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map(row => row.name));
        }
      );
    });
  }

  async getTableStructure(tableName) {
    try {
      const rows = await new Promise((resolve, reject) => {
        this.sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      return rows.map(row => ({ name: row.name, type: row.type }));
    } catch (error) {
      console.error(`Error obteniendo estructura de tabla ${tableName}:`, error);
      throw error;
    }
  }

  async getData(tableName, batchSize = 100) {
    try {
      const allData = [];
      let offset = 0;
      let rows = [];
      
      do {
        rows = await new Promise((resolve, reject) => {
          this.sqliteDb.all(`SELECT * FROM ${tableName} LIMIT ${batchSize} OFFSET ${offset}`, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          });
        });
        
        allData.push(...rows);
        offset += batchSize;
      } while (rows.length === batchSize);

      console.log(`Obtenidos ${allData.length} registros de ${tableName}`);
      return allData;
    } catch (error) {
      console.error(`Error obteniendo datos de ${tableName}:`, error);
      throw error;
    }
  }

  // Función para manejar correctamente los valores de fecha/timestamp
  formatDateValue(val, colType) {
    if (val === null || val === undefined) {
      return null;
    }
    
    // Si es un string numérico, podría ser un timestamp
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      // Convertir a número
      const numVal = parseInt(val, 10);
      
      try {
        // Si el valor es demasiado grande para PostgreSQL, usar fecha actual
        if (numVal > 2147483647000) { // Valor máximo aproximado que PostgreSQL puede manejar
          console.log(`  Valor de timestamp demasiado grande: ${numVal}. Usando fecha actual.`);
          return new Date().toISOString();
        }
        
        // Ajustar según la longitud (segundos vs milisegundos)
        const timestamp = val.length <= 10 ? numVal * 1000 : numVal;
        const date = new Date(timestamp);
        
        // Verificar si es una fecha válida
        if (isNaN(date.getTime())) {
          console.log(`  Fecha inválida para valor: ${val}. Usando NULL.`);
          return null;
        }
        
        return date.toISOString();
      } catch (e) {
        console.log(`  Error al convertir timestamp '${val}': ${e.message}. Usando NULL.`);
        return null;
      }
    } else if (val instanceof Date) {
      return val.toISOString();
    }
    
    // Para otros formatos de fecha, intentar usar como está
    return val;
  }

  async migrateTable(tableName) {
    try {
      const tableStructure = await this.getTableStructure(tableName);
      const columns = tableStructure.map(col => col.name);
      const columnTypes = {};
      tableStructure.forEach(col => {
        columnTypes[col.name] = col.type;
      });
      
      const rows = await this.getData(tableName);

      if (rows.length === 0) {
        console.log(`No se encontraron datos en la tabla ${tableName}`);
        return;
      }

      // Obtener información de tipos de columnas de PostgreSQL
      const pgColumnsResult = await this.pgClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [tableName]);
      
      const pgColumnTypes = {};
      pgColumnsResult.rows.forEach(row => {
        pgColumnTypes[row.column_name] = row.data_type;
      });

      console.log(`Tipos de columnas para ${tableName}:`, pgColumnTypes);

      // Limpiar tabla destino antes de insertar
      try {
        await this.pgClient.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        console.log(`Tabla ${tableName} limpiada correctamente`);
      } catch (error) {
        console.log(`No se pudo limpiar la tabla ${tableName}: ${error.message}`);
      }

      // Insertar datos en PostgreSQL usando consultas parametrizadas
      for (const row of rows) {
        const columnValues = [];
        const placeholders = [];
        const params = [];
        let paramIndex = 1;
        
        for (const col of columns) {
          const val = row[col];
          if (val !== null && val !== undefined) {
            columnValues.push(col);
            placeholders.push(`$${paramIndex}`);
            
            // Convertir el valor según el tipo de columna en PostgreSQL
            if (pgColumnTypes[col] && pgColumnTypes[col].includes('int') && typeof val === 'string') {
              // Si la columna es de tipo entero pero el valor es string, intentar convertir
              if (/^\d+$/.test(val)) {
                params.push(parseInt(val, 10));
              } else {
                console.log(`Advertencia: Valor no numérico '${val}' para columna ${col}. Usando NULL.`);
                params.push(null);
              }
            } else if (pgColumnTypes[col] && (pgColumnTypes[col].includes('timestamp') || pgColumnTypes[col].includes('date'))) {
              // Usar la función especializada para manejar fechas
              const formattedDate = this.formatDateValue(val, pgColumnTypes[col]);
              params.push(formattedDate);
            } else {
              // Para otros tipos, usar el valor tal cual
              params.push(val);
            }
            
            paramIndex++;
          }
        }
        
        if (columnValues.length > 0) {
          const insertQuery = `INSERT INTO ${tableName} (${columnValues.join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT DO NOTHING`;
          try {
            await this.pgClient.query(insertQuery, params);
          } catch (error) {
            console.error(`Error insertando en ${tableName}:`, error);
            console.error('Consulta:', insertQuery);
            console.error('Parámetros:', params);
            // Continuar con el siguiente registro en lugar de detener todo el proceso
            continue;
          }
        }
      }
      
      console.log(`Migrados ${rows.length} registros de ${tableName}`);
    } catch (error) {
      console.error(`Error migrando tabla ${tableName}:`, error);
      // No lanzar el error para continuar con otras tablas
      console.log(`Continuando con la siguiente tabla...`);
    }
  }

  async migrateInOrder() {
    try {
      // Obtener tablas existentes en SQLite
      const existingTables = await this.getExistingTables();
      console.log(`Tablas encontradas en SQLite: ${existingTables.length}`);
      console.log(existingTables);
      
      // Orden de migración para respetar dependencias
      const migrationOrder = [
        'strapi_core_store_settings',
        'strapi_database_schema',
        'strapi_migrations',
        'strapi_webhooks',
        'admin_permissions',
        'admin_permissions_role_links',
        'admin_roles',
        'admin_users',
        'admin_users_roles_links',
        'strapi_api_tokens',
        'strapi_api_token_permissions',
        'strapi_api_token_permissions_token_links',
        'strapi_transfer_tokens',
        'strapi_transfer_token_permissions',
        'strapi_transfer_token_permissions_token_links',
        'files',
        'files_related_morphs',
        'up_permissions',
        'up_roles',
        'up_users',
        'up_users_role_links',
        'i18n_locale',
        'brands',
        'categories',
        'colors',
        'sizes',
        'products',
        'products_brand_links',
        'products_category_links',
        'products_colors_links',
        'products_sizes_links',
        'addresses',
        'customers',
        'orders',
        'order_products',
        'order_products_product_links',
        'payment_methods',
        'delivery_dates',
        'shopping_carts',
        'product_in_carts',
        'product_in_carts_product_links',
        'product_in_carts_shopping_cart_links',
        'ratings',
        'ratings_product_links',
        'ratings_user_links',
        'reviews',
        'reviews_product_links',
        'reviews_user_links',
        'favorite_products',
        'favorite_products_product_links',
        'favorite_products_user_links',
        'contact_addresses',
        'cookie_popups',
        'cookie_categories',
        'cookies',
        'cookies_cookie_category_links',
        'available_categories',
        'products_components',
        'products_colors',
        'products_sizes',
        'shopping_carts_author_links',
        'strapi_role_permissions',
        'strapi_role_users'
      ];
      
      // Filtrar para incluir solo las tablas que existen en SQLite
      const tablesToMigrate = migrationOrder.filter(table => existingTables.includes(table));
      console.log(`Tablas a migrar: ${tablesToMigrate.length}`);
      
      // Migrar tablas en el orden filtrado
      for (const table of tablesToMigrate) {
        console.log(`\nMigrando tabla: ${table}`);
        await this.migrateTable(table);
      }

      console.log('\nMigración completada exitosamente!');
    } catch (error) {
      console.error('Error durante la migración:', error);
    }
  }

  async cleanup() {
    try {
      if (this.pgClient) {
        await this.pgClient.end();
      }
      if (this.sqliteDb) {
        this.sqliteDb.close();
      }
      console.log('Conexiones cerradas exitosamente');
    } catch (error) {
      console.error('Error al limpiar conexiones:', error);
    }
  }
}

async function migrateData() {
  // Cargar variables de entorno
  require('dotenv').config();
  
  const migrator = new DataMigrator();
  
  try {
    await migrator.init();
    await migrator.migrateInOrder();
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    await migrator.cleanup();
  }
}

migrateData();