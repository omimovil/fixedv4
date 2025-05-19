module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 8080),
  url: env('RAILWAY_STATIC_URL'),

  app: {
    keys: env.array('APP_KEYS'),
  },

  admin: {
    path: '/admin',
  },
});
