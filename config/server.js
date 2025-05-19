// module.exports = ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
//   webhooks: {
module.exports = ({ env }) => ({
  responseTimeout: env.int('SERVER_RESPONSE_TIMEOUT', 30000), // Reducir timeout
  port: env.int('PORT', 1337),
  host: env('HOST', '0.0.0.0'),
  url: env('PUBLIC_URL', env('RAILWAY_STATIC_URL') || "http://0.0.0.0:" + env.int('PORT', 1337)),
  admin: {
    path: env('ADMIN_PATH', '/admin'),
    url: env('PUBLIC_URL', env('RAILWAY_STATIC_URL') || "http://0.0.0.0:" + env.int('PORT', 1337)),
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  settings: {
    proxy: true, // Habilitar proxy para Railway
    compression: true, // Habilitar compresión
    cache: {
      enabled: true,
      provider: 'memory',
      ttl: 3600 // Cache por 1 hora
    },
    cors: {
      enabled: true,
      origin: ['*'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true
    }
  }
});
});
