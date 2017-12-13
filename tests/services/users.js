/*!
 * qwebs
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
*/
const Writable = require('stream').Writable;
const Readable = require('stream').Readable;
const Rest = require("../../lib/services/rest");

class Users extends Rest {
	constructor($mongo) {
		super("users", $mongo)
	};
};

exports = module.exports = Users;