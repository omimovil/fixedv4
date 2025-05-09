const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/db-config');

// Clase para manejar la migración
class DataMigrator {
  constructor() {
    this.sqliteDb = null;
    this.pgClient = null;
    this.logger = {
      info: console.log,
      error: console.error,
      warn: console.warn
    };
  }

  async init() {
    try {
      // Validar configuración
      config.validateConfig();

      // Inicializar base de datos según el entorno
      if (!config.isRailway) {
        // En local, verificar y crear directorio si no existe
        const dir = path.dirname(config.sqliteDbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Conectar a SQLite
        this.sqliteDb = await config.initDb();
        console.log('Conectado a SQLite local');
      } else {
        // En Railway, usar base de datos en memoria
        this.sqliteDb = await config.initDb();
        console.log('Usando base de datos en memoria para Railway');
      }

      // Crear pool de conexión PostgreSQL
      this.pgClient = new Pool(config.pgConfig);
      console.log('Conectado a PostgreSQL');

      // Verificar tablas requeridas
      await this.verifyTables();

    } catch (error) {
      config.logError(error, 'Inicialización');
      process.exit(1);
    }
  }

  async verifyTables() {
    try {
      const tables = await config.verifyTables();
      if (tables.length === 0) {
        throw new Error('No se encontraron tablas en la base de datos SQLite');
      }

      console.log('Todas las tablas requeridas están presentes');
    } catch (error) {
      config.logError(error, 'Verificación de tablas');
      throw error;
    }
  }

  async getTableStructure(tableName) {
    try {
      const columns = await config.getTableStructure(tableName);
      if (!columns || columns.length === 0) {
        config.logError(new Error(`No se pudieron obtener las columnas de ${tableName}`), `Estructura de tabla`);
        return [];
      }

      console.log(`Estructura de ${tableName}:`, columns);
      return columns;
    } catch (error) {
      throw error;
    }
  }

  async getData(tableName) {
    try {
      const allData = await new Promise((resolve, reject) => {
        this.sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) {
            this.logger.error(`Error obteniendo datos de ${tableName}:`, err);
            reject(err);
          }
          resolve(rows);
        });
      });

