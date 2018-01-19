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

	myHttpFindOne(ask, reply) {
		this.findOne({ login: "paul" }).pipe(reply);
	}

	myHttpFind(ask, reply) {
		this.find().pipe(reply).on("data", data => console.log(data))
	}
};

exports = module.exports = Users;