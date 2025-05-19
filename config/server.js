// module.exports = ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
//   webhooks: {
module.exports = ({ env }) => ({
  responseTimeout: env.int('SERVER_RESPONSE_TIMEOUT', 100000),
  port: env.int('PORT', 1337),
  host: env('HOST', '0.0.0.0'),
  url: env('APP_URL', 'https://fixedv4-production-16eb.up.railway.app'),
  admin: {
    path: env('ADMIN_PATH', '/admin'),
    url: env('APP_URL', 'https://fixedv4-production-16eb.up.railway.app'),
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
