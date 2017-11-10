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
const json_1 = require("../io/json");
const AspectDecorator_1 = require("../lang/AspectDecorator");
const Base_1 = require("../services/Base");
const Device_1 = require("../types/Device");
const Driver_1 = require("../types/Driver");
const CIUtils_1 = require("../utils/CIUtils");
const Base_2 = require("./Base");
const Bean_1 = require("./Bean");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const MKCI = CIUtils_1.getCIByChainAndName;
const DProp = Device_1.DEVICE_PROPERTY, LFLAGS = DProp.CF_DEVICE_LOGGING_FLAGS;
const META_FILE_EXT = '.meta.json';
const iterator_1 = require("../fs/iterator");
const uri_1 = require("../fs/uri");
const json_2 = require("../io/json");
function devices(where, scope, serverSide = false) {
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
                        isDir: node.item.type === 'directory' ? true : false,
                        scope: scope,
                        path: _path
                    };
                    const meta = json_2.deserialize(json_2.read(node.path));
                    if (!meta) {
                        return;
                    }
                    if (serverSide) {
                        const driverOptions = CIUtils_1.getCIByChainAndName(meta, 0, Device_1.DEVICE_PROPERTY.CF_DEVICE_DRIVER_OPTIONS);
                        if (driverOptions && !(driverOptions.value & (1 << Driver_1.DRIVER_FLAGS.RUNS_ON_SERVER))) {
                            driverOptions.value = driverOptions.value | (1 << Driver_1.DRIVER_FLAGS.RUNS_ON_SERVER);
                        }
                    }
                    item.user = meta;
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
exports.devices = devices;
exports.MK_DEVICE_CIS = (cis) => {
    return [
        MKCI(cis, 0, DProp.CF_DEVICE_TITLE),
        MKCI(cis, 0, DProp.CF_DEVICE_HOST),
        MKCI(cis, 0, DProp.CF_DEVICE_ENABLED),
        MKCI(cis, 0, DProp.CF_DEVICE_DRIVER),
        MKCI(cis, 0, DProp.CF_DEVICE_PROTOCOL),
        MKCI(cis, 0, DProp.CF_DEVICE_PORT),
        MKCI(cis, 0, DProp.CF_DEVICE_ID),
        MKCI(cis, 0, DProp.CF_DEVICE_OPTIONS),
        MKCI(cis, 0, DProp.CF_DEVICE_DRIVER_OPTIONS),
        {
            "id": LFLAGS,
            "name": LFLAGS,
            "parentId": -1,
            "title": LFLAGS,
            "type": LFLAGS,
            "value": "{\n  \"Device Connected\": 47,\n  \"Response\": 35,\n  \"Send Command\": 51,\n  \"Device Disonnected\": 39,\n  \"Device Error\": 1\n}",
            "visible": true
        }
    ];
};
class DeviceService extends Bean_1.BeanService {
    constructor() {
        super(...arguments);
        this.method = 'XCF_Device_Service';
    }
    createItem(ciList) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const cis = { inputs: ciList };
            // 3 mand. fields to satisfy by client:  -> mount/folder/title (.meta.json)
            const scope = CIUtils_1.getCIInputValueByName(cis, 'Scope');
            const title = CIUtils_1.getCIInputValueByName(cis, 'Title');
            const group = CIUtils_1.getCIInputValueByName(cis, 'In Group');
            const vfs = this.getVFS(scope, this._getRequest(args));
            if (!vfs) {
                reject('Cant find VFS for mount :' + scope);
            }
            const _CIS = exports.MK_DEVICE_CIS(cis);
            const device = {
                inputs: _CIS
            };
            try {
                vfs.writefile(this.resolvePath(scope, path.sep + group + path.sep + title + META_FILE_EXT, this._getRequest(args)), JSON.stringify(device, null, 4), this.WRITE_MODE);
            }
            catch (e) {
                reject(e);
            }
            resolve(_CIS);
        });
    }
    getItems(directory, scope, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const serverSide = options.serverSide;
            return devices(directory, scope, serverSide);
        });
    }
    removeGroup(mount, _path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                const path = this.resolvePath(mount, _path, this._getRequest(args));
                vfs.rmdir(path, {}, resolve, reject);
                resolve(!fs.existsSync(path));
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    removeItem(mount, _path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                const path = this.resolvePath(mount, _path, this._getRequest(args));
                vfs.rm(this.resolvePath(mount, _path, this._getRequest(args)), {}, resolve, reject);
                resolve(!fs.existsSync(path));
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    createGroup(mount, path) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                vfs.mkdir(path, {}, (err, data) => {
                    err ? reject(err) : resolve(true);
                });
                resolve(fs.existsSync(path));
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    ls(mount, path, options, recursive = false) {
        return this._ls.apply(this, arguments);
    }
    updateItemMetaData(path, mount, options, recursive = false) {
        return this._updateItemMetaData.apply(this, arguments);
    }
    //
    // ─── DECORATOR OVERHEAD ─────────────────────────────────────────────────────────
    //
    getRpcMethods() {
        throw new Error("Should be implemented by decorator");
    }
    methods() {
        return this.toMethods(this.getRpcMethods());
    }
}
__decorate([
    Base_2.RpcMethod
    // eventually json string
    ,
    AspectDecorator_1.before((context, args) => Base_1.decodeArgs(args, "$['0']", json_1.to)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceService.prototype, "createItem", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeviceService.prototype, "removeGroup", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeviceService.prototype, "removeItem", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeviceService.prototype, "createGroup", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Boolean]),
    __metadata("design:returntype", void 0)
], DeviceService.prototype, "ls", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Boolean]),
    __metadata("design:returntype", void 0)
], DeviceService.prototype, "updateItemMetaData", null);
exports.DeviceService = DeviceService;
function getDevices(directory, scope, options) {
    const service = new DeviceService(null);
    return service.getItems(directory, scope, options);
}
exports.getDevices = getDevices;
//# sourceMappingURL=Devices.js.map