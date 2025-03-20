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
      origin: ['http://localhost:3000', process.env.FRONTEND_URL_TUNNEL], // Agrega los dominios permitidos
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
            // 'https://fcc-das-resource-tops.trycloudflare.com',
            // 'https://bulletin-called-seafood-occasional.trycloudflare.com'
            process.env.FRONTEND_URL_TUNNEL
          ],
          'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];

