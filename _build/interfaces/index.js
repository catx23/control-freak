"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EPlatform;
(function (EPlatform) {
    EPlatform[EPlatform["Linux"] = 'linux'] = "Linux";
    EPlatform[EPlatform["Windows"] = 'win32'] = "Windows";
    EPlatform[EPlatform["OSX"] = 'darwin'] = "OSX";
})(EPlatform = exports.EPlatform || (exports.EPlatform = {}));
var EArch;
(function (EArch) {
    EArch[EArch["x64"] = '64'] = "x64";
    EArch[EArch["x32"] = '32'] = "x32";
})(EArch = exports.EArch || (exports.EArch = {}));
var EDeviceScope;
(function (EDeviceScope) {
    EDeviceScope[EDeviceScope["USER_DEVICES"] = 'user_devices'] = "USER_DEVICES";
    EDeviceScope[EDeviceScope["SYSTEM_DEVICES"] = 'system_devices'] = "SYSTEM_DEVICES";
})(EDeviceScope = exports.EDeviceScope || (exports.EDeviceScope = {}));
var EDriverScope;
(function (EDriverScope) {
    EDriverScope[EDriverScope["USER_DRIVERS"] = 'user_drivers'] = "USER_DRIVERS";
    EDriverScope[EDriverScope["SYSTEM_DRIVERS"] = 'system_drivers'] = "SYSTEM_DRIVERS";
})(EDriverScope = exports.EDriverScope || (exports.EDriverScope = {}));
//# sourceMappingURL=index.js.map