"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONFile_1 = require("./JSONFile");
const _ = require("lodash");
class NodeService extends JSONFile_1.JSONFileService {
    constructor() {
        super(...arguments);
        this.method = 'XIDE_NodeJS_Service';
        this.deviceServerPort = 9998;
    }
    setDeviceServerPort(port) {
        this.deviceServerPort = port;
    }
    methods() {
        return this.toMethods(['ls', 'stop', 'start']);
    }
    ls() {
        const args = arguments;
        const request = this._getRequest(args);
        let items = this.readConfig()['items'];
        if (request) {
            items = _.map(items, (item) => {
                item.host = request.host.split(':')[0];
                if (item.name === 'Device Control Server') {
                    item.port = this.deviceServerPort;
                }
                return item;
            });
        }
        return items;
    }
}
exports.NodeService = NodeService;
//# sourceMappingURL=Services.js.map