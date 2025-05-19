// module.exports = ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
//   webhooks: {
module.exports = ({ env }) => ({
  responseTimeout: env.int('SERVER_RESPONSE_TIMEOUT', 100000),
  port: env.int('PORT', 8080), // Usar 8080 como puerto por defecto
  host: env('HOST', '0.0.0.0'),
  url: env('RAILWAY_STATIC_URL', env('PUBLIC_URL', env('APP_URL', `http://0.0.0.0:${env.int('PORT', 8080)}`))),
  admin: {
    path: env('ADMIN_PATH', '/admin'),
    url: env('RAILWAY_STATIC_URL', env('PUBLIC_URL', env('APP_URL', `http://0.0.0.0:${env.int('PORT', 8080)}`))),
    settings: {
      healthcheck: {
        enabled: true,
        path: '/admin/healthcheck',
        timeout: 30000,
        interval: 30000
      }
    }
  },
  settings: {
    proxy: true,
    public: {
      path: env('PUBLIC_PATH', '/'),
      servedByStrapi: true
    }
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
