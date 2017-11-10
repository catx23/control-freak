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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = require("../interfaces/Resource");
const Driver_1 = require("../types/Driver");
const CIUtils_1 = require("../utils/CIUtils");
const StringUtils_1 = require("../utils/StringUtils");
const Base_1 = require("./Base");
const Bean_1 = require("./Bean");
const _ = require("lodash");
const pathUtil = require("path");
const path = require("path");
const iterator_1 = require("../fs/iterator");
const uri_1 = require("../fs/uri");
const json_1 = require("../io/json");
const META_FILE_EXT = '.meta.json';
function drivers(where, scope, serverSide = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            iterator_1.async(where, {
                matching: ['**/*' + META_FILE_EXT]
            }).then((it) => {
                let node = null;
                let nodes = [];
                while (node = it.next()) {
                    let parent = path.dirname(node.path).replace(where, '');
                    if (parent.startsWith(path.sep)) {
                        parent = parent.replace(path.sep, '');
                    }
                    const name = path.basename(node.path).replace(META_FILE_EXT, '');
                    let _path = parent + path.sep + path.basename(node.path);
                    if (_path.startsWith(path.sep)) {
                        _path = _path.replace(path.sep, '');
                    }
                    const item = {
                        name: name,
                        parentId: parent,
                        isDir: node.item.type === 'directory',
                        scope: scope,
                        path: StringUtils_1.replaceAll('\\', '/', _path)
                    };
                    const meta = json_1.deserialize(json_1.read(node.path));
                    if (!meta) {
                        return;
                    }
                    item['user'] = meta;
                    item['id'] = CIUtils_1.getCIInputValueByName(meta, Driver_1.DRIVER_PROPERTY.CF_DRIVER_ID);
                    let bloxFile = node.path.replace('.meta.json', '.xblox');
                    if (bloxFile.indexOf('Default.xblox') !== -1) {
                        continue;
                    }
                    try {
                        let blox = json_1.deserialize(json_1.read(bloxFile));
                        if (!blox) {
                            console.warn('invalid blocks file for driver ' + name + ' at ' + bloxFile);
                        }
                        item['blox'] = blox;
                        item['blockPath'] = bloxFile;
                    }
                    catch (e) {
                        console.error('error reading blox file ' + bloxFile, e);
                    }
                    nodes.push(item);
                    // add parent if not already
                    if (!_.find(nodes, {
                        path: item.parentId
                    })) {
                        const _parent = uri_1.parentURI(uri_1.URI.file(path.dirname(node.path)));
                        if (_parent.fsPath.indexOf(where) !== -1) {
                            nodes.push({
                                name: item.parentId,
                                path: item.parentId,
                                scope: scope,
                                isDir: true,
                                parentId: _parent.fsPath.replace(where, '')
                            });
                        }
                    }
                }
                resolve(nodes);
            });
        });
    });
}
exports.drivers = drivers;
class DriverService extends Bean_1.BeanService {
    constructor() {
        super(...arguments);
        this.method = 'XCF_Driver_Service';
    }
    getDrivers(driverPath, scope, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return drivers(driverPath, scope);
        });
    }
    updateItemMetaData(path, mount, options, recursive = false) {
        return __awaiter(this, arguments, void 0, function* () {
            return this._updateItemMetaData.apply(this, arguments);
        });
    }
    ls(mount, _path, options, recursive = false, req) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
                if (resource) {
                    let root = this._resolveUserMount(mount, this._getRequest(arguments)) || this.resolveAbsolute(resource);
                    const nodes = yield drivers(root, mount);
                    return { items: nodes };
                }
                else {
                    console.warn('cant find resource for ' + mount);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    removeItem(mount, _path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                vfs.rm(this.resolvePath(mount, _path), {}, resolve, reject);
                vfs.rm(this.resolvePath(mount, _path.replace('.meta.json', '.js')), {}, resolve, reject);
                vfs.rm(this.resolvePath(mount, _path.replace('.meta.json', '.xblox')), {}, resolve, reject);
                resolve(true);
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    // implement IBean#create & IDirectoryService#@touch
    createItem(mount, _path, title, meta, driverCode) {
        return __awaiter(this, arguments, void 0, function* () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                try {
                    const vfs = this.getVFS(mount, this._getRequest(args));
                    if (vfs) {
                        this.mkfile(mount, _path + pathUtil.sep + title + '.meta.json', meta);
                        this.mkfile(mount, _path + pathUtil.sep + title + '.js', driverCode);
                        this.mkfile(mount, _path + pathUtil.sep + title + '.xblox', '{}');
                        resolve(meta);
                    }
                    else {
                        reject('Cant find VFS for ' + mount);
                    }
                }
                catch (e) {
                    console.error('Error creating driver', e);
                }
            });
        });
    }
    // implement IBean#createGroup & IDirectoryService#@mkdir
    createGroup(mount, _path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                vfs.exists(_path).then((exists) => {
                    if (exists) {
                        return resolve(true);
                    }
                    else {
                        vfs.mkdir(_path, {}, (err, data) => {
                            err ? reject(err) : resolve(true);
                        });
                    }
                });
            }
            else {
                reject('Cant find VFS for ----' + mount);
            }
        });
    }
    // implement IBean#removeGroup & IDirectoryService#@rm
    removeGroup(mount, _path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                Promise.resolve(vfs.rmdir(this.resolvePath(mount, _path), {}, resolve, reject));
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    //
    // ─── DECORATOR OVERHEAD ─────────────────────────────────────────────────────────
    //
    getRpcMethods() {
        throw new Error("Should be implemented by decorator");
    }
    methods() {
        return this.toMethods(this.getRpcMethods().concat(['get', 'set']));
    }
}
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "updateItemMetaData", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Boolean, Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "ls", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "removeItem", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "createItem", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "createGroup", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "removeGroup", null);
exports.DriverService = DriverService;
function getDrivers(driverPath, scope, options) {
    const service = new DriverService(null);
    return service.getDrivers(driverPath, scope, options);
}
exports.getDrivers = getDrivers;
//# sourceMappingURL=Drivers.js.map