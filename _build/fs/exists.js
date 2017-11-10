"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const validate_1 = require("./utils/validate");
const interfaces_1 = require("./interfaces");
function validateInput(methodName, path) {
    const methodSignature = methodName + '(path)';
    validate_1.validateArgument(methodSignature, 'path', path, ['string']);
}
exports.validateInput = validateInput;
;
// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------
function sync(path) {
    let stat;
    try {
        stat = fs_1.statSync(path);
        if (stat.isDirectory()) {
            return 'dir';
        }
        else if (stat.isFile()) {
            return 'file';
        }
        return 'other';
    }
    catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
            throw err;
        }
    }
    return false;
}
exports.sync = sync;
;
// ---------------------------------------------------------
// Async
// ---------------------------------------------------------
function async(path) {
    return new Promise((resolve, reject) => {
        fs_1.lstat(path, (err, stat) => {
            if (err) {
                if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                    resolve(false);
                }
                else {
                    reject(err);
                }
            }
            else if (stat.isDirectory()) {
                resolve(interfaces_1.ENodeType.DIR);
            }
            else if (stat.isFile()) {
                resolve(interfaces_1.ENodeType.FILE);
            }
            else {
                resolve(interfaces_1.ENodeType.OTHER);
            }
        });
    });
}
exports.async = async;
;
//# sourceMappingURL=exists.js.map