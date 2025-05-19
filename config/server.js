module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080),
  url: env('RAILWAY_STATIC_URL'), // Asegúrate de definir esto en las variables de entorno de Railway

  app: {
    keys: env.array('APP_KEYS'),
  },

  admin: {
    path: '/admin',
  },

  settings: {
    proxy: true,
  },
});
