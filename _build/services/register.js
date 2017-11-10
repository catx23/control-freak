"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function registerMethod(rpc, method, handler) {
    return rpc.use(method, method);
}
exports.registerMethod = registerMethod;
function registerService(rpc, service, application) {
    let methods = service.methods();
    _.each(methods, (method, name, other) => {
        rpc.use(service.method + '.' + name, method, service);
    });
    service.rpc = rpc;
    service.application = application;
    return service;
}
exports.registerService = registerService;
function services(rpc) {
    return rpc.registry;
}
exports.services = services;
//# sourceMappingURL=register.js.map