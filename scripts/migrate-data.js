const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const migrationConfig = require('../config/migration-config');
const config = require('./config');

// Logger simple
const logger = {
  info: console.log,
  error: console.error
};

// Usar la ruta de SQLite desde la configuración centralizada
const SQLITE_DB_PATH = config.sqliteDbPath;

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
        throw new Error('No se encontró el archivo SQLite. Asegúrate de que Strapi esté ejecutando localmente.');
      }

      // Conectar a SQLite
      this.sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
      
      // Verificar si estamos en Railway o si tenemos configuración de PostgreSQL
      if (!config.isRailway) {
        // Si no estamos en Railway, intentar obtener la URL de PostgreSQL desde .env.migration
        const envPath = path.join(__dirname, '../.env.migration');
        if (!fs.existsSync(envPath)) {
          throw new Error('No se encontró el archivo .env.migration. Asegúrate de crearlo con la URL de PostgreSQL.');
        }

        // Leer el archivo .env.migration
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
          if (line.includes('=')) {
            const [key, value] = line.split('=').map(part => part.trim());
            envVars[key] = value;
          }
        });

        // Verificar que tenemos la URL de PostgreSQL
        if (!envVars.DATABASE_URL) {
          throw new Error('No se encontró DATABASE_URL en .env.migration');
        }

        // Usar la URL de PostgreSQL del archivo .env.migration
        var pgConfig = {
          connectionString: envVars.DATABASE_URL,
          ssl: false // Deshabilitar SSL para conexiones locales
        };
      } else {
        // En Railway, usar la configuración centralizada
        var pgConfig = config.pgConfig;
        
        if (!pgConfig || !pgConfig.connectionString) {
          throw new Error('No se encontró la configuración de PostgreSQL. Verifica DATABASE_URL.');
        }
      }

      this.pgClient = new Client(pgConfig);
      await this.pgClient.connect();

      console.log('Conexiones a bases de datos establecidas exitosamente');
      console.log('Conectado a PostgreSQL');
    } catch (error) {
      console.error('Error inicializando migrador:', error);
      throw error;
    }
  }

  async getTableStructure(tableName) {
    try {
      const rows = await new Promise((resolve, reject) => {
        this.sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      return rows.map(row => row.name);
    } catch (error) {
      console.error(`Error getting table structure for ${tableName}:`, error);
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

  async migrateTable(tableName) {
    try {
      const columns = await this.getTableStructure(tableName);
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
                // Si el string contiene solo dígitos, convertir a número
                params.push(parseInt(val, 10));
              } else {
                // Si no es un número válido, usar null para evitar errores
                console.log(`Advertencia: Valor no numérico '${val}' para columna ${col} de tipo ${pgColumnTypes[col]}. Usando NULL.`);
                params.push(null);
              }
            } else if (pgColumnTypes[col] && (pgColumnTypes[col].includes('timestamp') || pgColumnTypes[col].includes('date'))) {
              // Manejar fechas y timestamps
              console.log(`Convirtiendo valor para columna ${col} (${pgColumnTypes[col]}): '${val}' (${typeof val})`);
              
              if (typeof val === 'string' && /^\d+$/.test(val)) {
                // Es un string numérico, podría ser un timestamp
                const numVal = val.length > 10 ? parseInt(val, 10) : parseInt(val, 10) * 1000;
                try {
                  // Verificar si es un timestamp válido (entre 1970 y 2100)
                  if (numVal > 0 && numVal < 4102444800000) { // 4102444800000 = 1/1/2100
                    const date = new Date(numVal);
                    console.log(`  Convertido a fecha: ${date.toISOString()}`);
                    params.push(date.toISOString());
                  } else {
                    console.log(`  Valor fuera de rango para timestamp: ${numVal}. Usando NULL.`);
                    params.push(null);
                  }
                } catch (e) {
                  console.log(`  Error al convertir timestamp '${val}': ${e.message}. Usando NULL.`);
                  params.push(null);
                }
              } else if (val instanceof Date) {
                // Ya es un objeto Date
                params.push(val.toISOString());
              } else if (val === null || val === undefined) {
                // Valores nulos
                params.push(null);
              } else {
                // Otro tipo de valor, intentar usar como está
                console.log(`  Usando valor tal cual para ${col}: ${val}`);
                params.push(val);
              }
            } else {
              // Para otros tipos, usar el valor tal cual
              params.push(val);
            }
            
            paramIndex++;
          }
        }
        
        if (columnValues.length > 0) {
          const insertQuery = `INSERT INTO ${tableName} (${columnValues.join(', ')}) VALUES (${placeholders.join(', ')})`;
          try {
            await this.pgClient.query(insertQuery, params);
          } catch (error) {
            console.error(`Error insertando en ${tableName}:`, error);
            console.error('Consulta:', insertQuery);
            console.error('Parámetros:', params);
            throw error;
          }
        }
      }
      
      console.log(`Migrados ${rows.length} registros de ${tableName}`);

      // Verificar la migración
      await this.verifyMigration(tableName, rows.length);
    } catch (error) {
      console.error(`Error migrando tabla ${tableName}:`, error);
      throw error;
    }
  }

  async verifyMigration(tableName, expectedCount) {
    try {
      const { rows: [count] } = await this.pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      if (count.count !== expectedCount) {
        throw new Error(`Verificación fallida para ${tableName}: Se esperaban ${expectedCount} registros, pero se encontraron ${count.count}`);
      }

      console.log(`Verificación exitosa para ${tableName}: ${count.count} registros`);
    } catch (error) {
      console.error(`Error verificando migración de ${tableName}:`, error);
      throw error;
    }
  }

  async migrateInOrder() {
    try {
      console.log('Iniciando migración en orden específico...');
      
      // Primero, obtener la lista de tablas que realmente existen en SQLite
      const existingTables = await new Promise((resolve, reject) => {
        this.sqliteDb.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", 
          (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.name));
          }
        );
      });
      
      console.log(`Tablas encontradas en SQLite: ${existingTables.length}`);
      
      // Definir el orden de migración directamente aquí para evitar problemas de configuración
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
      const tablesToMigrate = migrationOrder.filter(table => existingTables.includes(table));
      console.log(`Tablas a migrar: ${tablesToMigrate.length}`);
      
      // Definir relaciones directamente aquí
      const relationships = {
        'orders': ['order_products'],
        'products': ['product_in_carts', 'favorite_products', 'ratings', 'reviews'],
        'customers': ['favorite_products', 'orders', 'shopping_carts']
      };
      
      // Migrar tablas en el orden filtrado
      for (const table of tablesToMigrate) {
        console.log(`\nMigrando tabla: ${table}`);
        await this.migrateTable(table);
      }

      // Migrar tablas relacionadas (solo si existen)
      for (const [mainTable, relatedTables] of Object.entries(relationships)) {
        if (existingTables.includes(mainTable)) {
          for (const relatedTable of relatedTables) {
            if (existingTables.includes(relatedTable)) {
              console.log(`\nMigrando tabla relacionada: ${relatedTable}`);
              await this.migrateTable(relatedTable);
            }
          }
        }
      }

      console.log('\nMigración completada exitosamente!');
    } catch (error) {
      console.error('Error durante la migración:', error);
      throw error;
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

// Ejecutar la migración
migrateData();
