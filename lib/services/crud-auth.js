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
            return super.httpGetById(request, response);
        })
    };

    httpAuthInsert(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpInsert(request, response);
        })
    };

    httpAuthUpdate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpUpdate(request, response);
        })
    };

    httpAuthSave(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpSave(request, response);
        })
    };

    httpAuthInsertList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpInsertList(request, response);
        })
    };

    httpAuthUpdateList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpUpdateList(request, response);
        })
    };

    httpAuthSaveList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpSaveList(request, response);
        })
    };

    httpAuthDeleteById(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpDeleteById(request, response);
        })
    };

    httpAuthDelete(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpDelete(request, response);
        })
    };

    httpAuthDeleteList(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpDeleteList(request, response);
        })
    };

    httpAuthDeleteMany(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpDeleteMany(request, response);
        })
    };

    httpAuthStream(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpStream(request, response);
        })
    };

    httpAuthArray(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpArray(request, response);
        })
    };

    httpAuthDistinct(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpDistinct(request, response);
        })
    };

    httpAuthAggregate(request, response) {
        return this.$auth.identify(request, response).then(() => {
            return super.httpAggregate(request, response);
        })
    };
}

exports = module.exports = CRUDAuth;