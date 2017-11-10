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
const busboy = require("async-busboy");
const fs = require("fs");
const Router = require("koa-router");
const path = require("path");
const qs = require("qs");
class UploadRouter extends Router {
    constructor(args) {
        super(args);
    }
}
exports.UploadRouter = UploadRouter;
function create(directoryService, prefix = '/upload', app) {
    const filesRouter = new UploadRouter({ prefix: prefix });
    filesRouter.directoryService = directoryService;
    filesRouter.post('/*', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        const params = qs.parse(ctx.request.querystring);
        const mount = params.mount;
        const dstDir = params.dstDir;
        if (!mount || !dstDir) {
            return next();
        }
        // @TODO: files router doesnt catch right
        if (!ctx.req.url.startsWith(prefix)) {
            return next();
        }
        const params2 = ctx.params;
        const data = yield busboy(ctx.req);
        const files = data.files;
        files.forEach((file) => {
            file.pipe(fs.createWriteStream(filesRouter.directoryService.resolve(mount, dstDir + path.sep + file.filename)));
        });
        ctx.body = '{"jsonrpc":"2.0","result":[],"id":0}';
        ctx.status = 200;
    }));
    return filesRouter;
}
exports.create = create;
//# sourceMappingURL=uploads.js.map