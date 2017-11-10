"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const writeAtomic = require('write-file-atomic');
const writeFileOptions = { mode: parseInt('0600', 8) };
function read(file) {
    const size = fs.statSync(file).size, buf = new Buffer(size), fd = fs.openSync(file, 'r');
    if (!size) {
        return '';
    }
    fs.readSync(fd, buf, 0, size, 0);
    fs.closeSync(fd);
    return buf.toString();
}
exports.read = read;
function write(file, content, options) {
    return writeAtomic.sync(file, content, options || writeFileOptions);
}
exports.write = write;
//# sourceMappingURL=file.js.map