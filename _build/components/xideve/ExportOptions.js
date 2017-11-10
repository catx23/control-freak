"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("../../console");
//import * as views from 'co-views';
const path = require("path");
const fs = require('fs');
const util = require('util');
const jet = require('fs-jetpack');
const cheerio = require('cheerio');
const debugPaths = false;
;
function resolve(_path) {
    let here = path.resolve(_path);
    try {
        if (fs.statSync(here)) {
            return here;
        }
    }
    catch (e) {
        return here;
    }
    try {
        if (fs.statSync(_path)) {
            return _path;
        }
        else {
            const test = process.cwd() + path.sep + _path;
            if (fs.statSync(test)) {
                return test;
            }
        }
    }
    catch (e) {
    }
    return null;
}
class ExportOptions {
    constructor(args, delegate) {
        this.delegate = null;
        this.delegate = delegate;
    }
    /**
     * @member {string|null} serverTemplates the path to the server templates. Defaults to
     *  this.root + 'server-template'
     */
    onProgress(msg) {
        this.delegate && this.delegate.onProgress(msg);
        console_1.console.log('Progress:  ' + msg);
    }
    onError(msg) {
        console_1.console.error('error export ', msg);
        this.delegate && this.delegate.onError(msg);
    }
    onFinish(msg) {
        this.delegate && this.delegate.onFinish(msg);
        console_1.console.log('Finish:  ' + msg);
    }
    /**
     * @param options {module:nxapp/model/ExportOptions}
     */
    run() {
    }
}
exports.default = ExportOptions;
//# sourceMappingURL=ExportOptions.js.map