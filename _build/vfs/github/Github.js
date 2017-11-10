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
/**
 * Experimental leg work of a Github - VFS adapter being used by some projects.
 */
const GitHubApi = require("github");
const objects_1 = require("@xblox/core/objects");
const Path_1 = require("../../model/Path");
const pathUtil = require("path");
const base64_1 = require("../../io/base64"); // gitdata.updateFile
const matcher_1 = require("../../fs/utils/matcher");
/**
 * Enumeration for getTree item types. Defined by Github
 * @link https://developer.github.com/v3/git/trees/
 * @export
 * @enum {string}
 */
var ETreeBlobNodeType;
(function (ETreeBlobNodeType) {
    ETreeBlobNodeType[ETreeBlobNodeType["BLOB"] = 'blob'] = "BLOB";
    ETreeBlobNodeType[ETreeBlobNodeType["TREE"] = 'tree'] = "TREE";
    ETreeBlobNodeType[ETreeBlobNodeType["COMMIT"] = 'commit'] = "COMMIT";
})(ETreeBlobNodeType = exports.ETreeBlobNodeType || (exports.ETreeBlobNodeType = {}));
/**
 * Class to retrieve a tree per user, owner and repo - name.
 * This will fetch the required parent SHA automatically first.
 * @link https://developer.github.com/v3/git/trees/
 *
 * @export
 * @class Tree
 */
