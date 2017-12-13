/*!
 * qwebs-mongo
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */

'use strict';

module.exports = require('./lib/qwebs-mongo');
module.exports.Crud = require('./lib/services/crud');
module.exports.Rest = require('./lib/services/rest');
module.exports.RestAuth = require('./lib/services/rest-auth');
