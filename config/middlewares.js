module.exports = [
  'strapi::errors',
  // {
  //   name: 'strapi::cors',
  //   config: {
  //     origin: ['http://localhost:3000', '*'], // Agrega los dominios permitidos
  //     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //     headers: ['Content-Type', 'Authorization'],
  //     credentials: true,
  //   },
  // },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'], // Solo permitir el origen del frontend
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public', 
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': [
            "'self'",
            'https:',
            'http:',
            'http://localhost:3000'
          ],
          'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];

