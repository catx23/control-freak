"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Platform;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform = exports.Platform || (exports.Platform = {}));
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isRootUser = false;
let _isNative = false;
let _isWeb = false;
let _isQunit = false;
exports._platform = Platform.Web;
// OS detection
if (typeof process === 'object') {
    _isWindows = (process.platform === 'win32');
    _isMacintosh = (process.platform === 'darwin');
    _isLinux = (process.platform === 'linux');
    _isRootUser = !_isWindows && (process.getuid() === 0);
    _isNative = true;
}
if (_isNative) {
    if (_isMacintosh) {
        exports._platform = Platform.Mac;
    }
    else if (_isWindows) {
        exports._platform = Platform.Windows;
    }
    else if (_isLinux) {
        exports._platform = Platform.Linux;
    }
}
exports.isWindows = _isWindows;
exports.isMacintosh = _isMacintosh;
exports.isLinux = _isLinux;
exports.isRootUser = _isRootUser;
exports.isNative = _isNative;
exports.isWeb = _isWeb;
exports.isQunit = _isQunit;
exports.platform = exports._platform;
//# sourceMappingURL=platform.js.map