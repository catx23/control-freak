"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalObject = (function () {
    if (typeof window !== 'undefined') {
        // Browsers
        return window;
    }
    else if (typeof global !== 'undefined') {
        // Node
        return global;
    }
    else if (typeof self !== 'undefined') {
        // Web workers
        return self;
    }
    return {};
})();
exports.default = globalObject;
//# sourceMappingURL=global.js.map