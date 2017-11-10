"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.normalizeSlashes = (str) => {
    str = path.normalize(str);
    str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return str.split(/[\\\/]+/);
};
exports.containsPath = (fp, segment) => {
    if (typeof fp !== 'string' || typeof segment !== 'string') {
        throw new TypeError('contains-path expects file paths to be a string.');
    }
    let prefix = '(^|\\/)';
    if (segment.indexOf('./') === 0 || segment.charAt(0) === '/') {
        prefix = '^';
    }
    let re = new RegExp(prefix + exports.normalizeSlashes(segment).join('\\/') + '($|\\/)');
    fp = exports.normalizeSlashes(fp).join('/');
    return re.test(fp);
};
exports.normalizePath = (str, stripTrailing) => {
    if (typeof str !== 'string') {
        throw new TypeError('expected a string');
    }
    str = str.replace(/[\\\/]+/g, '/');
    if (stripTrailing !== false) {
        str = str.replace(/\/$/, '');
    }
    return str;
};
//# sourceMappingURL=utils.js.map