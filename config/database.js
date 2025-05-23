const path = require('path');

module.exports = ({ env }) => {
  // Detecta automáticamente si estamos en Railway usando la variable DATABASE_URL
  // Asegurarse de que la variable DATABASE_URL sea una cadena válida y no undefined
  const useRailway = env('DATABASE_URL', null) !== null && env('DATABASE_URL', '').length > 0;
  
  // Si estamos en Railway, usa postgres, de lo contrario usa sqlite para desarrollo local
  const client = useRailway ? 'postgres' : 'sqlite';

  const connections = {
    mongo: {
      connector: 'mongoose',
      settings: {
        client: 'mongo',
        uri: env('DATABASE_URI'),
        database: env('DATABASE_NAME', 'strapi'),
      },
      options: {
        // Opciones adicionales para MongoDB...
      },
    },
    mysql: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    mysql2: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true
          ),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', true) ? {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false), // Railway suele necesitar false
        } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  const config = {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };

  // Configuración específica para Railway
  if (env('RAILWAY_ENVIRONMENT')) {
    // Configuración del pool de conexiones
    config.connection.pool = {
      min: 0,
      max: 2,
      createTimeoutMillis: 60000,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 60000,
      reapIntervalMillis: 30000,
      createRetryIntervalMillis: 2000,
      evict: true,
      maxUses: 1000,
      connectionTimeoutMillis: 60000,
      requestTimeoutMillis: 60000,
      acquire: {
        timeout: 60000
      },
      create: {
        timeout: 60000
      }
    };

    // Configuración de la conexión PostgreSQL
    config.connection = {
      client: 'postgres',
      connection: {
        connectionString: env('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 2,
        min: 0,
        idleTimeoutMillis: 60000,
        acquireTimeoutMillis: 60000
      }
    };

    // Configuración de red y reintentos
    config.connection.network = {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      timeout: 60000
    };
    config.connection.retry = {
      max: 5,
      delay: 2000
    };
  }

  return config;
};
