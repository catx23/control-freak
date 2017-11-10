"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathUtil = require("path");
const fs = require("fs");
const fs_1 = require("fs");
const Q = require('q');
const mkdirp = require("mkdirp");
const imports_1 = require("./imports");
const validate_1 = require("./utils/validate");
// Temporary file extensions used for atomic file overwriting.
const newExt = '.__new__';
function validateInput(methodName, path, data, options) {
    const methodSignature = methodName + '(path, data, [options])';
    validate_1.validateArgument(methodSignature, 'path', path, ['string']);
    validate_1.validateArgument(methodSignature, 'data', data, ['string', 'buffer', 'object', 'array']);
    validate_1.validateOptions(methodSignature, 'options', options, {
        atomic: ['boolean'],
        jsonIndent: ['number'],
        progress: ['function']
    });
}
exports.validateInput = validateInput;
;
const toJson = (data, jsonIndent) => {
    if (typeof data === 'object'
        && !Buffer.isBuffer(data)
        && data !== null) {
        return imports_1.json.serialize(data, null, typeof jsonIndent !== 'number' ? 2 : jsonIndent);
    }
    return data;
};
// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------
const _writeFileSync = (path, data, options) => {
    try {
        fs_1.writeFileSync(path, data, options);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // Means parent directory doesn't exist, so create it and try again.
            mkdirp.sync(pathUtil.dirname(path));
            fs.writeFileSync(path, data, options);
        }
        else {
            throw err;
        }
    }
};
const writeAtomicSync = (path, data, options) => {
    return imports_1.file.write_atomic(path + newExt, data, options, function () { });
};
function sync(path, data, options) {
    const opts = options || {};
    const processedData = toJson(data, opts.jsonIndent);
    const writeStrategy = opts.atomic ? writeAtomicSync : _writeFileSync;
    writeStrategy(path, processedData, { mode: opts.mode });
}
exports.sync = sync;
;
// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------
const promisedWriteFile = Q.denodeify(fs.writeFile);
const promisedMkdirp = Q.denodeify(mkdirp);
const promisedAtomic = Q.denodeify(writeAtomicSync);
function writeFileAsync(path, data, options) {
    return new Promise((resolve, reject) => {
        promisedWriteFile(path, data, options)
            .then(resolve)
            .catch((err) => {
            // First attempt to write a file ended with error.
            // Check if this is not due to nonexistent parent directory.
            if (err.code === 'ENOENT') {
                // Parent directory doesn't exist, so create it and try again.
                promisedMkdirp(pathUtil.dirname(path))
                    .then(() => promisedWriteFile(path, data, options))
                    .then(resolve, reject);
            }
            else {
                // Nope, some other error, throw it.
                reject(err);
            }
        });
    });
}
;
function async(path, data, options) {
    const opts = options || {};
    const processedData = toJson(data, opts.jsonIndent);
    return (opts.atomic ? promisedAtomic : writeFileAsync)(path, processedData, { mode: opts.mode });
}
exports.async = async;
;
//# sourceMappingURL=write.js.map