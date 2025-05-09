const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Configuración de migración
const migrationConfig = {
  order: [
    'strapi_roles',
    'strapi_users',
    'strapi_webhooks',
    'strapi_files',
    'strapi_file_morph',
    'address',
    'available_categories',
    'brands',
    'categories',
    'colors',
    'contact_addresses',
    'cookies',
    'cookie_categories',
    'cookie_popups',
    'customers',
    'countries',
    'delivery_dates',
    'favorite_products',
    'orders',
    'order_products',
    'payments',
    'payment_methods',
    'personal_addresses',
    'products',
    'product_in_carts',
    'purchases',
    'ratings',
    'reviews',
    'shippings',
    'shipping_states',
    'shopping_carts',
    'sizes'
  ],
  relationships: {
    'strapi_users': ['strapi_roles'],
    'customers': ['strapi_users'],
    'orders': ['customers', 'addresses'],
    'order_products': ['orders', 'products'],
    'payments': ['orders', 'payment_methods'],
    'favorites': ['customers', 'products'],
    'ratings': ['customers', 'products'],
    'reviews': ['customers', 'products'],
    'shopping_carts': ['customers'],
    'product_in_carts': ['shopping_carts', 'products']
  }
};

// Configuración de verificación
const verificationConfig = {
  batchSize: 100,
  retries: 3,
  retryDelay: 1000
};

// Clase de configuración principal
class DatabaseConfig {
  constructor() {
    // Cargar variables de entorno
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config({ path: '.env.migration' });
    }

    // Detectar si estamos en Railway
    this.isRailway = process.env.RAILWAY === 'true';

    // Configurar la ruta de SQLite
    this.sqliteDbPath = this.isRailway 
      ? ':memory:'
      : path.join(__dirname, '../.tmp/data.db');

    // Configurar PostgreSQL
    this.pgConfig = {
      connectionString: process.env.DATABASE_URL || 
        (this.isRailway 
          ? 'postgresql://postgres:ominey@railway_host:5432/fixedv4'
          : 'postgresql://postgres:ominey@localhost:5432/fixedv4'),
      ssl: this.isRailway ? {
        rejectUnauthorized: true
      } : false,
      // Configuración específica para PostgreSQL 14
      version: '14',
      max: 20, // Número máximo de conexiones en el pool
      idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexiones
      connectionTimeoutMillis: 2000 // Tiempo máximo para establecer una conexión
    };

    // Configuración de migración
    this.migration = migrationConfig;
    this.verification = verificationConfig;
    this.db = null;
  }

  validateConfig() {
    try {
      if (this.isRailway && !this.pgConfig.connectionString) {
        throw new Error('Error: No se encontró DATABASE_URL en Railway');
      }

      if (!this.isRailway && process.env.NODE_ENV === 'production') {
        throw new Error('Error: No se puede usar SQLite en producción');
      }

      return true;
    } catch (error) {
      console.error('Error de configuración:', error);
      throw error;
    }
  }

  async initDb() {
    try {
      this.validateConfig();

      if (this.isRailway) {
        // En Railway, usar base de datos en memoria
        this.db = new sqlite3.Database(':memory:');
        console.log('Inicializando base de datos en memoria para Railway');
      } else {
        // En local, verificar y crear directorio si no existe
        const dir = path.dirname(this.sqliteDbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Conectar a SQLite
        this.db = new sqlite3.Database(this.sqliteDbPath);
        console.log('Conectado a SQLite local');
      }
      
      await this.verifyTables();
      return this.db;
    } catch (error) {
      this.logError(error, 'Inicialización de DB');
      throw error;
    }
  }

  async verifyTables() {
    try {
      const tables = await new Promise((resolve, reject) => {
        this.db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.name));
        });
      });

      const missingTables = this.migration.order.filter(table => !tables.includes(table));
      if (missingTables.length > 0) {
        console.warn(`Advertencia: Tablas faltantes: ${missingTables.join(', ')} - Continuando con las tablas disponibles`);
      } else {
        console.log('Todas las tablas requeridas están presentes');
      }

      console.log('Todas las tablas requeridas están presentes');
      return tables;
    } catch (error) {
      this.logError(error, 'Verificación de tablas');
      throw error;
    }
  }

  getTableStructure(tableName) {
    return new Promise((resolve, reject) => {
      this.db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) {
          this.logError(err, `Estructura de tabla ${tableName}`);
          reject(err);
        }
        resolve(rows.map(row => row.name));
      });
    });
  }

  logError(error, context = 'Error general') {
    console.error(`\n${'='.repeat(50)}`);
    console.error(`Error en ${context}:`);
    console.error(`Mensaje: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`Ambiente: ${process.env.NODE_ENV}`);
    console.error(`Fecha: ${new Date().toISOString()}`);
    console.error(`${'='.repeat(50)}\n`);
  }

  async retryOperation(operation, maxRetries = this.verification.retries) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Intento ${i + 1}/${maxRetries} falló. Reintentando en ${this.verification.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.verification.retryDelay));
      }
    }
    throw lastError;
  }
}

module.exports = new DatabaseConfig();
