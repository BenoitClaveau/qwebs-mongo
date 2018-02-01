/*!
 * qwebs
 * Copyright(c) 2017 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
*/
const Writable = require('stream').Writable;
const Readable = require('stream').Readable;
const Rest = require("../../lib/services/rest");

class Users extends Rest {
	constructor($qwebs) {
		super($qwebs, "users")
	};

	myHttpFindOne(context, stream, headers) {
		this.findOne({ login: "paul" }).pipe(stream);
	}

	myHttpFind(context, stream, headers) {
		this.find().pipe(stream).on("data", data => console.log(data))
	}
};

exports = module.exports = Users;