'use strict';

/**
 * paypal-payment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::paypal-payment.paypal-payment');
