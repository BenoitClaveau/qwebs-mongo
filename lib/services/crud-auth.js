const { DataError } = require("qwebs");
const { CRUD } = require("qwebs-mongo");

/**
 * Define new http methods to identify the caller
 * For more information see qwebs-auth 
 * http://www.npmjs.com/package/qwebs-auth-jwt
 * 
 * New methods are implemented so
 * Http methods can be overridden to use the payload
 * 
 * routes.json need to be modified
 */
class CRUDAuth extends CRUD {

    constructor($auth, collectionName, $mongo, dbName) {
        super(collectionName, $mongo, dbName);
        this.$auth = $auth;
    }

    /* http ------------------------------------------------*/

    httpAuthGetById(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpGetById(request, response);
        })
    };

    httpAuthInsert(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpInsert(request, response);
        })
    };

    httpAuthUpdate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpUpdate(request, response);
        })
    };

    httpAuthSave(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpSave(request, response);
        })
    };

    httpAuthInsertList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpInsertList(request, response);
        })
    };

    httpAuthUpdateList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpUpdateList(request, response);
        })
    };

    httpAuthSaveList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpSaveList(request, response);
        })
    };

    httpAuthDeleteById(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpDeleteById(request, response);
        })
    };

    httpAuthDelete(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpDelete(request, response);
        })
    };

    httpAuthDeleteList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpDeleteList(request, response);
        })
    };

    httpAuthDeleteMany(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpDeleteMany(request, response);
        })
    };

    httpAuthStream(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpStream(request, response);
        })
    };

    httpAuthArray(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpArray(request, response);
        })
    };

    httpAuthDistinct(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpDistinct(request, response);
        })
    };

    httpAuthAggregate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return this.httpAggregate(request, response);
        })
    };
}

exports = module.exports = CRUDAuth;