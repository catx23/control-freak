// Simple module exposes environment variables to rest of the code.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jetpack = require('fs-jetpack');
let app;
if (process['type'] === 'renderer') {
    app = require('electron').remote.app;
}
else {
    app = require('electron').app;
}
let appDir = jetpack.cwd(app.getAppPath());
let manifest = appDir.read('package.json', 'json');
exports.default = manifest.env;
//# sourceMappingURL=env.js.map