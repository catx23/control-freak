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
const Base_1 = require("./../Base");
const index_1 = require("../../interfaces/index");
const Application_1 = require("../../interfaces/Application");
const Service_1 = require("../../interfaces/Service");
const app_1 = require("./route/app");
const smd_1 = require("../../route/smd");
const files_1 = require("../../route/files");
const uploads_1 = require("../../route/uploads");
const JSON_RPC_2_1 = require("../../rpc/JSON-RPC-2");
const Devices_1 = require("../../services/Devices");
const Directory_1 = require("./services/Directory");
const Drivers_1 = require("../../services/Drivers");
const JSONFile_1 = require("../../services/JSONFile");
const Mounts_1 = require("../../services/Mounts");
const Services_1 = require("../../services/Services");
const Tracking_1 = require("../../services/Tracking");
const Mongod_1 = require("../../services/external/Mongod");
const xideve_1 = require("../../components/xideve/xideve");
const xfile_1 = require("../../components/xfile/xfile");
const Logs_1 = require("../../services/Logs");
const register_1 = require("../../services/register");
const Koa = require("koa");
const convert = require("koa-convert");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const cors = require('koa2-cors');
const path = require("path");
const _ = require("lodash");
const os = require("os");
const file_1 = require("../../io/file");
const json_1 = require("../../io/json");
const yargs_parser = require("yargs-parser");
const console_1 = require("../../console");
const io_1 = require("../../interfaces/io");
const cli_1 = require("./cli");
cli_1.create();
const open_1 = require("../../utils/open");
const app_2 = require("./desktop/app");
const mount = require('koa-mount');
const argv = yargs_parser(process.argv.slice(2));
const util = require('util');
const osTmpdir = require('os-tmpdir');
const mkdirp = require('mkdirp');
const MODULE_ROOT = '../../';
const COMPONENT_ROOT = '../../components/';
// import { serveIndex } from '../../server/index';
// tslint:disable-next-line:interface-name
class ControlFreak extends Base_1.ApplicationBase {
    constructor(options) {
        super(options.root);
        this.uuid = 'ide';
        this.deviceServer = null;
        this.profile = null;
        this.running = {};
        this.options = options;
        this.root = options.root;
        this.uuid = options.uuid;
        const APP_ROOT = this.root;
        const CLIENT_ROOT = path.join(APP_ROOT, 'Code/client/src/');
        const NODE_ROOT = options.release ? process.cwd() : path.join(APP_ROOT, 'server/nodejs/');
        const USER_DIRECTORY = options.user || path.join(APP_ROOT, '/user');
        const DATA_ROOT = path.join(APP_ROOT, '/data/');
        let DB_ROOT = null;
        if (this.options.persistence === Application_1.EPersistence.MONGO) {
            const TMP_PATH = osTmpdir();
            if (argv.mqtt !== 'false') {
                try {
                    mkdirp.sync(TMP_PATH + path.sep + '_MONGO' + '_' + this.uuid);
                }
                catch (e) {
                    console_1.console.error('error creating MONGO Database path ' + TMP_PATH + path.sep + '_MONGO' + '_' + this.uuid);
                }
            }
            DB_ROOT = path.resolve(TMP_PATH + path.sep + '_MONGO_' + this.uuid);
        }
        const SYSTEM_ROOT = path.join(DATA_ROOT, '/system/');
        const VFS_CONFIG = {
            'workspace': path.join(USER_DIRECTORY, 'workspace'),
            'workspace_user': path.join(USER_DIRECTORY, 'workspace'),
            'docs': path.join(APP_ROOT, 'documentation/docFiles'),
            'system_drivers': path.join(SYSTEM_ROOT, 'drivers'),
            'user_drivers': path.join(USER_DIRECTORY, 'drivers'),
            'system_devices': path.join(SYSTEM_ROOT, 'devices'),
            'user_devices': path.join(USER_DIRECTORY, 'devices'),
            'user': path.join(USER_DIRECTORY),
            'root': options.root
        };
        let params = {
            APP_ROOT: APP_ROOT,
            DB_ROOT: DB_ROOT,
            USER_DIRECTORY: USER_DIRECTORY,
            DATA_ROOT: DATA_ROOT,
            SYSTEM_ROOT: SYSTEM_ROOT,
            NODE_ROOT: NODE_ROOT,
            CLIENT_ROOT: CLIENT_ROOT,
            relativeVariables: {
                'XASWEB': '../Code/client/src/',
                'APP_URL': '../Code/client/src',
                'APP_URL_VE': '../',
                'RPC_URL': '../smd',
                'XCF_SYSTEM_DRIVERS': '""',
                'XCF_USER_DRIVERS': '""',
                'XCF_SYSTEM_DEVICES': '""',
                'XCF_USER_DEVICES': '""',
                'XCF_MOUNTS': '{}',
                'XCF_DRIVER_VFS_CONFIG': '{}',
                'XCF_DEVICE_VFS_CONFIG': '{}',
                'XAPP_PLUGIN_RESOURCES': '{}',
                'THEME': 'white',
                'COMPONENTS': {
                    'xfile': true,
                    'xnode': true,
                    'xideve': { cmdOffset: '/' },
                    'xblox': true,
                    'x-markdown': true,
                    'xtrack': true,
                    'protocols': false
                },
                VFS_CONFIG: VFS_CONFIG,
                USER_DIRECTORY: USER_DIRECTORY,
                // back compat
                VFS_GET_URL: '../../files/',
                // required by export
                PLATFORM: os.platform(),
                ARCH: os.arch() === 'x64' ? index_1.EArch.x64 : index_1.EArch.x32
            },
            absoluteVariables: {
                'XASWEB': path.join(CLIENT_ROOT)
            }
        };
        this.config = params;
        this.config[Base_1.EEKey.NODE_ROOT] = NODE_ROOT;
        this.profile = this._getProfile(argv.profile);
        if (argv.port) {
            this.profile.http.port = argv.port;
        }
        if (argv.host) {
            this.profile.http.host = argv.host;
        }
        if (argv.print === 'true') {
            console_1.console.log('Config', util.inspect(params));
            console_1.console.log('\n\n');
            console_1.console.log('Options', util.inspect(this.options));
        }
    }
    _getProfile(_path) {
        let data = null;
        try {
            _path = _path ? path.resolve(_path) : path.join(this.path(Base_1.EEKey.NODE_ROOT), 'nxappmain/profile_device_server.json');
            console_1.console.info('ControlFreak#init : use server profile from ' + _path);
            data = json_1.deserialize(file_1.read(_path));
        }
        catch (e) {
            console_1.console.error('error reading profile : ', e);
        }
        return data || {
            mongo: {
                port: 27017
            },
            http: {
                port: 5555,
                host: "0.0.0.0"
            }
        };
    }
    runClass(data, deviceServerContext) {
        const _class = data['class'];
        const _args = data['args'];
        let _module = null;
        const delegate = {
            data: data,
            clear: function () {
                this.data.progress = null;
                this.data.finish = null;
                this.data.error = null;
                this.data.data = null;
            },
            onProgress: function (progress, data) {
                this.clear();
                this.data.progress = progress;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            },
            onFinish: function (finish, data) {
                this.clear();
                this.data.finish = finish;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            },
            onError: function (error, data) {
                this.clear();
                this.data.error = error;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            }
        };
        try {
            _module = require(MODULE_ROOT + _class);
        }
        catch (e) {
            console_1.console.error('runClass# Error : cant find class ' + _class);
            data['error'] = e.message;
            deviceServerContext.broadCastMessage(null, data);
            return;
        }
        try {
            let instance = new _module.default(_args, delegate);
            instance.run();
        }
        catch (e) {
            data['error'] = e.message;
            deviceServerContext.broadCastMessage(null, data);
        }
    }
    runClassMethod(data, deviceServerContext, client) {
        const _class = data['class'];
        const _args = data['args'];
        const _method = data['method'];
        let _module = null;
        const delegate = {
            data: data,
            clear: function () {
                this.data.progress = null;
                this.data.finish = null;
                this.data.error = null;
                this.data.data = null;
            },
            onProgress: function (progress, data) {
                this.clear();
                this.data.progress = progress;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            },
            onFinish: function (finish, data) {
                this.clear();
                this.data.finish = finish;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            },
            onError: function (error, data) {
                this.clear();
                this.data.error = error;
                this.data.data = data;
                deviceServerContext.broadCastMessage(null, this.data);
            }
        };
        try {
            _module = require(MODULE_ROOT + _class);
        }
        catch (e) {
            console_1.console.error('runClass# Error : cant find class ' + _class);
            data['error'] = e.message;
            deviceServerContext.broadCastMessage(null, data);
            return;
        }
        _args['app'] = this;
        try {
            let instance = new _module.default(_args, delegate);
            instance[_method]();
        }
        catch (e) {
            data['error'] = e.message;
            deviceServerContext.broadCastMessage(null, data);
        }
    }
    getComponent(name) {
        if (name === 'xfile') {
            return xfile_1.XFILE;
        }
    }
    cancelComponentMethod(data, deviceServerContext, client) {
        const _id = data['id'];
        if (this.running[_id]) {
            this.running[_id].cancel();
            delete this.running[_id];
        }
        else {
            console_1.console.error('cant cancel component method: no instance for id ' + _id);
        }
    }
    answerAppServerComponentMethodInterrupt(data, deviceServerContext, client) {
        const _id = data['id'];
        if (this.running[_id]) {
            this.running[_id].answer(data['answer']);
        }
        else {
            console_1.console.error('cant answer component method interrupt: no instance for id ' + _id, this.running);
        }
    }
    /**
     * runClass is a back - compat port for nxapp,
     */
    runComponentMethod(data, deviceServerContext, client) {
        const componentClass = data['component'];
        const _args = [].concat(data['args']);
        const _options = data['options'];
        const _id = _options['id'];
        const _method = data['method'];
        let instance = null;
        const delegate = {
            data: data,
            clear: function () {
                this.data.progress = null;
                this.data.finish = null;
                this.data.error = null;
                this.data.data = null;
                this.data.interrupt = null;
            },
            onProgress: function (progress, data) {
                this.clear();
                this.data.progress = progress;
                this.data.data = data;
                deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(this.data)));
            },
            onFinish: function (finish, data) {
                this.clear();
                this.data.finish = finish;
                this.data.data = data;
                deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(this.data)));
            },
            onError: function (error, data) {
                this.clear();
                this.data.error = error;
                this.data.data = data;
                deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(this.data)));
                self.running[_id].destroy();
                delete self.running[_id];
            },
            onInterrupt: function (interrupt, data) {
                this.clear();
                this.data.data = data;
                this.data.interrupt = interrupt;
                deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(this.data)));
            },
            end: function () {
                self.running[_id].destroy();
                delete self.running[_id];
            }
        };
        _options.delegate = delegate;
        // let _module: Component = this.getComponent(component);
        let _module = null;
        try {
            _module = this.getComponent(componentClass);
        }
        catch (e) {
            console_1.console.error('runComponentMethod# Error : cant find component ' + componentClass + ' at ' + path.resolve(COMPONENT_ROOT + componentClass), data);
            data['error'] = e.message;
            deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(data)));
            return;
        }
        try {
            instance = new _module(this, this.serviceConfig(), _options);
        }
        catch (e) {
            data['error'] = e.message;
            deviceServerContext.deviceServer.sendClientMessage(client, null, 'onRunClassEvent', JSON.parse(json_1.safe(data)));
            return;
        }
        let abort = false;
        let self = this;
        if (abort) {
            return;
        }
        if (!_module) {
            console_1.console.error('runComponentMethod# Error : cant find component' + componentClass);
            data['error'] = 'runComponentMethod# Error : cant find component';
            deviceServerContext.broadCastMessage(null, JSON.parse(json_1.safe(data)));
            return;
        }
        if (!instance[_method]) {
            let msg = 'runComponent# Error : component ' + componentClass + ' has no such method : ' + _method;
            console_1.console.error(msg);
            data['error'] = msg;
            deviceServerContext.broadCastMessage(null, JSON.parse(json_1.safe(data)));
            return;
        }
        try {
            instance[_method].apply(instance, _args);
            this.running[_id] = instance;
        }
        catch (e) {
            data['error'] = e.message;
            console_1.console.error('error running component method :' + componentClass + '#' + _method, e);
            deviceServerContext.broadCastMessage(null, JSON.parse(json_1.safe(data)));
        }
        client.on('close', function () {
            self.running[_id].cancel();
            self.running[_id].destroy();
            delete self.running[_id];
        });
    }
    externalServices() {
        if (this.options.persistence === Application_1.EPersistence.MONGO) {
            let searchPaths = [];
            if (this.options.type === Base_1.ELayout.OFFLINE_RELEASE) {
                searchPaths.push(path.resolve(path.join(this.path(Base_1.EEKey.APP_ROOT), 'mongo')));
            }
            const mongod = new Mongod_1.Mongod({
                db: this.path(Base_1.EEKey.DB_ROOT),
                port: this.profile.mongo.port
            }, searchPaths, this.options.print);
            return [mongod];
        }
        else {
            return [];
        }
    }
    vfsConfig() {
        return {
            configPath: path.join(this.path(Base_1.EEKey.SYSTEM_ROOT), 'vfs.json'),
            relativeVariables: {},
            absoluteVariables: this.vfsMounts()
        };
    }
    serviceConfig() {
        return Service_1.create(this.vfsConfig(), this);
    }
    components() {
        if (!this._components) {
            const serviceConfig = this.serviceConfig();
            this._components = [new xideve_1.XIDEVE(this, serviceConfig)];
        }
        return this._components;
    }
    rpcServices() {
        if (this._rpcServices) {
            return this._rpcServices;
        }
        const serviceConfig = this.serviceConfig();
        const settingsService = this.settingsService = new JSONFile_1.JSONFileService(path.join(this.path('USER_DIRECTORY'), 'settings.json'));
        const directoryService = this.directoryService = new Directory_1.DirectoryService(this.vfsConfig());
        const mountService = new Mounts_1.MountService(path.join(this.path(Base_1.EEKey.DATA_ROOT), 'system/vfs.json'));
        const driverService = new Drivers_1.DriverService(serviceConfig);
        const devicesService = new Devices_1.DeviceService(serviceConfig);
        const logsService = new Logs_1.LogsService(serviceConfig);
        const nodeService = new Services_1.NodeService(path.join(this.path(Base_1.EEKey.DATA_ROOT), 'system/services-debug.json'));
        nodeService.setDeviceServerPort(this.profile.socket_server.port);
        const trackingService = new Tracking_1.TrackingService(path.join(this.path('USER_DIRECTORY'), 'meta.json'));
        const components = this.components();
        let componentServices = [];
        _.each(components, component => {
            componentServices.push(...component.services(serviceConfig));
        });
        this._rpcServices = [directoryService, mountService, driverService, devicesService, logsService, nodeService, settingsService, trackingService];
        this._rpcServices = this._rpcServices.concat(componentServices);
        return this._rpcServices;
    }
    variables(ctx, dst) {
        let origin = ctx.request.origin;
        dst = dst || [];
        _.each([
            Base_1.EEKey.XAS_WEB,
            Base_1.EEKey.APP_URL,
            Base_1.EEKey.RPC_URL
        ], key => {
            this._env(origin, key);
        }, this);
        const baseUrl = this._env(origin, Base_1.EEKey.XAS_WEB);
        dst[Base_1.EEKey.BASE_URL] = baseUrl(origin);
        dst[Base_1.EEKey.APP_URL] = this._env(origin, Base_1.EEKey.APP_URL)(origin);
        dst['XASWEB'] = this._env(origin, Base_1.EEKey.APP_URL)(origin);
        dst[Base_1.EEKey.RPC_URL] = this._env(origin, Base_1.EEKey.RPC_URL)(origin);
        dst['VFS_URL'] = origin + '/files/';
        dst[Base_1.EEKey.ROOT] = origin + '/';
        const urlArgs = ctx.request.query;
        let USER_DIRECTORY = urlArgs['userDirectory'];
        if (USER_DIRECTORY) {
            dst[Base_1.EEKey.USER_DIRECTORY] = USER_DIRECTORY;
            const VFS_CONF = this.vfsMounts();
            VFS_CONF[Base_1.EEKey.USER_DRIVERS] = path.join(USER_DIRECTORY, Base_1.EEKey.DRIVERS);
            VFS_CONF[Base_1.EEKey.USER_DEVICES] = path.join(USER_DIRECTORY, Base_1.EEKey.DEVICES);
            VFS_CONF[Base_1.EEKey.WORKSPACE] = path.join(USER_DIRECTORY, Base_1.EEKey.WORKSPACE);
            VFS_CONF['workspace_user'] = path.join(USER_DIRECTORY, Base_1.EEKey.WORKSPACE);
            dst[Base_1.EEKey.VFS_CONFIG] = VFS_CONF;
        }
        dst[Base_1.EEKey.DOJOPACKAGES] = io_1.io.serialize(this.packages(origin + '/files/', baseUrl(origin)));
        dst[Base_1.EEKey.RESOURCE_VARIABLES] = io_1.io.serialize(dst);
        const settingsService = this[Base_1.ESKey.SettingsService];
        if (settingsService) {
            try {
                let theme = ctx.params.theme || 'white';
                const t = _.find(settingsService.get('settings', '.', null, ctx.request)['settings'], { id: 'theme' });
                if (t && t['value']) {
                    theme = t['value'];
                }
                dst[Base_1.EEKey.THEME] = theme;
            }
            catch (e) {
                console_1.console.error('Cant read settings file, user = ' + USER_DIRECTORY, e);
            }
        }
        return dst;
    }
    routes() {
        const filesRoute = files_1.create(this.directoryService, '/files', this);
        const uploadRoute = uploads_1.create(this.directoryService, '/upload', this);
        const components = this.components();
        let componentRoutes = [];
        _.each(components, component => {
            componentRoutes.push(...component.routes());
        });
        this._routes = [uploadRoute, app_1.default, smd_1.default, filesRoute];
        this._routes.push(...componentRoutes);
        return this._routes;
    }
    setup() {
        super.setup();
        this.use(cors({
            origin: function (ctx) {
                return '*';
            },
            allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'xapp_debug_data', 'X-Requested-With']
        }));
        // RPC stack
        this.rpc2 = JSON_RPC_2_1.JSON_RPC_2();
        const rpcApp = new Koa();
        rpcApp.use(convert(this.rpc2.app()));
        this.use(convert(mount('/api', rpcApp)));
        // pretty index browser, must be 'used' no later than at this point
        // this.use(serveIndex(this.path(EEKey.APP_ROOT), {
        // 	icons: true,
        // 	view: 'details'
        // }));
        // RPC services
        const services = this.rpcServices();
        _.each(services, (service) => register_1.registerService(this.rpc2, service, this));
        // Generics
        this.use(convert(bodyParser({
            formLimit: null
        })));
        // Routes
        const routes = this.routes();
        _.each(routes, route => {
            this.use(route.routes());
            this.use(route.allowedMethods({
                throw: true,
                methodNotAllowed: () => {
                    console_1.console.log('e', arguments);
                }
            }));
        });
        // Extras
        this.use(serve(this.path(Base_1.EEKey.APP_ROOT)));
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.deviceServer.destroy();
            // @TODO: get rid of 'server-destroy'
            this.server['destroy']();
            const services = this.externalServices();
            let last = null;
            try {
                const res = [];
                for (let index = 0; index < services.length; index++) {
                    let service = services[index];
                    last = service;
                    res.push(yield service.stop());
                }
                return Promise.all(res);
            }
            catch (e) {
                console_1.console.error('Error stopping ' + last.label(), e);
            }
        });
    }
    boot() {
        return __awaiter(this, void 0, void 0, function* () {
            this._externalServices = this.externalServices();
            return yield Promise.all(this._externalServices.map((service) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console_1.console.info('ControlFreak#boot : run external service: ' + service.label());
                    yield service.run();
                }
                catch (e) {
                    console_1.console.error('error running service ' + service.label(), e);
                }
            })));
        });
    }
    dConfig(clientRoot, serverRoot, base, packages) {
        let dojoConfig = {
            libRoot: clientRoot,
            clientRoot: clientRoot,
            cwd: serverRoot,
            hasCache: {
                'host-node': 1,
                'host-browser': 0,
                'dom': 0,
                'dojo-amd-factory-scan': 0,
                'dojo-has-api': 1,
                'dojo-inject-api': 0,
                'dojo-timeout-api': 0,
                'dojo-trace-api': 1,
                'dojo-log-api': 0,
                'dojo-dom-ready-api': 0,
                'dojo-publish-privates': 1,
                'dojo-config-api': 1,
                'dojo-sniff': 1,
                'dojo-sync-loader': 0,
                'dojo-test-sniff': 0,
                'config-deferredInstrumentation': 1,
                'config-useDeferredInstrumentation': 'report-unhandled-rejections',
                'config-tlmSiblingOfDojo': 1,
                'xlog': true,
                'xblox': true,
                'dojo-undef-api': true,
                'debug': true,
                'dcl': false,
                'dojo': true
            },
            trace: 0,
            async: 0,
            baseUrl: base || serverRoot || '.',
            packages: [
                {
                    name: 'dojo',
                    location: 'dojo'
                },
                {
                    name: 'nxappmain',
                    location: serverRoot + path.sep + 'nxappmain'
                },
                {
                    name: 'nxapp',
                    location: serverRoot + path.sep + 'nxapp'
                },
                {
                    name: 'requirejs-dplugins2',
                    location: clientRoot + path.sep + 'xibm/ibm/requirejs-dplugins'
                },
                {
                    name: 'xcf',
                    location: clientRoot + path.sep + 'xcf'
                },
                {
                    name: 'dstore',
                    location: clientRoot + path.sep + 'dstore'
                },
                {
                    name: 'xide',
                    location: clientRoot + path.sep + 'xide'
                },
                {
                    name: 'xwire',
                    location: clientRoot + path.sep + 'xwire'
                },
                {
                    name: 'dcl',
                    location: clientRoot + path.sep + 'dcl'
                },
                {
                    name: 'xblox',
                    location: clientRoot + path.sep + 'xblox'
                },
                {
                    name: 'xlog',
                    location: clientRoot + path.sep + 'xlog'
                },
                {
                    name: 'xblox',
                    location: clientRoot + path.sep + 'xblox'
                },
                {
                    name: 'dstore',
                    location: clientRoot + path.sep + 'dstore'
                },
                {
                    name: 'dijit',
                    location: clientRoot + path.sep + 'dijit'
                },
                {
                    name: 'xlang',
                    location: clientRoot + path.sep + 'xlang'
                },
                {
                    name: 'xgrid',
                    location: clientRoot + path.sep + 'xgrid'
                },
                {
                    name: 'xaction',
                    location: clientRoot + path.sep + 'xaction/src'
                },
                {
                    name: 'xdojo',
                    location: clientRoot + path.sep + 'xdojo'
                }
            ]
        };
        return dojoConfig;
    }
    getIps() {
        const ifaces = os.networkInterfaces();
        const ips = [];
        Object.keys(ifaces).forEach(function (ifname) {
            let alias = 0;
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    ips.push({
                        face: ifname + alias,
                        ip: iface.address
                    });
                }
                else {
                    ips.push({
                        face: ifname,
                        ip: iface.address
                    });
                }
                ++alias;
            });
        });
        return ips;
    }
    isDev() {
        return __filename.indexOf('.ts') !== -1;
    }
    ready(url) {
        if (this.options.interface === Base_1.IInterface.ELECTRON) {
            let appPath = null;
            if (this.isDev()) {
                appPath = path.resolve(path.join(process.cwd(), 'build/applications/ControlFreak/desktop'));
                console_1.console.log('ControlFreak#run : start desktop application' + appPath);
                app_2.runElectron(process.cwd(), appPath, this.path(Base_1.EEKey.USER_DIRECTORY));
            }
        }
        if (process.argv.join(' ').indexOf('.ts') === -1) {
            open_1.default(url, null);
        }
    }
    run(deviceServer = true) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            process.once('SIGINT', (e) => { return this.stop(); });
            process.on('unhandledRejection', (reason) => {
                console_1.console.error('Unhandled rejection, reason: ', reason);
            });
            yield this.boot();
            return new Promise((resolve, reject) => {
                this.setup();
                _super("run").call(this);
                console_1.console.info('ControlFreak#run : serve www at : ' + this.path(Base_1.EEKey.APP_ROOT));
                this.use(convert(serve(this.path(Base_1.EEKey.APP_ROOT), { maxage: 1 })));
                const port = this.profile.http.port || this.options.port || process.env.PORT || 5555;
                let host = this.profile.http.host || this.options.host || process.env.HOST || '0.0.0.0';
                let isWin = /^win/.test(process.platform);
                const ips = this.getIps();
                if (isWin && host === '0.0.0.0') {
                    // host = ips[0].ip;
                }
                console_1.console.info('ControlFreak#run : create HTTP server at ' + host + ':' + port);
                this.server.listen(port, host);
                if (!deviceServer) {
                    return Promise.resolve(true);
                }
                /*
                const clientRoot:string = path.join(this.path(EEKey.CLIENT_ROOT), '/lib');
                const nodeRoot:string = this.path('NODE_ROOT');
                const dConfig = this.dConfig(clientRoot, nodeRoot,null,null);
                dojoRequire.config(dConfig);*/
                // console.log('dconfig ',dConfig);
                // return;
                const amdRequire = require(path.join(process.cwd(), !this.options.release ? '../dojo/dojo-require' : '/dojo/dojo-require'));
                const dojoRequire = amdRequire(path.join(this.path(Base_1.EEKey.CLIENT_ROOT), '/lib'), this.path('NODE_ROOT'));
                const loader = this.options.release ? 'nxappmain/main_server_ts_build' : 'nxappmain/main_server_ts';
                console_1.console.info('ControlFreak#run : load device server application');
                console_1.console.info('ControlFreak#run : User workspace : ' + this.path(Base_1.EEKey.USER_DIRECTORY));
                // as we don't really consume/mix AMD modules, we get the data over the xide/Context
                global.process.on('device-server-ready', (context) => {
                    // @TODO: v1 context in v2 app?
                    this.deviceServer = context;
                    context.setAppServer(this);
                    console_1.console.info('ControlFreak#run : device server ready');
                    console_1.console.info('ControlFreak	can be accessed at http://' + host + ':' + port + '/app/xcf?userDirectory=' + encodeURIComponent(this.path(Base_1.EEKey.USER_DIRECTORY)));
                    if (host === '0.0.0.0') {
                        ips.forEach((ip) => {
                            console_1.console.info('\t Found iface ' + ip.face + ' \t with IP = ' + ip.ip);
                        });
                    }
                    resolve(context);
                    if (isWin && host === '0.0.0.0') {
                        host = ips[0].ip;
                    }
                    this.ready('http://' + host + ':' +
                        port + '/app/xcf?userDirectory=' +
                        encodeURIComponent(this.path(Base_1.EEKey.USER_DIRECTORY)));
                });
                try {
                    dojoRequire([loader], (_module) => { });
                }
                catch (e) {
                    const message = 'Error in nxappmain/' + loader;
                    reject(message);
                }
            });
        });
    }
    _package(name, prefix, suffix = '') {
        // @TODO: check TS str interpolators
        let loc = (prefix || name);
        !~loc.endsWith('/') && (loc = loc + '/');
        !~suffix.endsWith('/') && (suffix = suffix + '/');
        return {
            name: name,
            location: loc + suffix
        };
    }
    packages(offset = '', baseUrl) {
        baseUrl = baseUrl || '';
        const result = [
            this._package(Base_1.EEKey.SYSTEM_DRIVERS, offset, Base_1.EEKey.SYSTEM_DRIVERS),
            this._package(Base_1.EEKey.USER_DRIVERS, offset, Base_1.EEKey.USER_DRIVERS),
            this._package(Base_1.EEKey.WORKSPACE, offset, Base_1.EEKey.WORKSPACE),
            this._package('maq-metadata-dojo', baseUrl, '/xideve/metadata/dojo/1.8/'),
            this._package('maq-metadata-html', baseUrl, '/xideve/metadata/html/0.8/'),
            this._package('maq-metadata-delite', baseUrl, '/xideve/metadata/delite/0.8/')
        ];
        return result;
    }
}
exports.ControlFreak = ControlFreak;
//# sourceMappingURL=index.js.map