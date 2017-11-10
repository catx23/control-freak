"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DRIVER_PROPERTY;
(function (DRIVER_PROPERTY) {
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_NAME"] = 'CF_DRIVER_NAME'] = "CF_DRIVER_NAME";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_ICON"] = 'CF_DRIVER_ICON'] = "CF_DRIVER_ICON";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_CLASS"] = 'CF_DRIVER_CLASS'] = "CF_DRIVER_CLASS";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_ID"] = 'CF_DRIVER_ID'] = "CF_DRIVER_ID";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_COMMANDS"] = 'CF_DRIVER_COMMANDS'] = "CF_DRIVER_COMMANDS";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_VARIABLES"] = 'CF_DRIVER_VARIABLES'] = "CF_DRIVER_VARIABLES";
    DRIVER_PROPERTY[DRIVER_PROPERTY["CF_DRIVER_RESPONSES"] = 'CF_DRIVER_RESPONSES'] = "CF_DRIVER_RESPONSES";
})(DRIVER_PROPERTY = exports.DRIVER_PROPERTY || (exports.DRIVER_PROPERTY = {}));
/**
 * Bitmask or flags for device about its driver setup
 * @enum {int} DRIVER_FLAGS
 * @global
 */
var DRIVER_FLAGS;
(function (DRIVER_FLAGS) {
    /**
     * Mark the driver for "server side"
     */
    DRIVER_FLAGS[DRIVER_FLAGS["RUNS_ON_SERVER"] = 2] = "RUNS_ON_SERVER";
    /**
     * Enable protocol's debug message on console
     */
    DRIVER_FLAGS[DRIVER_FLAGS["DEBUG"] = 4] = "DEBUG";
    /**
     * Run as server: implemented for UDP & TCP. Null-Modem driver under linux for Serial.
     */
    DRIVER_FLAGS[DRIVER_FLAGS["SERVER"] = 16] = "SERVER";
})(DRIVER_FLAGS = exports.DRIVER_FLAGS || (exports.DRIVER_FLAGS = {}));
//# sourceMappingURL=Driver.js.map