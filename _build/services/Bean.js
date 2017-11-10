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
const Directory_1 = require("../applications/ControlFreak/services/Directory");
const Resource_1 = require("../interfaces/Resource");
const Query_1 = require("../resource/Query");
const file_1 = require("../io/file");
const io = {
    parse: JSON.parse,
    serialize: JSON.stringify
};
class BeanService extends Directory_1.DirectoryService {
    constructor(config) {
        super(config ? config.resourceConfiguration : {});
        this.config = config;
    }
    getMetaData(scope, path, request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!request) {
                console.error('----no request');
            }
            return io.parse(yield this.get(scope + '://' + path, false, false, false, request));
        });
    }
    removeGroup($scope, $path) { }
    setContent($scopeName, $path, $content) { }
    _updateItemMetaData(scope = 'user_devices', path = 'House/WebCam.meta.json', dataPath = '/inputs', query = {}, value = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const resource = new Query_1.ResourceQuery(yield this.getMetaData(scope, path, this._getRequest(arguments)));
            const data = resource.set('', dataPath.replace('/', ''), query, value);
            const dst = this.resolvePath(scope, path, this._getRequest(arguments));
            file_1.write(dst, io.serialize(data, null, 4), this.WRITE_MODE);
            return data;
        });
    }
    getItems(path, scope, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    _ls(mount, _path, options, recursive = false) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
                if (resource) {
                    let root = this.resolveAbsolute(resource);
                    root = this._resolveUserMount(mount, this._getRequest(arguments), root);
                    const nodes = yield this.getItems(root, mount, {});
                    return { items: nodes };
                }
                else {
                    console.warn('cant find resource for ' + mount);
                }
            }
            catch (e) {
                console.error('ls error ', e);
            }
        });
    }
}
exports.BeanService = BeanService;
//# sourceMappingURL=Bean.js.map