"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSON_RPC_2_Errors_1 = require("./JSON-RPC-2-Errors");
const JSON_RPC_2_Response_1 = require("./JSON-RPC-2-Response");
const _ = require("lodash");
const parse = require('co-body');
const debug = require('debug');
function JSON_RPC_2() {
    let registry = Object.create(null);
    return {
        registry: registry,
        use: function (name, func, owner = null) {
            if (registry[name]) {
                debug('Overwrite already registered function \'%s\'', name);
            }
            else {
                debug('Register function \'%s\'', name);
            }
            if (owner) {
                registry[name] = {
                    owner: owner,
                    handler: func
                };
            }
            else {
                registry[name] = func;
            }
        },
        app: function () {
            return function* rpcApp(next) {
                let body = {};
                try {
                    body = yield parse.json(this);
                }
                catch (err) {
                    this.body = new JSON_RPC_2_Response_1.Response(null, new JSON_RPC_2_Errors_1.ParserError(err.message));
                    return;
                }
                if (body.jsonrpc !== '2.0'
                    || !body.hasOwnProperty('method')
                    || !body.hasOwnProperty('id')) {
                    debug('JSON is not correct JSON-RPC2 request: %O', body);
                    this.body = new JSON_RPC_2_Response_1.Response(body.id || null, new JSON_RPC_2_Errors_1.InvalidRequest());
                    return;
                }
                if (!registry[body.method]) {
                    debug('Method not found \'%s\' in registry', body.method);
                    this.body = new JSON_RPC_2_Response_1.Response(body.id, new JSON_RPC_2_Errors_1.MethodNotFound(body.method));
                    return;
                }
                debug('Request: %o', body);
                if (_.isObject(registry[body.method])) {
                    const _method = body.method;
                    const service = registry[_method];
                    const args = _.values(body.params).concat([this.request, this]);
                    try {
                        const result = yield service.handler.apply(service.owner, args) || {};
                        this.body = new JSON_RPC_2_Response_1.Response(body.id, null, result);
                        return;
                    }
                    catch (err) {
                        console.error('JSON-RPC Error : ', err);
                        this.body = new JSON_RPC_2_Response_1.Response(body.id || null, new JSON_RPC_2_Errors_1.JSON_RPC_ERROR(err, 1));
                        return;
                    }
                }
                let result = yield registry[body.method](body.params) || {};
                this.body = new JSON_RPC_2_Response_1.Response(body.id, null, result);
                return;
            };
        }
    };
}
exports.JSON_RPC_2 = JSON_RPC_2;
//# sourceMappingURL=JSON-RPC-2.js.map