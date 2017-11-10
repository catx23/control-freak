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
const fs = require("fs");
const Base_1 = require("../services/Base");
const Bean_1 = require("./Bean");
const write = require('write-file-atomic');
class LogsService extends Bean_1.BeanService {
    constructor() {
        super(...arguments);
        // implement Base#method
        this.method = 'XIDE_Log_Service';
    }
    // implement VFS#ls
    ls(path, mount, options, recursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodes = [];
            const root = {
                items: [{
                        _EX: true,
                        children: nodes,
                        mount: mount,
                        name: path,
                        path: path,
                        size: 0
                    }]
            };
            return root;
        });
    }
    // implement VFS#ls
    lsAbs(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const first = path;
                const mount = first.split('/')[0];
                const vfs = this.getVFS(mount);
                if (!vfs) {
                    reject('Cant find VFS for ' + mount);
                }
                let parts = path.split('/');
                parts.shift();
                path = parts.join('/');
                const pathAbs = this.resolvePath(mount, path);
                const entries = [];
                try {
                    fs.statSync(pathAbs);
                }
                catch (e) {
                    resolve(entries);
                    return;
                }
                const lineReader = require('readline').createInterface({
                    input: require('fs').createReadStream(pathAbs)
                });
                lineReader.on('line', function (line) {
                    entries.push(JSON.parse(line));
                });
                lineReader.on('close', function (e) {
                    resolve(entries);
                });
            });
        });
    }
    clearAbs(path) {
        const args = arguments;
        const request = this._getRequest(args);
        if (!request) {
            console.error('no request');
        }
        return new Promise((resolve, reject) => {
            const first = path;
            const mount = first.split('/')[0];
            const vfs = this.getVFS(mount, request);
            if (!vfs) {
                reject('Cant find VFS for ' + mount);
            }
            let parts = path.split('/');
            parts.shift();
            path = parts.join('/');
            const pathAbs = this.resolvePath(mount, path, request);
            write.sync(pathAbs, "", {});
        });
    }
    //
    // ─── DECORATORS ─────────────────────────────────────────────────────────────────
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
    __metadata("design:paramtypes", [String, String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], LogsService.prototype, "ls", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogsService.prototype, "lsAbs", null);
__decorate([
    Base_1.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogsService.prototype, "clearAbs", null);
exports.LogsService = LogsService;
//# sourceMappingURL=Logs.js.map