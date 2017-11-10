"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../../../applications/Base");
const json_1 = require("../../../io/json");
const views = require("co-views");
const Router = require("koa-router");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const index_1 = require("../../../server/index");
const PreviewRouter = new Router({ prefix: '/xideve' });
PreviewRouter.get('/:preview/:mount/*', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let render = null;
    const rtConfig = ctx.request.query.debug === 'true' ? 'debug' : 'release';
    const mount = ctx.params.mount;
    const filePath = ctx.params[0].replace('./', '/');
    const app = ctx.app;
    const directoryService = app.directoryService;
    const workspacePath = directoryService.resolve(mount, '', ctx.request);
    let stat;
    try {
        stat = fs.statSync(path.join(workspacePath, filePath));
    }
    catch (err) {
    }
    if (!filePath || stat.isDirectory()) {
        return index_1.serveIndex(workspacePath, {
            remove: '/xideve/preview/' + mount + '/',
            icons: true,
            view: 'details'
        })(ctx, next);
    }
    const dir = path.dirname(filePath).replace('.', '');
    if (app.options.type === Base_1.ELayout.OFFLINE_RELEASE) {
        render = views(path.join(app.path(Base_1.EEKey.NODE_ROOT), '/_build/components/xideve/views'), { ext: 'ejs' });
    }
    else {
        render = views(path.join(__dirname, '../views'), { ext: 'ejs' });
    }
    const config = app['config'];
    const variables = _.extend({}, config.relativeVariables);
    app.variables(ctx, variables);
    const tplParams = {
        BASE_URL: variables[Base_1.EEKey.BASE_URL],
        APP_URL: variables[Base_1.EEKey.APP_URL],
        MOUNT: mount,
        FILE: filePath,
        THEME: 'bootstrap',
        ROOT: variables[Base_1.EEKey.ROOT],
        RPC_URL: variables[Base_1.EEKey.RPC_URL],
        VFS_URL: variables[Base_1.EEKey.VFS_URL],
        VFS_VARS: json_1.serialize(variables['VFS_CONFIG'], null, 2),
        CSS: variables[Base_1.EEKey.VFS_URL] + mount + '/' + filePath.replace('.dhtml', '.css'),
        DOC_BASE_URL: variables[Base_1.EEKey.VFS_URL] + mount + '/' + dir,
        USER_DIRECTORY: encodeURIComponent(app.directoryService._getUser(ctx.request) || variables['VFS_CONFIG'].user)
    };
    let templateResolved = null;
    let content = null;
    let error = null;
    try {
        templateResolved = yield render(rtConfig, tplParams);
    }
    catch (e) {
        error = 'Error rendering EJS template for ' + mount + '://' + filePath;
        ctx.body = error;
        console.error(error, e);
    }
    try {
        content = (yield app.directoryService.get(mount + '://' + filePath, false, false, null, ctx.request));
    }
    catch (e) {
        error = 'cant get file ' + mount + '://' + filePath;
        ctx.body = error;
        return;
    }
    // fileContent.match(~\bbackground(-image)?\s*:(.*?)\(\s*('|")?(?<image>.*?)\3?\s*\)~i);
    content = content.replace(/\burl\s*\(\s*["']?([^"'\r\n\)\(]+)["']?\s*\)/gi, function (matchstr, parens) {
        let parts = parens.split('://');
        let mount = parts[0];
        let _path = parts[1];
        if (mount && _path) {
            _path = variables[Base_1.EEKey.VFS_URL] + mount + '/' + _path;
            return "url('" + _path + "')";
        }
        return parens;
    });
    const result = content.replace('<viewHeaderTemplate/>', templateResolved);
    ctx.body = result;
}));
exports.default = PreviewRouter;
//# sourceMappingURL=Preview.js.map