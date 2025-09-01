'use strict';

/**
 * paypal-payment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::paypal-payment.paypal-payment');
