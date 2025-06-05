module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  app: {
    keys: env.array('APP_KEYS'),
  },

  admin: {
    path: '/admin'
  },
  // Set the frontend for use strapi apis
  frontend: {
    url: env('FRONTEND_URL', 'http://localhost:3000'),
  },
});
