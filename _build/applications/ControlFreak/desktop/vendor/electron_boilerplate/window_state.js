"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('electron').app;
const jetpack = require('fs-jetpack');
function default_1(name, defaults) {
    let userDataDir = jetpack.cwd(app.getPath('userData'));
    let stateStoreFile = 'window-state-' + name + '.json';
    let state = {
        width: defaults.width,
        height: defaults.height
    };
    try {
        let loadedState = userDataDir.read(stateStoreFile, 'json');
        if (loadedState != null) {
            state = loadedState;
        }
    }
    catch (err) {
        // For some reason json can't be read.
        // No worries, we have defaults.
    }
    let saveState = function (win) {
        if (!win.isMaximized() && !win.isMinimized()) {
            let position = win.getPosition();
            let size = win.getSize();
            state.x = position[0];
            state.y = position[1];
            state.width = size[0];
            state.height = size[1];
        }
        state.isMaximized = win.isMaximized();
        userDataDir.write(stateStoreFile, state, { atomic: true });
    };
    return {
        get x() { return state.x; },
        get y() { return state.y; },
        get width() { return state.width; },
        get height() { return state.height; },
        get isMaximized() { return state.isMaximized; },
        saveState: saveState
    };
}
exports.default = default_1;
//# sourceMappingURL=window_state.js.map