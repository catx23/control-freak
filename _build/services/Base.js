"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = require("../interfaces/Resource");
const Resolver_1 = require("../resource/Resolver");
const utils = require("../utils/StringUtils");
const json_1 = require("../io/json");
const fs = require("fs");
const _ = require("lodash");
const mkdirp = require("mkdirp");
const _path = require("path");
const url = require("url");
const write_1 = require("../fs/write");
const qs = require('qs').parse;
const pathUtil = require("path");
const permissionError = 'You don\'t have access to this file.';
const defaultPathMode = parseInt('0700', 8);
const writeFileOptions = { mode: parseInt('0600', 8) };
const io = {
    parse: json_1.deserialize,
    serialize: json_1.serialize
};
/**
 * Decorator to mark a method as RPC method (in this.rpcMethods), collected during service registratation.
 *
 * @param {Object} target
 * @param {string} propName
 * @param {*} propertyDescriptor
 */
exports.RpcMethod = (target, propName, propertyDescriptor) => {
    const desc = Object.getOwnPropertyDescriptor(target, "getRpcMethods");
    if (desc && desc.configurable) {
        Object.defineProperty(target, "getRpcMethods", { value: function () { return this["rpcMethods"]; }, configurable: false });
        Object.defineProperty(target, "rpcMethods", { value: [] });
    }
    target && target["rpcMethods"] && target["rpcMethods"].push(propName);
};
class BaseService extends Resolver_1.ResourceResolver {
    constructor(config, relativeVariables, absoluteVariables) {
        super(config, relativeVariables, absoluteVariables);
        this.WRITE_MODE = writeFileOptions;
        this.method = 'no_method';
    }
    init() {
    }
    _userDir(userRoot, what) {
        return pathUtil.resolve(pathUtil.join(userRoot + pathUtil.sep + what));
    }
    _getConfigPath(args) {
        const user = this._getUser(this._getRequest(args));
        let configPath = this.configPath;
        if (user) {
            configPath = this._userDir(user, 'settings.json');
        }
        return configPath;
    }
    _getUser(request) {
        if (request) {
            // pick userDirectory from referrer (xide RPC calls don't have it has it as url parameter )
            const ref = request.get('referrer');
            let urlArgs = qs(url.parse(ref).query);
            let user = urlArgs['userDirectory'];
            if (user) {
                return user;
            }
            // try to pick userDirectory from url
            urlArgs = request.query;
            user = urlArgs['userDirectory'];
            if (user) {
                return user;
            }
        }
    }
    _getRequest(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i] && args[i]['get'] && args[i]['socket']) {
                return args[i];
            }
        }
        return null;
    }
    getRpcMethods() {
        throw new Error('Should be implemented by decorator');
    }
    methods() {
        const methods = this.getRpcMethods();
        return this.toMethods(methods);
    }
    readConfig(path, _default) {
        path = path || this.configPath;
        try {
            return io.parse(fs.readFileSync(path, 'utf8'));
        }
        catch (err) {
            // create dir if it doesn't exist
            if (err.code === 'ENOENT') {
                mkdirp.sync(_path.dirname(path), defaultPathMode);
                write_1.sync(path, _default || '', writeFileOptions);
                return {};
            }
            // improve the message of permission errors
            if (err.code === 'EACCES') {
                err.message = err.message + '\n' + permissionError + '\n';
            }
            // empty the file if it encounters invalid JSON
            if (err.name === 'SyntaxError') {
                write_1.sync(path, '', writeFileOptions);
                return {};
            }
            throw err;
        }
    }
    writeConfig(path, val) {
        path = path || this.configPath;
        val = val || this.readConfig(path);
        try {
            // make sure the folder exists as it
            // could have been deleted in the meantime
            mkdirp.sync(_path.dirname(path), defaultPathMode);
            write_1.sync(path, json_1.serialize(val, null, 4), writeFileOptions);
        }
        catch (err) {
            // improve the message of permission errors
            if (err.code === 'EACCES') {
                err.message = err.message + '\n' + permissionError + '\n';
            }
            throw err;
        }
    }
    toMethods(methods) {
        const self = this;
        const result = {};
        _.each(methods, (method) => {
            result[method] = self[method];
        });
        return result;
    }
    resolveAbsolute(resource, property) {
        if (!property) {
            switch (resource.type) {
                case Resource_1.EResourceType.JS_HEADER_INCLUDE:
                case Resource_1.EResourceType.JS_HEADER_SCRIPT_TAG:
                case Resource_1.EResourceType.CSS: {
                    property = 'url';
                    break;
                }
                case Resource_1.EResourceType.FILE_PROXY: {
                    property = "path";
                    break;
                }
            }
        }
        return utils.replace(resource[property], null, this.absoluteVariables, Resource_1.DefaultDelimitter());
    }
    _resolveUserMount(mount, request, _default) {
        return _default;
    }
    resolve(mount, path, request) {
        const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
        if (resource) {
            let userRoot = this.resolveAbsolute(resource);
            if (request) {
                userRoot = this._resolveUserMount(mount, request, userRoot);
            }
            return _path.join(userRoot, path);
        }
        return null;
    }
    resources() {
        const config = this.readConfig(this.configPath);
        if (config) {
            return config.items;
        }
        return [];
    }
    getResourceByTypeAndName(type, name) {
        const resources = this.resources();
        if (resources) {
            return _.find(resources, {
                type: type,
                name: name
            });
        }
        return null;
    }
}
exports.BaseService = BaseService;
function decodeArgs(args, path, decoder) {
    try {
        decoder(args, path);
    }
    catch (e) {
        throw new Error('Decoding args  failed ' + path);
    }
    return args;
}
exports.decodeArgs = decodeArgs;
//# sourceMappingURL=Base.js.map