      this.logger.info(`Obtenidos ${allData.length} registros de ${tableName}`);
      return allData;
    } catch (error) {
      this.logger.error(`Error en getData para ${tableName}:`, error);
      throw error;
    }
  }

  async migrateTable(tableName) {
    try {
      console.log(`\n=== Migrando tabla: ${tableName} ===`);
      console.time(`Migración ${tableName}`);

      const columns = await this.getTableStructure(tableName);
      const rows = await this.getData(tableName);

      if (rows.length === 0) {
        console.log(`No se encontraron datos en la tabla ${tableName}`);
        return;
      }

      console.log(`Encontrados ${rows.length} registros`);

      // Construir consulta de inserción
      const columnsStr = columns.join(', ');
      const valuesStr = columns.map((_, i) => `$${i + 1}`).join(', ');
      const insertQuery = `INSERT INTO ${tableName} (${columnsStr}) VALUES (${valuesStr})`;

      // Insertar datos en PostgreSQL
      const client = await this.pgClient.connect();
      
      try {
        // Obtener la estructura de la tabla en SQLite
        const sqliteColumns = await new Promise((resolve, reject) => {
          this.sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => row.name));
          });
        });

        // Mapear tipos de datos según la tabla
        const columnTypes = {
          available_categories: {
            category_id: 'INTEGER',
            created_by_id: 'INTEGER',
            updated_by_id: 'INTEGER',
            document_id: 'INTEGER'
          }
        };

        // Filtrar las columnas que existen en SQLite
        const validColumns = columns.filter(col => sqliteColumns.includes(col));
        const validColumnsStr = validColumns.join(', ');
        
        // Crear un usuario administrador si no existe
        const createAdminIfNotExists = async () => {
          const client = await this.pgClient.connect();
          try {
            // Verificar si ya existe un rol administrador
            const role = await client.query(`
              SELECT id FROM strapi_roles WHERE type = 'admin' LIMIT 1
            `);
            
            if (role.rows.length === 0) {
              // Crear rol administrador
              await client.query(`
                INSERT INTO strapi_roles (name, type, created_at, updated_at) 
                VALUES ('Administrator', 'admin', NOW(), NOW())
              `);
            }

            // Verificar si ya existe un usuario administrador
            const user = await client.query(`
              SELECT id FROM strapi_users WHERE email = 'admin@example.com' LIMIT 1
            `);

            if (user.rows.length === 0) {
              // Crear usuario administrador
              await client.query(`
                INSERT INTO strapi_users (username, email, provider, confirmed, role, created_at, updated_at) 
                VALUES ('admin', 'admin@example.com', 'local', true, 
                (SELECT id FROM strapi_roles WHERE type = 'admin'), NOW(), NOW())
              `);
            }

            // Obtener el ID del usuario administrador
            const adminUser = await client.query(`
              SELECT id FROM strapi_users WHERE email = 'admin@example.com' LIMIT 1
            `);
            return adminUser.rows[0].id;
          } finally {
            client.release();
          }
        };

        const adminUserId = await createAdminIfNotExists();
        
        for (const row of rows) {
          // Obtener solo los valores para las columnas válidas
          const values = validColumns.map(col => {
            const value = row[col];
            // Manejar tipos de datos específicos
            if (tableName === 'available_categories' && columnTypes[tableName][col]) {
              // Solo convertir si es un número válido
              if (value && !isNaN(value) && value !== '') {
                return parseInt(value, 10);
              }
              // Para valores no numéricos, usar null
              return null;
            }
            // Manejar campos de fecha
            if (col.endsWith('_at')) {
              // Convertir timestamp Unix a formato PostgreSQL
              if (value && !isNaN(value)) {
                return new Date(parseInt(value)).toISOString();
              }
              return null;
            }
            // Para las columnas de usuario, usar el ID del administrador
            if (col === 'created_by_id' || col === 'updated_by_id') {
              return adminUserId;
            }
            return value;
          });
          
          // Construir la consulta con placeholders
          const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
          const query = `INSERT INTO ${tableName} (${validColumnsStr}) VALUES (${placeholders})`;
          
          await client.query(query, values);
          
          console.log(`Migrado registro de ${tableName}`);
        }
        console.log(`Migrados ${rows.length} registros de ${tableName} en total`);
      } finally {
        client.release();
      }

      // Verificar la migración
      const { rows: [count] } = await this.pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      if (count.count !== rows.length) {
        throw new Error(`Verificación fallida para ${tableName}: Se esperaban ${rows.length} registros, pero se encontraron ${count.count}`);
      }

      console.log(`Verificación exitosa para ${tableName}: ${count.count} registros`);
      console.timeEnd(`Migración ${tableName}`);

    } catch (error) {
      config.logError(error, `Migración de ${tableName}`);
      throw error;
    }
  }

  async verifyMigration(tableName, expectedCount) {
    try {
      const { rows: [count] } = await this.pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      if (count.count !== expectedCount) {
        throw new Error(`Verificación fallida para ${tableName}: Se esperaban ${expectedCount} registros, pero se encontraron ${count.count}`);
      }

      this.logger.info(`Verificación exitosa para ${tableName}: ${count.count} registros`);
    } catch (error) {
      this.logger.error(`Error verificando migración de ${tableName}:`, error);
      throw error;
    }
  }

  async migrateInOrder() {
    try {
      this.logger.info('Iniciando migración en orden específico...');
      
      for (const table of config.migration.order) {
        this.logger.info(`\nMigrando tabla: ${table}`);
        await this.migrateTable(table);
      }

      // Migrar tablas relacionadas
      for (const [mainTable, relatedTables] of Object.entries(config.migration.relationships)) {
        for (const relatedTable of relatedTables) {
          this.logger.info(`\nMigrando tabla relacionada: ${relatedTable}`);
          await this.migrateTable(relatedTable);
        }
      }

      this.logger.info('\nMigración completada exitosamente!');
    } catch (error) {
      this.logger.error('Error durante la migración:', error);
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
      this.logger.info('Conexiones cerradas exitosamente');
    } catch (error) {
      this.logger.error('Error al limpiar conexiones:', error);
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
