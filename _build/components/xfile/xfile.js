"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Component_1 = require("../Component");
const interfaces_1 = require("../../fs/interfaces");
const copy_1 = require("../../fs/copy");
const path = require("path");
const StringUtils_1 = require("../../utils/StringUtils");
const utils_1 = require("../../vfs/utils");
let pathToRegexp = require('path-to-regexp');
class XFILE extends Component_1.Component {
    constructor(application, serviceConfig, options) {
        super(application, serviceConfig);
        this.abort = false;
        this.waiting = {};
        this.options = options;
    }
    label() {
        return "xfile";
    }
    services(config) {
        return [];
    }
    routes() {
        return [];
    }
    cancel() {
        this.abort = true;
    }
    answer(data) {
        const waiting = this.waiting[data.iid];
        if (waiting) {
            waiting['resolve'](data.answer);
            delete this.waiting[data.iid];
        }
    }
    _cp(src, dst) {
    }
    cp(src, dst) {
        const directoryService = this.application['directoryService'];
        // console.log('dir', directoryService);
        const selection = ['workspace_user/ClayCenter/init.css'];
        const srcMount = directoryService.resolveShort(selection[0]).mount;
        const srcVFS = directoryService.getVFS(srcMount);
        const root = directoryService.resolvePath(srcMount, '');
        const checkFilesInRoot = (dirService, srcMount, selection) => {
            let result = true;
            selection.forEach((item) => {
                const rel = dirService.resolveShort(item).path;
                const abs = dirService.resolvePath(srcMount, rel);
                if (!utils_1.containsPath(abs, rel)) {
                    result = false;
                }
            });
            return result;
        };
        const relatives = (dirService, selection) => {
            return selection.map((item) => {
                return dirService.resolveShort(item).path;
            });
        };
        const absolutes = (dirService, selection) => {
            return selection.map((item) => {
                const rel = dirService.resolveShort(item).path;
                const abs = dirService.resolvePath(srcMount, rel);
                return abs;
            });
        };
        // console.log('contains : ', checkFilesInRoot(directoryService, srcMount, ['workspace_user/A-VLC.css']));
        // const _matcher = matcher('', relatives(directoryService, selection), matcherOptions);
        // console.log('as regex : ', pathToRegexp('./ClayCenter/init.css'));
        // console.log('as regex : ', pathToRegexp('ClayCenter/init.css'));
        // console.log('rels : ', relatives(directoryService, selection));
        // console.log('matcher ', _matcher('**/ClayCenter/init.css'));
        // console.log('matcher 2 ', _matcher('./ClayCenter/init.css'));
        // console.log('matcher 3 ', _matcher('**/*/init.css'));
        // console.log('matcher 4 ', _matcher('./**/*/*.css'));
        // console.log('matcher 5 ', _matcher('**/*.css'));
        // console.log('matcher 6 ', _matcher('ClayCenter/init.css'));
        // const _matcherAbs = matcher(root + '/', absolutes(directoryService, selection), matcherOptions);
        // console.log('abs : ' + root, absolutes(directoryService, selection));
        // console.log('matcher abs ', _matcherAbs('**/ClayCenter/init.css'));
        // console.log('matcher abs 2 ', _matcherAbs('./ClayCenter/init.css'));
        // console.log('matcher abs 3 ', _matcherAbs('**/*/*.css'));
        // console.log('matcher abs 4 ', _matcherAbs('/PMaster/projects/x4mm/user/workspace/ClayCenter/init.css'));
        // console.log('matcher abs 4 ', _matcherAbs('/PMaster/projects/x4mm/user/workspace/ClayCenter/init.css'));
        let c = 0;
        let done = [];
        let delegate = this.options.delegate;
        let self = this;
        const progress = function (path, current, total, item) {
            done.push({ item: item, path: path });
            c++;
            if (c >= 1) {
                delegate.onProgress(done);
                done = [];
                c = 0;
            }
            return !self.abort;
        };
        const conflictCallback = function (path, item, err) {
            const iid = StringUtils_1.createUUID();
            self.waiting[iid] = {};
            const promise = new Promise((resolve, reject) => {
                delegate.onInterrupt({
                    path: path,
                    error: err,
                    iid: iid,
                    item: item
                });
                self.waiting[iid].resolve = resolve;
            });
            self.waiting[iid].promise = promise;
            return promise;
        };
        let options = {
            progress: progress,
            conflictCallback: conflictCallback,
            // overwrite: true,
            matching: ['**/*.ts'],
            debug: false,
            flags: interfaces_1.ECopyFlags.FOLLOW_SYMLINKS | interfaces_1.ECopyFlags.REPORT,
            writeProgress: (path, current, total) => {
                delegate.onProgress([
                    {
                        path: path,
                        current: current,
                        total: total
                    }
                ]);
            }
        };
        src = path.resolve('./src/fs/');
        dst = '/tmp/node_modules_fs/';
        this.running = copy_1.async(src, dst, options).then(function (res) {
            console.log('done', res);
            delegate.onFinish({});
        }).catch(function (e) {
            console.error('error copyAsync', e);
        });
    }
}
exports.XFILE = XFILE;
;
//
// ─── flow ───────────────────────────────────────────────────────────────────────
//
// 	client:
// 		runAppServerComponentMethod(component,method,args)
// 	server:
//  	runComponentMethod(component,method,args)
//  component:
//      method(...,delegate)
//# sourceMappingURL=xfile.js.map