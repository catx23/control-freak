"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Memory_1 = require("./Memory");
const fs = require("fs");
const mkdirp = require("mkdirp");
const _path = require("path");
const writeFileAtomic = require('write-file-atomic');
const permissionError = 'You don\'t have access to this file.';
const defaultPathMode = parseInt('0700', 8);
const writeFileOptions = { mode: parseInt('0600', 8) };
class File extends Memory_1.Memory {
    read(path) {
        path = path || this.configPath;
        try {
            this._buckets = JSON.parse(fs.readFileSync(path, 'utf8'));
        }
        catch (err) {
            // create dir if it doesn't exist
            if (err.code === 'ENOENT') {
                mkdirp.sync(_path.dirname(path), defaultPathMode);
                return {};
            }
            // improve the message of permission errors
            if (err.code === 'EACCES') {
                err.message = err.message + '\n' + permissionError + '\n';
            }
            // empty the file if it encounters invalid JSON
            if (err.name === 'SyntaxError') {
                writeFileAtomic.sync(path, '', writeFileOptions);
                return {};
            }
            throw err;
        }
    }
    write(path) {
        path = path || this.configPath;
        const data = this.data();
        try {
            // make sure the folder exists as it
            // could have been deleted in the meantime
            mkdirp.sync(_path.dirname(path), defaultPathMode);
            writeFileAtomic.sync(path, JSON.stringify(data, null, 4), writeFileOptions);
        }
        catch (err) {
            // improve the message of permission errors
            if (err.code === 'EACCES') {
                err.message = err.message + '\n' + permissionError + '\n';
            }
            throw err;
        }
    }
}
exports.File = File;
//# sourceMappingURL=File.js.map