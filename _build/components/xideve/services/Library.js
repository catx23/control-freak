"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotProp = require("dot-prop");
const JSONFile_1 = require("../../../services/JSONFile");
const defaultFileName = 'styles.json';
/**
 * This service sets/gets data in a json file, utilizing 'dot-prop' to select certain data in the object.
 *
 * @export
 * @class JSONFileService
 * @extends {BaseService}
 * @implements {IStoreIO}
 * @implements {IStoreAccess}
 */
class LibraryService extends JSONFile_1.JSONFileService {
    constructor(config) {
        super(config);
        this.method = 'Library_Store';
        this.defaultFileName = defaultFileName;
        this.defaultData = {
            user: {
                styles: []
            }
        };
        this.configPath = config;
        this.root = 'user';
    }
    _get(section, path, query) {
        let configPath = this._getConfigPath(arguments);
        let data = this.readConfig(configPath);
        let result = {};
        result[section] = dotProp.get(data, this.root + path + section);
        return result;
    }
    //
    // ─── DECORATORS
    //
    getRpcMethods() {
        throw new Error("Should be implemented by decorator");
    }
    methods() {
        // const methods = this.getRpcMethods();
        // return this.toMethods(methods);
        return this.toMethods(['get', 'set', 'update']);
    }
}
exports.LibraryService = LibraryService;
//# sourceMappingURL=Library.js.map