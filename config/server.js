module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('RAILWAY_STATIC_URL'),

  app: {
    keys: env.array('APP_KEYS'),
  },

  admin: {
    path: '/admin'
  },

  settings: {
    proxy: true,
    public: {
      path: '/'
    }
  }
});
