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
const _ = require("lodash");
const Base_1 = require("./../Base");
const Service_1 = require("../../interfaces/Service");
const app_1 = require("./route/app");
const smd_1 = require("../../route/smd");
const files_1 = require("../../route/files");
const uploads_1 = require("../../route/uploads");
const JSON_RPC_2_1 = require("../../rpc/JSON-RPC-2");
const Directory_1 = require("../../services/Directory");
const JSONFile_1 = require("../../services/JSONFile");
const Mounts_1 = require("../../services/Mounts");
const register_1 = require("../../services/register");
const AnyPromise = require("any-promise");
const Koa = require("koa");
const convert = require("koa-convert");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const path = require("path");
const ACLC_1 = require("../../acl/ACLC");
const File_1 = require("../../acl/data/File");
const mount = require('koa-mount');
const serveStatic = require('koa-static');
const yargs = require("yargs-parser");
const index_1 = require("../../server/index");
let argv = yargs(process.argv.slice(2));
// tslint:disable-next-line:interface-name
// tslint:disable-next-line:class-name
class xbox extends Base_1.ApplicationBase {
    setupAcl2() {
        const backend = new File_1.File();
        let acl = new ACLC_1.ACL(backend, null, {});
        acl.allow('guest', 'blogs', 'view');
        // allow function accepts arrays as any parameter
        acl.allow('member', 'blogs', ['edit', 'view']);
        acl.addUserRoles('joed', 'member');
        acl.isAllowed('joed', 'blogs', 'view', function (err, res) {
            if (res) {
                console.log("User joed is allowed to view blogs");
            }
            else {
                console.log("User joed is not allowed to view blogs");
            }
        });
        acl.isAllowed('joed', 'blogs', 'delete', function (err, res) {
            if (res) {
                console.log("User joed is allowed to delete blogs");
            }
            else {
                console.log("User joed is not allowed to delete blogs");
            }
        });
        // const file = path.join(this._env(null, EEKey.APP_ROOT), '/acl.json');
        // (backend as FileBackend).write(file);
    }
    constructor(options) {
        super(options.root);
        this.options = options;
        this.root = options.root;
        const APP_ROOT = this.root;
        let CLIENT_ROOT = options.clientRoot || path.join(APP_ROOT, 'Code/client/src/');
        const NODE_ROOT = options.release === true ? process.cwd() : path.join(APP_ROOT, 'server/nodejs/');
        const DATA_ROOT = path.join(APP_ROOT, '/data/');
        const SYSTEM_ROOT = path.join(DATA_ROOT, '/system/');
        const USER_DIRECTORY = path.join(APP_ROOT, '/user');
        const VFS_CONFIG = {
            'docs': path.join(APP_ROOT, 'documentation/docFiles'),
            'root': argv.fileRoot ? path.resolve(argv.fileRoot) : APP_ROOT
        };
        const isNodeJSType = options.type === Base_1.ELayout.NODE_JS;
        if (isNodeJSType) {
            CLIENT_ROOT = path.join(NODE_ROOT, '/node_modules/xjs-dist/src/');
        }
        let params = {
            APP_ROOT: APP_ROOT,
            CLIENT_ROOT: CLIENT_ROOT,
            DATA_ROOT: DATA_ROOT,
            SYSTEM_ROOT: SYSTEM_ROOT,
            USER_DIRECTORY: USER_DIRECTORY,
            RELEASE: options.release,
            relativeVariables: {
                'XASWEB': isNodeJSType ? '/node_modules/xjs-dist/src/' : '../Code/client/src/',
                'APP_URL': isNodeJSType ? '/node_modules/xjs-dist/src/' : '../Code/client/src/',
                'APP_URL_VE': '../',
                'RPC_URL': '../smd',
                'XAPP_PLUGIN_RESOURCES': '{}',
                'THEME': 'white',
                "COMPONENTS": {
                    "xfile": true,
                    "xnode": false,
                    "xideve": false,
                    "xblox": false,
                    "x-markdown": false,
                    "xtrack": false,
                    "protocols": false
                },
                VFS_CONFIG: VFS_CONFIG,
                VFS_GET_URL: '../../files/'
            },
            absoluteVariables: {
                'XASWEB': path.join(CLIENT_ROOT)
            }
        };
        this.config = params;
        this.config['NODE_ROOT'] = NODE_ROOT;
    }
    vfsConfig() {
        return {
            configPath: path.join(this.path(Base_1.EEKey.SYSTEM_ROOT), 'vfs_xbox.json'),
            relativeVariables: {},
            absoluteVariables: this.vfsMounts()
        };
    }
    serviceConfig() {
        return Service_1.create(this.vfsConfig(), this);
    }
    rpcServices() {
        if (this._services) {
            return this._services;
        }
        const settingsService = this.settingsService = new JSONFile_1.JSONFileService(path.join(this.path('USER_DIRECTORY'), 'settings.json'));
        const directoryService = this.directoryService = new Directory_1.DirectoryService(this.vfsConfig());
        const mountService = new Mounts_1.MountService(path.join(this.path(Base_1.EEKey.DATA_ROOT), 'system/vfs_xbox.json'));
        this._services = [directoryService, mountService, settingsService];
        return this._services;
    }
    routes() {
        if (this._routes) {
            return this._routes;
        }
        const filesRoute = files_1.create(this.directoryService, '/files', this);
        const uploadRoute = uploads_1.create(this.directoryService, '/upload', this);
        this._routes = [filesRoute, app_1.default, smd_1.default, uploadRoute];
        return this._routes;
    }
    setup() {
        super.setup();
        // RPC stack
        this.rpc = JSON_RPC_2_1.JSON_RPC_2();
        const rpcApp = new Koa();
        rpcApp.use(convert(this.rpc.app()));
        this.use(convert(mount('/api', rpcApp)));
        //this.setupAcl2();
        // pretty index browser, must be 'used' no later than at this point
        this.use(index_1.serveIndex(this.path(Base_1.EEKey.APP_ROOT), {
            icons: true,
            view: 'details'
        }));
        // RPC services
        const services = this.rpcServices();
        _.each(services, service => {
            register_1.registerService(this.rpc, service, this);
        });
        // Generics
        this.use(convert(bodyParser({
            formLimit: null
        })));
        // Routes
        const routes = this.routes();
        _.each(routes, route => {
            this.use(route.routes());
            this.use(route.allowedMethods());
        });
        const root = this.options.release ? this.config['NODE_ROOT'] : this.path('APP_ROOT');
        // Extras
        //this.use(convert(serveIndex(root)));
        this.use(serveStatic(root));
    }
    run() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return new AnyPromise((resolve, reject) => {
                try {
                    this.boot();
                    this.setup();
                    _super("run").call(this);
                    this.use(convert(serve(this.path('APP_ROOT'))));
                    this.listen(this.options.port || process.env.PORT || 5555, '0.0.0.0');
                    resolve(true);
                }
                catch (e) {
                    console.error('error', e);
                }
            });
        });
    }
    packages(offset = '../../../../../') {
        return [];
    }
}
exports.xbox = xbox;
//# sourceMappingURL=index.js.map