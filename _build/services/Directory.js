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
const base64_1 = require("../io/base64");
const AspectDecorator_1 = require("../lang/AspectDecorator");
const Base_1 = require("../services/Base");
const Local_1 = require("../vfs/Local");
const fs = require("fs");
const mime = require('mime');
const _path = require("path");
const _ = require("lodash");
const Base_2 = require("./Base");
const Path_1 = require("../model/Path");
// import { VFS as GithubVFS, GithubResource } from '../vfs/github/Github';
// import { test as testSFTP } from '../vfs/ssh/sftp';
const sftp_1 = require("../vfs/ssh/sftp");
const copy_1 = require("../fs/copy");
const exists_1 = require("../fs/exists");
// import * as jet from 'fs-jetpack';
const mkdirp = require("mkdirp");
let posix = null;
const _fs = require('node-fs-extra');
try {
    posix = require('posix');
}
catch (e) { }
const DEBUG = false;
const posixCache = {};
function FileSizeToString(size) {
    const isNumber = typeof size === 'number', l1KB = 1024, l1MB = l1KB * l1KB, l1GB = l1MB * l1KB, l1TB = l1GB * l1KB, l1PB = l1TB * l1KB;
    if (isNumber) {
        if (size < l1KB) {
            size = size + 'b';
        }
        else if (size < l1MB) {
            size = (size / l1KB).toFixed(2) + 'kb';
        }
        else if (size < l1GB) {
            size = (size / l1MB).toFixed(2) + 'mb';
        }
        else if (size < l1TB) {
            size = (size / l1GB).toFixed(2) + 'gb';
        }
        else if (size < l1PB) {
            size = (size / l1TB).toFixed(2) + 'tb';
        }
        else {
            size = (size / l1PB).toFixed(2) + 'pb';
        }
    }
    return size;
}
exports.FileSizeToString = FileSizeToString;
class DirectoryService extends Base_1.BaseService {
    constructor(config) {
        super(config.configPath, config.relativeVariables, config.absoluteVariables);
        // implement Base#method for JSON_RPC2: method = XCOM_Directory_Service.fn
        this.method = 'XCOM_Directory_Service';
    }
    // implement BaseService#init
    init() {
    }
    // implement IVFS#get for non sending mode
    _get(path, attachment, send, request) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const split = path.split('://');
            const mount = split[0];
            const vfs = this.getVFS(mount, this._getRequest(args));
            path = split[1];
            if (!vfs) {
                reject('Cant find VFS for ' + mount);
            }
            try {
                vfs.get(path).then(resolve, reject);
                return;
            }
            catch (e) {
                reject(e);
            }
        });
    }
    // implement IVFS#get
    // @before((context, args) => validateArgs(args)
    // @TODO: remove back-compat for xfile
    get(path, attachment, send, dummy = false, reqest = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!attachment && !send) {
                return yield this._get(path, attachment, send, reqest);
            }
        });
    }
    // implement IVFS#set
    set(mount, path, content, reqest = null) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (vfs) {
                // IVFS - 2.0
                if (typeof vfs['set'] === 'function') {
                    vfs.set(path, content).then(() => resolve(true));
                    return;
                }
                // IVFS 1.0
                vfs.writefile(this.resolvePath(mount, path, this._getRequest(args)), content, this.WRITE_MODE);
                resolve(true);
            }
            else {
                reject('Cant find VFS for ' + mount);
            }
        });
    }
    // implement IVFS#rename
    rename(mount, path, newFileName, dummy) {
        return __awaiter(this, arguments, void 0, function* () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                const vfs = this.getVFS(mount, this._getRequest(args));
                if (vfs) {
                    vfs.rename(path, { to: newFileName }, (err, meta) => {
                        err ? reject(err) : resolve(true);
                    });
                }
                else {
                    reject('Cant find VFS for ' + mount);
                }
            });
        });
    }
    // implement IVFS#mkdir
    mkdir(mount, path, reqest = null) {
        return __awaiter(this, arguments, void 0, function* () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                const vfs = this.getVFS(mount, this._getRequest(args));
                if (vfs) {
                    const resolved = this.resolvePath(mount, path, this._getRequest(args));
                    mkdirp.sync(resolved);
                    resolve(true);
                    /*
                    return;
                    vfs.mkdir(path, {}, (err, data) => {
                        if (err) {
                            reject("error reading file : " + err);
                        } else {
                            resolve(true);
                        }
                    });
                    resolve(true);
                    */
                }
                else {
                    reject('Cant find VFS for ' + mount);
                }
            });
        });
    }
    // implement IVFS#@touch
    mkfile(mount, _path, content) {
        return __awaiter(this, arguments, void 0, function* () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                const vfs = this.getVFS(mount, this._getRequest(args));
                const resolved = this.resolvePath(mount, _path, this._getRequest(args));
                if (vfs) {
                    if (fs.existsSync(resolved)) {
                        resolve(true);
                        return;
                    }
                    _fs.outputFile(resolved, content || '', function (error) {
                        if (error) {
                            reject('Error writing file: ' + error);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    reject('Cant find VFS for ' + mount);
                }
            });
        });
    }
    resolveShort(_path) {
        if (_path.startsWith('/')) {
            _path = _path.replace('/', '');
        }
        const mount = _path.split('/')[0];
        let parts = _path.split('/');
        parts.shift();
        return {
            mount: mount,
            path: parts.join('/')
        };
    }
    getFiles(dir) {
        const result = [];
        const files = fs.readdirSync(dir);
        for (let i in files) {
            typeof files[i] === 'string' && result.push(files[i]);
        }
        return result;
    }
    // implement IVFS#@cp
    copy(selection, dst, options, dummy = true, reqest = null) {
        return __awaiter(this, arguments, void 0, function* () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                let destParts = this.resolveShort(dst);
                const dstVFS = this.getVFS(destParts.mount, this._getRequest(args));
                if (!dstVFS) {
                    reject('Cant find target VFS for ' + destParts.mount);
                }
                const targetDirectory = this.resolvePath(destParts.mount, destParts['path'], this._getRequest(args));
                let errors = [];
                // let success: Array<string> = [];
                let others = this.getFiles(targetDirectory);
                const newName = (name) => {
                    let ext = _path.extname(name);
                    let fileName = _path.basename(name, ext);
                    let found = false;
                    let i = 1;
                    let newName = null;
                    while (!found) {
                        newName = fileName + '-' + i + ext;
                        const colliding = others.indexOf(newName);
                        if (colliding !== -1) {
                            i++;
                        }
                        else {
                            found = true;
                        }
                    }
                    return newName;
                };
                let coptions = {
                    overwrite: true
                };
                _.each(selection, (path) => {
                    let srcParts = this.resolveShort(path);
                    let srcPath = this.resolvePath(srcParts.mount, srcParts.path, this._getRequest(args));
                    const srcVFS = this.getVFS(srcParts.mount, reqest);
                    if (!srcVFS) {
                        reject('Cant find VFS for ' + srcParts.mount);
                    }
                    const _exists = others.indexOf(_path.basename(srcPath)) !== -1;
                    const newPath = _exists ?
                        (targetDirectory + _path.sep + newName(_path.basename(srcPath))) :
                        (targetDirectory + _path.sep + _path.basename(srcPath));
                    try {
                        if (exists_1.sync(srcPath)) {
                            copy_1.sync(srcPath, newPath, coptions);
                        }
                        else {
                            errors.push("cp : doesnt exists " + _path.basename(srcPath));
                        }
                    }
                    catch (e) {
                        console.error('cp error');
                    }
                });
                _.isEmpty(errors) ? resolve(true) : reject(errors.join('\\'));
            });
        });
    }
    // implement IVFS#rm
    // @TODO: ugly back compat for xphp in here!
    delete(selection, options, reqest = null) {
        const args = arguments;
        return new Promise((resolve, reject) => {
            const first = selection[0];
            const mount = first.split('/')[0];
            const vfs = this.getVFS(mount, this._getRequest(args));
            let error = null;
            if (!vfs) {
                reject('Cant find VFS for ' + mount);
            }
            // VFS 2.0
            if (typeof vfs['remove'] === 'function') {
                let paths = selection.map((_path) => {
                    let parts = _path.split('/');
                    parts.shift();
                    return parts.join('/');
                });
                const ops = [];
                paths.forEach((path) => { ops.push(vfs.remove(path)); });
                Promise.all(ops).then(() => { resolve(true); }).catch(reject);
                return;
            }
            selection.forEach((_path) => {
                let parts = _path.split('/');
                parts.shift();
                _path = parts.join('/');
                try {
                    vfs.rm(this.resolvePath(mount, _path, this._getRequest(args)), {}, resolve, reject);
                }
                catch (e) {
                    reject(e);
                }
            });
            error ? reject(error) : resolve(true);
        });
    }
    createVFSClass(resource) {
        // if (resource.vfs === 'github') {
        // return new GithubVFS(resource as GithubResource);
        // }
        if (resource.vfs === 'sftp') {
            return new sftp_1.VFS(resource);
        }
    }
    /**
     *
     * @param {string} mount
     * @param {*} [request]
     * @returns
     *
     * @memberOf DirectoryService
     */
    getVFS(mount, request) {
        const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
        if (resource) {
            let root = this._resolveUserMount(mount, request) || this.resolveAbsolute(resource);
            try {
                const vfsClass = resource.vfs;
                // custom VFS class
                if (vfsClass) {
                    return this.createVFSClass(resource);
                }
                if (fs.lstatSync(root)) {
                    return Local_1.create({
                        root: root,
                        nopty: true
                    }, resource);
                }
                else {
                    console.error('Cant create VFS for mount ' + mount + ': vfs root doesnt exists');
                }
            }
            catch (e) {
                console.warn('cant get VFS for ' + mount + ' root : ' + root, e);
                console.log('this', this.absoluteVariables);
            }
        }
        return null;
    }
    resolvePath(mount, path, request) {
        const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
        if (resource) {
            let abs = this.resolveAbsolute(resource);
            if (request) {
                abs = this._resolveUserMount(mount, request, abs);
            }
            if (!abs == null || path == null) {
                console.error('error resolving path for mount ' + mount + '|' + path + '|' + abs, new Error().stack);
            }
            return _path.join(abs, path);
        }
        else {
            console.error('error resolving path, cant find resource for ' + mount + '/' + path);
        }
        return null;
    }
    getOwner(uid) {
        if (posix) {
            if (posixCache[uid]) {
                return posixCache[uid];
            }
            const entry = { name: posix.getpwnam(uid)['name'] };
            return posixCache[uid] = entry;
        }
        else {
            return { name: 'unknown' };
        }
    }
    mapNode(node, mount, root) {
        const fsNodeStat = fs.statSync(node.path);
        const isDirectory = fsNodeStat.isDirectory();
        const nodePath = Path_1.Path.normalize(node.path.replace(root, ''));
        const parent2 = new Path_1.Path(nodePath, false, false).getParentPath();
        const result = {
            path: Path_1.Path.normalize('.' + new Path_1.Path(nodePath, false, false).segments.join('/')),
            sizeBytes: fsNodeStat.size,
            size: isDirectory ? 'Folder' : FileSizeToString(fsNodeStat.size),
            owner: {
                user: this.getOwner(fsNodeStat.uid),
                group: this.getOwner(fsNodeStat.gid)
            },
            mode: fsNodeStat.mode,
            isDir: isDirectory,
            directory: isDirectory,
            mime: isDirectory ? 'directory' : mime.getType(node.path),
            name: _path.win32.basename(node.path),
            fileType: isDirectory ? 'folder' : 'file',
            modified: fsNodeStat.mtime.getTime() / 1000,
            mount: mount,
            parent: Path_1.Path.normalize('./' + parent2.segments.join('/'))
        };
        isDirectory && (result['_EX'] = false);
        return result;
    }
    _ls(path, mount, options, recursive = false) {
        const self = this, args = arguments;
        return new Promise((resolve, reject) => {
            const vfs = this.getVFS(mount, this._getRequest(args));
            if (!vfs) {
                reject(`cant get VFS for mount '${mount}'`);
            }
            // try v2 VFS
            if (typeof vfs.ls === 'function') {
                try {
                    vfs.ls(path, mount, options).then((nodes) => { resolve(nodes); });
                    return;
                }
                catch (e) {
                    reject(e);
                }
            }
            // v1 VFS
            try {
                const root = this.resolvePath(mount, '', this._getRequest(args));
                // back compat : support filenames
                const abs = this.resolvePath(mount, path, this._getRequest(args));
                try {
                    const stat = fs.lstatSync(abs);
                    if (stat.isFile()) {
                        path = _path.dirname(path);
                    }
                }
                catch (e) { }
                vfs.readdir(path, {}, (err, meta) => {
                    if (err) {
                        console.error('error reading directory ' + path);
                        reject(err);
                    }
                    if (!meta) {
                        reject('something wrong');
                    }
                    const nodes = [];
                    try {
                        meta.stream.on('data', (data) => nodes.push(self.mapNode(data, mount, root)));
                        meta.stream.on('end', () => {
                            resolve(nodes);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    // implement IVFS#ls
    ls(path, mount, options, recursive = false, req) {
        return __awaiter(this, arguments, void 0, function* () {
            const nodes = yield this._ls.apply(this, arguments);
            const root = {
                items: [{
                        _EX: true,
                        children: nodes,
                        mount: mount,
                        name: path,
                        path: path,
                        directory: true,
                        size: 0
                    }]
            };
            DEBUG && console.log('nodes', nodes);
            return root;
        });
    }
    //
    // ─── DECORATOR OVERHEAD ─────────────────────────────────────────────────────────
    //
    getRpcMethods() {
        throw new Error('Should be implemented by decorator');
    }
    methods() {
        const methods = this.getRpcMethods();
        return this.toMethods(methods);
    }
}
__decorate([
    Base_2.RpcMethod,
    AspectDecorator_1.before((context, args) => Base_1.decodeArgs(args, '$[\'0\']', base64_1.to)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Boolean, Boolean, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "get", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "set", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "rename", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "mkdir", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "mkfile", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object, Boolean, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "copy", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "delete", null);
__decorate([
    Base_2.RpcMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Boolean, Object]),
    __metadata("design:returntype", Promise)
], DirectoryService.prototype, "ls", null);
exports.DirectoryService = DirectoryService;
//# sourceMappingURL=Directory.js.map