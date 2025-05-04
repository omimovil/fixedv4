const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/migration-config');

// Logger simple
const logger = {
  info: console.log,
  error: console.error
};

const SQLITE_DB_PATH = path.join(__dirname, '../.tmp/data.db');

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
      
      // Obtener la URL de PostgreSQL desde el archivo .env.migration
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

      // Conectar a PostgreSQL
      const pgConfig = {
        connectionString: envVars.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      };

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
      
      do {
        const rows = await new Promise((resolve, reject) => {
          this.sqliteDb.all(`SELECT * FROM ${tableName} LIMIT ${batchSize} OFFSET ${offset}`, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          });
        });
        
        allData.push(...rows);
        offset += batchSize;
      } while (rows.length === batchSize);

      this.logger.info(`Obtenidos ${allData.length} registros de ${tableName}`);
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
        this.logger.info(`No se encontraron datos en la tabla ${tableName}`);
        return;
      }

      // Insertar datos en PostgreSQL
      const columnNames = columns.join(', ');
      const values = rows.map(row => 
        columns.map(col => row[col]).map(val => 
          typeof val === 'string' ? `'${val}'` : val
        ).join(', ')
      );

      // Insertar en lotes para mejorar el rendimiento
      const batchSize = config.verification.batchSize;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES ${batch.map(v => `(${v})`).join(', ')}`;
        await this.pgClient.query(insertQuery);
        this.logger.info(`Migrados ${batch.length} registros de ${tableName} (lote ${Math.floor(i/batchSize) + 1})`);
      }

      // Verificar la migración
      await this.verifyMigration(tableName, rows.length);
    } catch (error) {
      this.logger.error(`Error migrando tabla ${tableName}:`, error);
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
