"use strict";
const {sanitizeEntity} = require("@strapi/utils");
/**
    * shopping-cart controller
    *  
*/
const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::shopping-cart.shopping-cart");
   
