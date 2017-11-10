"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Directory_1 = require("../../../services/Directory");
const Resource_1 = require("../../../interfaces/Resource");
const Local_1 = require("../../../vfs/Local");
const fs = require("fs");
const path = require("path");
class DirectoryService extends Directory_1.DirectoryService {
    _userDir(userRoot, what) {
        return path.resolve(path.join(userRoot + path.sep + what));
    }
    _resolveUserMount(mount, request, _default) {
        const user = this._getUser(request);
        if (user) {
            switch (mount) {
                case 'workspace_user': {
                    return this._userDir(user, 'workspace');
                }
                case 'user_drivers': {
                    return this._userDir(user, 'drivers');
                }
                case 'user_devices': {
                    return this._userDir(user, 'devices');
                }
                case 'user': {
                    return this._userDir(user, '');
                }
            }
        }
        return _default;
    }
    getVFS(mount, request) {
        const resource = this.getResourceByTypeAndName(Resource_1.EResourceType.FILE_PROXY, mount);
        if (resource) {
            let root = this._resolveUserMount(mount, request) || this.resolveAbsolute(resource);
            try {
                if (fs.lstatSync(root)) {
                    return Local_1.create({
                        root: root,
                        nopty: true
                    });
                }
            }
            catch (e) {
                console.warn('cant get VFS for ' + mount + ' for root ' + root);
            }
        }
        return null;
    }
}
exports.DirectoryService = DirectoryService;
//# sourceMappingURL=Directory.js.map