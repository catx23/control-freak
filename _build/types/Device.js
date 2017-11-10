"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CI names to define logging outputs per device or view
 *
 * @enum {int} LOGGING_FLAGS
 * @global
 */
var DEVICE_PROPERTY;
(function (DEVICE_PROPERTY) {
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_DRIVER"] = 'Driver'] = "CF_DEVICE_DRIVER";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_HOST"] = 'Host'] = "CF_DEVICE_HOST";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_PORT"] = 'Port'] = "CF_DEVICE_PORT";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_PROTOCOL"] = 'Protocol'] = "CF_DEVICE_PROTOCOL";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_TITLE"] = 'Title'] = "CF_DEVICE_TITLE";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_ID"] = 'Id'] = "CF_DEVICE_ID";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_ENABLED"] = 'Enabled'] = "CF_DEVICE_ENABLED";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_OPTIONS"] = 'Options'] = "CF_DEVICE_OPTIONS";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_DRIVER_OPTIONS"] = 'DriverOptions'] = "CF_DEVICE_DRIVER_OPTIONS";
    DEVICE_PROPERTY[DEVICE_PROPERTY["CF_DEVICE_LOGGING_FLAGS"] = 'Logging Flags'] = "CF_DEVICE_LOGGING_FLAGS";
})(DEVICE_PROPERTY = exports.DEVICE_PROPERTY || (exports.DEVICE_PROPERTY = {}));
/**
 * Flags to define logging outputs per device or view
 *
 * @enum {int} LOGGING_FLAGS
 * @global
 */
var LOGGING_FLAGS;
(function (LOGGING_FLAGS) {
    /**
     * No logging
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["NONE"] = 0] = "NONE";
    /**
     * Log in the IDEs global console
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["GLOBAL_CONSOLE"] = 1] = "GLOBAL_CONSOLE";
    /**
     * Log in the IDEs status bar
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["STATUS_BAR"] = 2] = "STATUS_BAR";
    /**
     * Create notification popup in the IDE
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["POPUP"] = 4] = "POPUP";
    /**
     * Log to file
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["FILE"] = 8] = "FILE";
    /**
     * Log into the IDE's dev tool's console
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["DEV_CONSOLE"] = 16] = "DEV_CONSOLE";
    /**
     * Log into the device's IDE console
     * @constant
     * @type int
     */
    LOGGING_FLAGS[LOGGING_FLAGS["DEVICE_CONSOLE"] = 32] = "DEVICE_CONSOLE";
})(LOGGING_FLAGS = exports.LOGGING_FLAGS || (exports.LOGGING_FLAGS = {}));
//# sourceMappingURL=Device.js.map