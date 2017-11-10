"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const validate_1 = require("./utils/validate");
const platform_1 = require("./utils/platform");
const strings_1 = require("./utils/strings");
function validateInput(methodName, path) {
    const methodSignature = methodName + '(path)';
    validate_1.validateArgument(methodSignature, 'path', path, ['string', 'undefined']);
}
exports.validateInput = validateInput;
;
function _readdirSync(path) {
    // Mac: uses NFD unicode form on disk, but we want NFC
    // See also https://github.com/nodejs/node/issues/2165
    if (platform_1.isMacintosh) {
        return fs_1.readdirSync(path).map(c => strings_1.normalizeNFC(c));
    }
    return fs_1.readdirSync(path);
}
exports._readdirSync = _readdirSync;
// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------
function sync(path) {
    try {
        return _readdirSync(path);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // Doesn't exist. Return undefined instead of throwing.
            return undefined;
        }
        throw err;
    }
}
exports.sync = sync;
;
// ---------------------------------------------------------
// Async
// ---------------------------------------------------------
function readdirASync(path) {
    // export function readdir(path: string | Buffer, callback?: (err: NodeJS.ErrnoException, files: string[]) => void): void;
    // Mac: uses NFD unicode form on disk, but we want NFC
    // See also https://github.com/nodejs/node/issues/2165
    return new Promise((resolve, reject) => {
        if (platform_1.isMacintosh) {
            fs_1.readdir(path, (err, files) => {
                if (err) {
                    reject(err);
                }
                resolve(files);
            });
        }
        fs_1.readdir(path, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
        });
    });
}
function async(path) {
    return new Promise((resolve, reject) => {
        readdirASync(path)
            .then((list) => resolve(list))
            .catch(err => (err.code === 'ENOENT' ? resolve(undefined) : reject(err)));
    });
}
exports.async = async;
;
//# sourceMappingURL=list.js.map