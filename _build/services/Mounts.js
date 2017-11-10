"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONFile_1 = require("./JSONFile");
class MountService extends JSONFile_1.JSONFileService {
    constructor(path) {
        super(path);
        this.method = 'XApp_Resource_Service';
        this.configPath = path;
        this.root = '';
    }
    ls() {
        return this.readConfig()['items'];
    }
    methods() {
        return this.toMethods(['ls']);
    }
}
exports.MountService = MountService;
//# sourceMappingURL=Mounts.js.map