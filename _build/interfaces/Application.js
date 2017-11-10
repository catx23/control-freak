"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
exports.Application = koa;
const rpcApp = require("../rpc/JSON-RPC-2");
exports.RpcApp = rpcApp;
var EPersistence;
(function (EPersistence) {
    EPersistence[EPersistence["MEMORY"] = 'memory'] = "MEMORY";
    EPersistence[EPersistence["MONGO"] = 'mongo'] = "MONGO";
})(EPersistence = exports.EPersistence || (exports.EPersistence = {}));
//# sourceMappingURL=Application.js.map