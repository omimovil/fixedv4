'use strict';

/**
 * paypal-payment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::paypal-payment.paypal-payment');
