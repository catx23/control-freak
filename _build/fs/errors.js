"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const errno = require('errno');
Object.keys(errno.code).forEach(function (code) {
    const e = errno.code[code];
    exports[code] = (path) => {
        let err = new Error(code + ', ' + e.description + (path ? ' \'' + path + '\'' : ''));
        err.errno = e.errno;
        err.code = code;
        err.path = path;
        return err;
    };
});
function ErrNoFileOrDir(path) {
    return new Error("Can't remove " + path + ' The path is not file nor directory');
}
exports.ErrNoFileOrDir = ErrNoFileOrDir;
;
function ErrCantDelete(path) {
    return new Error("Can't remove " + path);
}
exports.ErrCantDelete = ErrCantDelete;
;
function ErrNotFile(path) {
    return new Error('Path ' + path + ' exists but is not a file.' +
        ' Halting jetpack.file() call for safety reasons.');
}
exports.ErrNotFile = ErrNotFile;
;
function ErrNoDirectory(path) {
    return new Error('Path ' + path + ' exists but is not a directory.' +
        ' Halting jetpack.dir() call for safety reasons.');
}
exports.ErrNoDirectory = ErrNoDirectory;
;
function ErrDoesntExists(path) {
    const err = new Error("Path to copy doesn't exist " + path);
    err.code = 'ENOENT';
    return err;
}
exports.ErrDoesntExists = ErrDoesntExists;
;
function ErrDestinationExists(path) {
    const err = new Error('Destination path already exists ' + path);
    err.code = 'EEXIST';
    return err;
}
exports.ErrDestinationExists = ErrDestinationExists;
;
function ErrIsNotDirectory(path) {
    const err = new interfaces_1.ErrnoException('Path you want to find stuff in must be a directory ' + path);
    err.code = 'ENOTDIR';
    return err;
}
exports.ErrIsNotDirectory = ErrIsNotDirectory;
;
//# sourceMappingURL=errors.js.map