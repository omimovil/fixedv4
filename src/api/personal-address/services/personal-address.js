'use strict';

/**
 * personal-address service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::personal-address.personal-address');
