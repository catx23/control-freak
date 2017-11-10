"use strict";
// Logic for unix file mode operations.
Object.defineProperty(exports, "__esModule", { value: true });
// Converts mode to string 3 characters long.
function normalizeFileMode(mode) {
    let modeAsString;
    if (typeof mode === 'number') {
        modeAsString = mode.toString(8);
    }
    else {
        modeAsString = mode;
    }
    return modeAsString.substring(modeAsString.length - 3);
}
exports.normalizeFileMode = normalizeFileMode;
;
//# sourceMappingURL=mode.js.map