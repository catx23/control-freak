"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = require("base-64");
const jp = require("jsonpath");
const qs_1 = require("qs");
function to(data, path) {
    let value = path ? jp.query(data, path)[0] : data;
    let changed = false;
    try {
        // make sure its base64 and then decode
        const decoded = base64.decode(value);
        if (base64.encode(base64.decode(value)) === value) {
            value = Object.keys(qs_1.parse(decoded))[0];
            changed = true;
        }
    }
    catch (e) {
        // we swollow this!
    }
    changed && path && jp.value(data, path, value);
    return data;
}
exports.to = to;
function encode(data) {
    return base64.encode(data);
}
exports.encode = encode;
//# sourceMappingURL=base64.js.map