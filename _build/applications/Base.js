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
const Koa = require("koa");
const _ = require("lodash");
const http = require('http');
const compress = require('koa-compress');
const SRC_DIR = '/Code/client/src/';
const LIB_DIR = SRC_DIR + 'lib/';
const destroyable = require('server-destroy');
const io = {
    serialize: JSON.stringify
};
var IInterface;
(function (IInterface) {
    IInterface[IInterface["CLI"] = 'cli'] = "CLI";
    IInterface[IInterface["ELECTRON"] = 'electron'] = "ELECTRON";
})(IInterface = exports.IInterface || (exports.IInterface = {}));
exports.ENV = {
    VARIABLES: {
        SRC_DIR: SRC_DIR,
        LIB_DIR: LIB_DIR,
        'XAS_WEB': function (origin) {
            return origin + LIB_DIR;
        },
        'APP_URL': function (origin) {
            return origin + SRC_DIR;
        },
        'RPC_URL': function (origin) {
            return origin + '/smd';
        },
        APP_ROOT: function (app) {
            return app.config['APP_ROOT'];
        },
        CLIENT_ROOT: function (app) {
            return app.config['CLIENT_ROOT'];
        },
        RELEASE: function (app) {
            return app.config['RELEASE'];
        }
    }
};
exports.EEKey = {
    'XAS_WEB': 'XAS_WEB',
    'APP_URL': 'APP_URL',
    'RPC_URL': 'RPC_URL',
    'RESOURCE_VARIABLES': 'RESOURCE_VARIABLES',
    'DOJOPACKAGES': 'DOJOPACKAGES',
    'THEME': 'THEME',
    'APP_ROOT': 'APP_ROOT',
    'DATA_ROOT': 'DATA_ROOT',
    'DB_ROOT': 'DB_ROOT',
    'BASE_URL': 'BASE_URL',
    'CLIENT_ROOT': 'CLIENT_ROOT',
    'LIB_DIR': exports.ENV.VARIABLES.LIB_DIR,
    'RELEASE': 'RELEASE',
    'NODE_ROOT': 'NODE_ROOT',
    'ROOT': 'ROOT',
    'VFS_URL': 'VFS_URL',
    'VFS_CONFIG': 'VFS_CONFIG',
    'SYSTEM_ROOT': 'SYSTEM_ROOT',
    'USER_DIRECTORY': 'USER_DIRECTORY',
    'DEVICES': 'devices',
    'DRIVERS': 'drivers',
    'WORKSPACE': 'workspace',
    'USER_DEVICES': 'user_devices',
    'USER_DRIVERS': 'user_drivers',
    'SYSTEM_DRIVERS': 'system_drivers',
    'SYSTEM_DEVICES': 'SYSTEM_DEVICES'
};
var ELayout;
(function (ELayout) {
    ELayout[ELayout["NODE_JS"] = 'NODE_JS'] = "NODE_JS";
    ELayout[ELayout["SOURCE"] = 'SOURCE'] = "SOURCE";
    ELayout[ELayout["OFFLINE_RELEASE"] = 'OFFLINE_RELEASE'] = "OFFLINE_RELEASE";
})(ELayout = exports.ELayout || (exports.ELayout = {}));
exports.ESKey = {
    'SettingsService': 'settingsService'
};
function ENV_VAR(key) {
    return exports.ENV.VARIABLES[key];
}
exports.ENV_VAR = ENV_VAR;
class ApplicationBase extends Koa {
    constructor(root) {
        super();
        this.uuid = 'no uuid';
    }
    externalServices() {
        return [];
    }
    path(key) {
        return this.config[key];
    }
    relativeVariable(key, value) {
        if (value != null) {
            this.config['relativeVariables'][key] = value;
        }
        return this.config['relativeVariables'][key];
    }
    vfsMounts() {
        return this.relativeVariable('VFS_CONFIG');
    }
    _env(origin, key) {
        switch (key) {
            case exports.EEKey.APP_ROOT: {
                return this.config[exports.EEKey.APP_ROOT];
            }
            case exports.EEKey.CLIENT_ROOT: {
                return this.config[exports.EEKey.CLIENT_ROOT];
            }
        }
        return exports.ENV.VARIABLES[key];
    }
    variables(ctx, dst) {
        let origin = ctx.request.origin;
        dst = dst || [];
        _.each([
            exports.EEKey.XAS_WEB,
            exports.EEKey.APP_URL,
            exports.EEKey.RPC_URL
        ], key => {
            this._env(origin, key);
        }, this);
        const baseUrl = this._env(origin, exports.EEKey.XAS_WEB);
        dst['BASE_URL'] = baseUrl(origin);
        dst['APP_URL'] = this._env(origin, exports.EEKey.APP_URL)(origin);
        dst[exports.EEKey.XAS_WEB] = this._env(origin, exports.EEKey.APP_URL)(origin);
        dst['RPC_URL'] = this._env(origin, exports.EEKey.RPC_URL)(origin);
        dst['VFS_URL'] = origin + '/files/';
        dst[exports.EEKey.ROOT] = origin + '/';
        dst[exports.EEKey.DOJOPACKAGES] = io.serialize(this.packages(origin + '/files/', baseUrl(origin)));
        dst[exports.EEKey.RESOURCE_VARIABLES] = io.serialize(dst);
        const settingsService = this[exports.ESKey.SettingsService];
        if (settingsService) {
            try {
                const theme = _.find(settingsService.get('settings', '.')['settings'], { id: 'theme' })['value'] || ctx.params.theme || 'white';
                dst[exports.EEKey.THEME] = theme;
            }
            catch (e) {
                console.error('error reading user settings file');
                dst[exports.EEKey.THEME] = 'white';
            }
        }
        return dst;
    }
    rpcServices() {
        return [];
    }
    boot() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(null);
        });
    }
    run() {
        const koaHandler = this.callback();
        this.server = http.createServer(koaHandler);
        this.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.req.socket.setNoDelay(true);
            yield next();
        }));
        destroyable(this.server);
    }
    setup() {
        this.use(compress({
            filter: function (type) {
                return /text/i.test(type) || /json/i.test(type) || /javascript/i.test(type);
            },
            threshold: 2048,
            flush: require('zlib').Z_SYNC_FLUSH
        }));
    }
    packages(offset, baseUrl) {
        return [];
    }
}
exports.ApplicationBase = ApplicationBase;
//# sourceMappingURL=Base.js.map