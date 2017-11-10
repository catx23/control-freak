"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const fs = require("fs");
const pathUtil = require("path");
const Path_1 = require("../../model/Path");
const Resource_1 = require("../../interfaces/Resource");
class VFS {
    constructor(resource) {
        this.resource = resource;
        this.options = this.parseOptions(resource.options);
        this.init();
    }
    /**
     * Map internal node rep. to public INode
     *
     * @param {ITreeBlobNode} node
     * @param {string} mount
     * @param {IObjectLiteral} options
     * @returns {INode}
     *
     * @memberOf VFS
     */
    mapNode(root, node, stats, mount, options) {
        const directory = stats.isDirectory();
        const abs = new Path_1.Path('./' + root + '/' + node.filename).toString().replace(this.options.root, '');
        const parent = new Path_1.Path(abs, false, false).getParentPath();
        return {
            path: Path_1.Path.normalize('./' + abs),
            sizeBytes: node.attrs.size,
            size: node.attrs.size,
            mtime: node.attrs.mtime,
            atime: node.attrs.atime,
            owner: {
                user: null,
                group: null
            },
            isDir: directory,
            directory: directory,
            mime: !directory ? 'file' : 'folder',
            name: pathUtil.win32.basename(node.filename),
            fileType: directory ? 'folder' : 'file',
            mount: mount,
            parent: Path_1.Path.normalize("./" + parent.toString()),
            type: ''
        };
    }
    list(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sftp = this.sftp;
                if (sftp) {
                    sftp.readdir(path, (err, list) => {
                        if (err) {
                            reject(err);
                            return false;
                        }
                        // reset file info
                        list.forEach((item, i) => {
                            const _item = list[i];
                            _item['name'] = item.filename;
                            _item['type'] = item.longname.substr(0, 1);
                        });
                        resolve(list);
                    });
                }
                else {
                    reject('sftp connect error');
                }
            });
        });
    }
    _delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sftp = this.sftp;
                if (sftp) {
                    sftp.unlink(path, (err) => {
                        if (err) {
                            reject(err);
                            return false;
                        }
                        resolve();
                    });
                }
                else {
                    reject('sftp connect error');
                }
            });
        });
    }
    ;
    remove(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.init().then(() => {
                    path = this.resolve(path);
                    this.sftp.stat(path, (err, stats) => {
                        if (stats.isDirectory()) {
                            /*
                            this.sftp.rmdir(path, (err) => {
                                err ? reject(err) : resolve(true);
                            });
                            */
                            let rmdir = (p) => {
                                return this.list(p).then((list) => {
                                    if (list.length > 0) {
                                        let promises = [];
                                        list.forEach((item) => {
                                            let name = item.name;
                                            let promise;
                                            let subPath;
                                            if (name[0] === '/') {
                                                subPath = name;
                                            }
                                            else {
                                                if (p[p.length - 1] === '/') {
                                                    subPath = p + name;
                                                }
                                                else {
                                                    subPath = p + '/' + name;
                                                }
                                            }
                                            if (item.type === 'd') {
                                                if (name !== '.' || name !== '..') {
                                                    promise = rmdir(subPath);
                                                }
                                            }
                                            else {
                                                promise = this._delete(subPath);
                                            }
                                            promises.push(promise);
                                        });
                                        if (promises.length) {
                                            return Promise.all(promises).then(() => {
                                                return rmdir(p);
                                            });
                                        }
                                    }
                                    else {
                                        return new Promise((resolve, reject) => {
                                            return this.sftp.rmdir(p, (err) => {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    resolve();
                                                }
                                            });
                                        });
                                    }
                                });
                            };
                            return rmdir(path).then(() => { resolve(); });
                        }
                        else {
                            this.sftp.unlink(path, (err) => {
                                err ? reject(err) : resolve(true);
                            });
                        }
                    });
                });
            });
        });
    }
    resolve(path) {
        path = new Path_1.Path(path, true, false).toString();
        if (path === '.') {
            path = '';
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        return Path_1.Path.normalize(this.options.root + '/' + path);
    }
    ls(path = '/', mount) {
        return __awaiter(this, void 0, void 0, function* () {
            path = this.resolve(path);
            return new Promise((resolve, reject) => {
                this.init().then(() => {
                    const ret = [];
                    let nodes = [];
                    const proceed = () => {
                        if (!nodes.length) {
                            resolve(ret);
                            return;
                        }
                        const next = nodes[0];
                        this.sftp.stat(path + '/' + next.filename, (err, stats) => {
                            if (err) {
                                console.error('err', err);
                                nodes.shift();
                                proceed();
                                return;
                            }
                            if (!stats) {
                                console.error('cant get stats for ' + next.filename + ' with path query ' + path);
                                nodes.shift();
                                proceed();
                                return;
                            }
                            ret.push(this.mapNode(path, next, stats, mount));
                            nodes.shift();
                            proceed();
                        });
                    };
                    this.sftp.readdir(path, (err, files) => {
                        if (err) {
                            reject(err);
                        }
                        if (files) {
                            nodes = files;
                        }
                        else {
                            console.error('have no files at ' + path, err);
                            reject(err);
                        }
                        proceed();
                    });
                });
            });
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new ssh2_1.Client();
            return new Promise((resolve, reject) => {
                this.client.on('error', reject);
                this.client.on('ready', () => {
                    this.client.sftp((err, sftp) => {
                        this.sftp = sftp;
                        resolve(true);
                    });
                }).connect({
                    host: this.options.host,
                    port: this.options.port,
                    username: this.options.user,
                    privateKey: this.options.key,
                    password: this.options.password
                });
            });
        });
    }
    parseOptions(options) {
        if (typeof options === "undefined") {
            throw new Error('options hash is required!');
        }
        options = options || {};
        options.host = options.host || "localhost";
        options.port = options.port || 22;
        options.user = options.user || "mc007";
        options.password = options.password || null;
        options.root = options.root || '/';
        if (options.key && fs.existsSync(options.key)) {
            options.key = require('fs').readFileSync(options.key);
        }
        return options;
    }
}
exports.VFS = VFS;
function test() {
    const ab = true;
    if (ab) {
        return;
    }
    let o = {
        host: '192.168.1.37',
        user: 'mc007',
        port: 22,
        password: '214,,asd'
    };
    let or = {
        host: 'pearls-media.com',
        user: 'vu2003',
        port: 22,
        key: '/home/mc007/.ssh/id_rsa'
    };
    let r = {
        options: or,
        enabled: true,
        name: 'sftp',
        path: '',
        readOnly: false,
        type: Resource_1.EResourceType.FILE_PROXY,
        label: '',
        vfs: '',
        url: ''
    };
    let vfs = new VFS(r);
    vfs.ls('/var/www/virtual/pearls-media.com').then((nodes) => {
        console.log('node', [nodes[0], nodes[1]]);
    });
    // console.log('vfs', vfs);
}
exports.test = test;
// test();
//# sourceMappingURL=sftp.js.map