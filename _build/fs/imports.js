"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const write_fs = require('write-file-atomic');
exports.file = {
    write_atomic: write_fs
};
exports.json = {
    parse: JSON.parse,
    serialize: JSON.stringify
};
//# sourceMappingURL=imports.js.map