class Tree {
    constructor(client, options) {
        this.client = client;
        this.options = options;
    }
    /**
     * Before doing anything, we need the tree's SHA.
     *
     * @param {boolean} [allowCached=true]
     * @returns {Promise<string>}
     *
     * @memberOf Tree
     */
    init(allowCached = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._sha && allowCached) {
                    return resolve(this._sha);
                }
                this.client.repos.getBranch(this.options, (e, res) => {
                    if (e) {
                        return reject(e);
                    }
                    this._sha = res.data.commit.sha;
                    resolve(this._sha);
                });
            });
        });
    }
    //
    // ─── DELETE ─────────────────────────────────────────────────────────────────────
    //
    parseDeleteOptions(options, path) {
        const opts = options || {};
        const parsedOptions = {};
        parsedOptions.progress = opts.progress;
        parsedOptions.conflictCallback = opts.conflictCallback;
        parsedOptions.conflictSettings = opts.conflictSettings;
        parsedOptions.debug = opts.debug;
        parsedOptions.trash = opts.trash;
        parsedOptions.matching = opts.matching;
        if (!opts.filter) {
            if (opts.matching) {
                parsedOptions.filter = matcher_1.create(path, opts.matching);
            }
            else {
                parsedOptions.filter = () => { return true; };
            }
        }
        return parsedOptions;
    }
    /**
     * Implement IVFS#delete
     *
     * @param {string} path
     * @param {string} [message="remove file"]
     * @returns {Promise<any[]>}
     *
     * @memberOf Tree
     */
    rm(path, message = "remove file", options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || this.parseDeleteOptions(options, path);
            return new Promise((resolve, reject) => {
                this.init().then((sha) => {
                    this.info(path, false).then((node) => {
                        let current = 0;
                        let total = 1;
                        // file
                        if (node.type === ETreeBlobNodeType.BLOB) {
                            let deleteArgs = this.extend({ path: path, message: message, sha: node.sha });
                            return this.client.repos.deleteFile(deleteArgs).then((res) => {
                                resolve([res]);
                            });
                        }
                        // folder, since a delete operation will alter the whole SHA on the tree,
                        // we have to then delete each node on by re-querying the tree's SHA subsequently
                        if (node.type === ETreeBlobNodeType.TREE) {
                            const ret = [];
                            const proceed = (nodes) => {
                                if (!nodes.length) {
                                    resolve(ret);
                                    return;
                                }
                                const next = nodes[0];
                                current++;
                                if (options.progress) {
                                    options.progress(node.path, current, total, VFS.mapNode(next));
                                }
                                if (next.type === ETreeBlobNodeType.TREE) {
                                    nodes.shift();
                                }
                                this.rm(next.path, message).then((res) => {
                                    nodes.shift();
                                    ret.push(...res);
                                    proceed(nodes);
                                }).catch((e) => {
                                    proceed(nodes);
                                });
                            };
                            this.children(path, true).then((nodes) => {
                                total = nodes.length;
                                proceed(nodes);
                            });
                        }
                    });
                });
            });
        });
    }
    info(path, allowCached = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.ls(true, allowCached).then((nodes) => {
                    const node = nodes.find((value, index, object) => {
                        return value.path === path;
                    });
                    if (node) {
                        resolve(node);
                    }
                    else {
                        reject('Cant find node for ' + path);
                    }
                }).catch(reject);
            });
        });
    }
    children(path, allowCached = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.ls(true, allowCached).then((nodes) => {
                    const node = nodes.find((value, index, object) => {
                        return value.path === path;
                    });
                    if (node) {
                        const paths = nodes.map((node) => {
                            return node.path;
                        });
                        const ret = new Path_1.Path(node.path).getChildren(paths, true).map((childPath) => {
                            return nodes.find((value, index, object) => {
                                return value.path === childPath;
                            });
                        });
                        resolve(ret);
                    }
                    else {
                        reject('Cant find node for ' + path);
                    }
                });
            });
        });
    }
    childrenSync(path, nodes) {
        const paths = nodes.map((node) => {
            return node.path;
        });
        const ret = new Path_1.Path(path).getChildren(paths, true).map((childPath) => {
            return nodes.find((value, index, object) => {
                return value.path === childPath;
            });
        });
        return ret;
    }
    ls(recursive = true, allowCached = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._tree && allowCached) {
                    return resolve(this._tree);
                }
                this.init(allowCached).then((sha) => {
                    this.client.gitdata.getTree(this.extend({
                        sha: this._sha,
                        recursive: recursive
                    }), (e, res) => {
                        if (e) {
                            return reject(e);
                        }
                        const tree = res.data.tree;
                        this._tree = tree;
                        resolve(tree);
                    });
                });
            });
        });
    }
    //
    // ─── UTILS ──────────────────────────────────────────────────────────────────────
    //
    /**
     * Most of the time, Github wants some basic parameters together with some API specific
     * parameters like path. This function will clone the base options and then merges the
     * extras.
     *
     * @param {*} args
     * @returns {*}
     *
     * @memberOf Tree
     */
    extend(args) {
        return objects_1.mixin(objects_1.clone(this.options), args);
    }
}
exports.Tree = Tree;
class VFS {
    constructor(resource) {
        this.resource = resource;
        this.options = resource.options;
        this.init();
    }
    extend(args) {
        return objects_1.mixin(objects_1.clone(this.options), args);
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
    static mapNode(node, mount, options) {
        const directory = node.type === ETreeBlobNodeType.TREE;
        const parent = new Path_1.Path(node.path, false, false).getParentPath();
        return {
            path: './' + node.path,
            sizeBytes: node.size,
            size: node.size,
            owner: {
                user: null,
                group: null
            },
            isDir: directory,
            directory: directory,
            mime: !directory ? 'file' : 'folder',
            name: pathUtil.win32.basename(node.path),
            fileType: directory ? 'folder' : 'file',
            mount: mount,
            parent: "./" + parent.toString(),
            type: ''
        };
    }
    get(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let getContentParams = this.extend({ path: path, ref: this.options.branch });
                this.client.repos.getContent(getContentParams, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res.data);
                });
            });
        });
    }
    /**
     * Impl. IVFS#set. This will update the file content.
     *
     * @TODOs
     * - This will fetch the file's info by retrieving the whole tree for getting
     *   the required SHA
     *
     * @param {string} path
     * @param {(String | Buffer)} content
     * @param {IObjectLiteral} [options]
     * @returns {Promise<string>}
     *
     * @memberOf VFS
     */
    set(path, content, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const tree = new Tree(this.client, this.resource.options);
                // split and strip slashes
                path = new Path_1.Path(path, false, false).toString();
                tree.info(new Path_1.Path(path, false, false).toString(), false).then((node) => {
                    options = options || {};
                    let params = options;
                    params.message = options['message'] || "no message";
                    params.content = base64_1.encode(content);
                    params.sha = node.sha;
                    params.path = path;
                    let setContentParams = objects_1.mixin(this.extend({ path: path, ref: this.options.branch }), params);
                    this.client.repos.updateFile(setContentParams, (err, res) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(res);
                    });
                });
            });
        });
    }
    ls(path, mount, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const tree = new Tree(this.client, this.resource.options);
                tree.ls(false).then((nodes) => {
                    const ret = nodes.map((node) => {
                        const newNode = VFS.mapNode(node, mount, options);
                        // for directories, we add all child nodes
                        if (newNode.directory) {
                            const children = tree.childrenSync(newNode.path, nodes);
                            if (children && children.length) {
                                newNode.children = children.map((child) => {
                                    return VFS.mapNode(child, mount, options);
                                });
                                newNode._EX = true;
                            }
                        }
                        return newNode;
                    });
                    resolve(ret);
                });
            });
        });
    }
    init() {
        this.client = new GitHubApi(this.resource.client || {
            // optional
            debug: false,
            protocol: "https",
            host: "api.github.com",
            // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
            headers: {
                "user-agent": "My-Cool-GitHub-App",
                "Accept": "application/vnd.github.v3.raw"
            },
            followRedirects: true,
            timeout: 5000
        });
        if (this.resource.auth) {
            this.client.authenticate(this.resource.auth);
        }
    }
}
exports.VFS = VFS;
function test() {
    let token = "5b86c11984717f8146756593644abe60785b5f";
    token += '1f';
    const owner = 'xblox';
    const repo = 'xide';
    const branch = 've';
    const tFile = 'mixins';
    try {
        let github = new GitHubApi({
            // optional
            debug: false,
            protocol: "https",
            host: "api.github.com",
            // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
            headers: {
                "user-agent": "My-Cool-GitHub-App",
                "Accept": "application/vnd.github.v3.raw"
            },
            followRedirects: true,
            timeout: 5000
        });
        github.authenticate({
            type: "oauth",
            token: token
        });
        let t = new Tree(github, { owner: owner, repo: repo, branch: branch });
        t.rm(tFile).then((res) => {
            console.log('removed file ', res);
        });
    }
    catch (e) {
        console.error('e', e);
    }
}
exports.test = test;
//# sourceMappingURL=Github.js.map