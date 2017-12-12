"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../services/Base");
const dotProp = require("dot-prop");
const _ = require("lodash");
const pathUtil = require("path");
const defaultFileName = 'settings.json';
const exists_1 = require("../fs/exists");
const write_1 = require("../fs/write");
const debug = false;
/**
 * This service sets/gets data in a json file, utilizing 'dot-prop' to select certain data in the object.
 *
 * @export
 * @class JSONFileService
 * @extends {BaseService}
 * @implements {IStoreIO}
 * @implements {IStoreAccess}
 */
class JSONFileService extends Base_1.BaseService {
    constructor(config) {
        super(config, null, null);
        this.method = 'XApp_Store';
        this.defaultFileName = defaultFileName;
        this.defaultData = {
            'admin': {
                'settings': []
            }
        };
        this.configPath = config;
        this.root = 'admin';
    }
    _ensure(path) {
        if (path || path.length) {
            debug && console.error('ensure invalid path !');
            return;
        }
        try {
            if (path && path.length && !exists_1.sync(path)) {
                write_1.sync(path, this.defaultData);
            }
        }
        catch (e) {
            debug && console.error('ensure failed : ' + path);
        }
    }
    _userDir(userRoot, what) {
        return pathUtil.resolve(pathUtil.join(userRoot + pathUtil.sep + what));
    }
    _getConfigPath(args, file) {
        file = file || this.defaultFileName;
        const user = this._getUser(this._getRequest(args));
        let configPath = this.configPath;
        if (user) {
            configPath = this._userDir(user, file || 'settings.json');
        }
        this._ensure(configPath);
        return configPath;
    }
    get(section, path, query) {
        let configPath = this._getConfigPath(arguments);
        if (!configPath || !configPath.length) {
            debug && console.error('get failed!, invalid path ' + configPath + ' for secction ' + section + ' & path = ' + path);
            return [];
        }
        let data = this.readConfig(configPath);
        let result = {};
        result[section] = dotProp.get(data, this.root + path + section);
        return result;
    }
    set(section, path = '.', searchQuery = null, value, decodeValue = true, request) {
        let data = this.readConfig(this._getConfigPath(arguments));
        const dataAt = dotProp.get(data, this.root + path + section);
        if (!_.find(dataAt, searchQuery)) {
            const at = dotProp.get(data, this.root + path + section);
            at.push(searchQuery);
        }
        dataAt && _.extend(_.find(dataAt, searchQuery), value);
        return data;
    }
    remove(section, path = '.', searchQuery = null, request) {
        let data = this.readConfig(this._getConfigPath(arguments));
        const dataAt = dotProp.get(data, this.root + path + section);
        const el = _.find(dataAt, searchQuery);
        if (el) {
            dataAt.splice(dataAt.indexOf(el), 1);
        }
        this.writeConfig(this._getConfigPath(arguments), data);
        return data;
    }
    update(section, path = '.', searchQuery = null, value = null, decodeValue = true, request) {
        return this.writeConfig(this._getConfigPath(arguments), this.set(section, path, searchQuery, value, decodeValue, this._getRequest(arguments)));
    }
    read(path) {
        return this.readConfig(this._getConfigPath(arguments));
    }
    write(path, val) {
        this.writeConfig(path, val);
    }
    //
    // ─── DECORATORS
    //
    getRpcMethods() {
        throw new Error("Should be implemented by decorator");
    }
    methods() {
        const methods = this.getRpcMethods();
        return this.toMethods(methods);
    }
}
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Object)
], JSONFileService.prototype, "get", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Boolean, Object]),
    __metadata("design:returntype", void 0)
], JSONFileService.prototype, "set", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], JSONFileService.prototype, "remove", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Boolean, Object]),
    __metadata("design:returntype", void 0)
], JSONFileService.prototype, "update", null);
exports.JSONFileService = JSONFileService;
//# sourceMappingURL=JSONFile.js.map