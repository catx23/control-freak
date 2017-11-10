"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("../../io/file");
const json_1 = require("../../io/json");
const Devices_1 = require("../../services/Devices");
const Drivers_1 = require("../../services/Drivers");
const FileUtils_1 = require("../../utils/FileUtils");
const StringUtils_1 = require("../../utils/StringUtils");
const console_1 = require("../../console");
const _ = require("lodash");
//import * as views from 'co-views';
const path = require("path");
const fs = require('fs');
const util = require('util');
const jet = require('fs-jetpack');
const cheerio = require('cheerio');
const debugPaths = false;
let io = {
    read: file_1.read,
    write: file_1.write
};
;
function resolve(_path) {
    let here = path.resolve(_path);
    try {
        if (fs.statSync(here)) {
            return here;
        }
    }
    catch (e) {
        return here;
    }
    try {
        if (fs.statSync(_path)) {
            return _path;
        }
        else {
            const test = process.cwd() + path.sep + _path;
            if (fs.statSync(test)) {
                return test;
            }
        }
    }
    catch (e) {
    }
    return null;
}
function cleanUrl(str) {
    if (str) {
        str = str.replace('//', '/');
        str = str.replace('./', '/');
        return str;
    }
    return str;
}
/**
 * This class creates a stand-alone package of a "Control-Freak" created application.
 * Essentially it takes a bunch of paths and options and outputs a folder on disc.
 *
 *
 * @export
 * @class Exporter
 */
class Exporter {
    constructor(args, delegate) {
        this.options = null;
        this.profile = null;
        this.delegate = null;
        this.options = args.options;
        this.delegate = delegate;
    }
    /**
     * @member {string|null} serverTemplates the path to the server templates. Defaults to
     *  this.root + 'server-template'
     */
    onProgress(msg) {
        this.delegate && this.delegate.onProgress(msg);
        console_1.console.log('Progress:  ' + msg);
    }
    onError(msg) {
        console_1.console.error('error export ', msg);
        this.delegate && this.delegate.onError(msg);
    }
    onFinish(msg) {
        this.delegate && this.delegate.onFinish(msg);
        console_1.console.log('Finish:  ' + msg);
    }
    /**
     * @param options {module:nxapp/model/ExportOptions}
     */
    run() {
        const options = this.options;
        console_1.console.log('run;', options);
        this.onProgress('Export Manager: begin export');
        if (!options.root) {
            this.onError('Export Manager: have no root');
            throw new Error('Export Manager: have no root');
        }
        if (!options.system) {
            this.onError('Export Manager: have no data');
            throw new Error('Export Manager: have no data');
        }
        if (!options.user) {
            this.onError('Export Manager: have no user');
            return;
        }
        options.serverSide = true;
        if (!options.client) {
            /*
            if (has('debug')) {
                this.client = xutils.resolve(this.root + '/dist/windows/Code/client/');
            } else {
                this.client = xutils.resolve(this.root + '/Code/client/');
            }
            */
        }
        try {
            if (!options.serverTemplates) {
                options.serverTemplates = resolve(options.root + '/server-template');
            }
            debugPaths && console_1.console.log('export with \n', {
                "System Data": options.system,
                "User Data": options.user + ' = ' + path.resolve(options.user),
                "Root": path.resolve(options.root),
                "Server-Templates": options.serverTemplates,
                "Target": path.resolve(options.target),
                "Node Servers": path.resolve(options.nodeServers),
                "Client": options.client,
                "Export Windows": options.windows,
                "Export Linux - 32 ": options.linux32,
                "Export Linux - 64 ": options.linux64,
                "Export OSX": options.osx,
                "Export ARM": options.arm
            });
        }
        catch (e) {
            console_1.console.error('Error export ', e);
        }
        const d = false;
        if (d) {
            return;
        }
        let all = true;
        if (all) {
            if (!options.deviceServerPort) {
                options.deviceServerPort = 9997;
            }
            if (!options.mongo_port) {
                options.mongo_port = 27018;
            }
            if (!options.mqtt_port) {
                options.mqtt_port = 1884;
            }
            if (!options.http_port) {
                options.http_port = 5556;
            }
            //this.exportMongo(options);
            this.createDirectoryLayout(options);
            this.exportServer(options);
            this.onProgress('Exported Servers');
            this.exportUser(options);
            this.onProgress('Exported User');
            this.exportSystem(options);
            this.onProgress('Exported System Data');
            this.exportMisc(options);
            this.onProgress('Exported Misc Data');
            this.onProgress('Exporting User Workspace HTML');
            this.exportHTML(options);
            this.onProgress('Exported User Workspace HTML');
            this.exportDevices(options);
            this.onProgress('Exported Devices');
            this.exportDrivers(options);
            this.onProgress('Exported Drivers');
            const forceDist = true;
            if (options.client) {
                this.exportClientEx(options);
            }
            else {
                if (!options.debug) {
                    this.exportClient(options);
                }
                else {
                    this.exportClientDist(options);
                }
            }
            this.onProgress('Exported Client Application Assets');
            console_1.console.log('Export Done! Your application can be found at ' + options.target);
            this.onProgress('Export Done');
            this.onFinish('Export Done! Your application can be found at ' + options.target);
        }
        else {
            this.exportHTML(options);
        }
    }
    exportHTML(options) {
        try {
            let source = jet.dir(options.target + '/user/workspace/');
            let thiz = this;
            function parseDirectory(_path, name) {
                // name = directory abs
                let dirItems = fs.readdirSync(_path);
                if (dirItems.length) {
                    _.each(dirItems, function (file) {
                        // file = file name
                        if (file.indexOf('.dhtml') !== -1) {
                            let root = name.replace(source.path() + '/', '');
                            thiz.exportHTMLFile2(_path + '/' + file, root, options);
                        }
                    });
                }
            }
            function _walk(dir) {
                let results = [];
                if (fs.existsSync(dir)) {
                    let list = fs.readdirSync(dir);
                    list.forEach(function (file) {
                        file = dir + '/' + file;
                        let stat = fs.statSync(file);
                        if (stat) {
                            let root = file.replace(path + '/', '');
                            if (stat.isDirectory()) {
                                parseDirectory(file, root);
                            }
                            else {
                                if (file.indexOf('.dhtml') !== -1) {
                                    root = root.replace(dir + '/', '');
                                    thiz.exportHTMLFile2(file, root, options);
                                }
                            }
                        }
                        else {
                            console_1.console.error('cant get stat for ' + file);
                        }
                    });
                }
                else {
                    console_1.console.error('device path ' + dir + ' doesnt exists');
                }
                return results;
            }
            _walk(source.path());
        }
        catch (e) {
            console_1.console.error('Error exporting HTML', e);
        }
    }
    exportHTMLFile2(file, folder, options) {
        let exportRoot = jet.dir(options.root + '/export/');
        let template = io.read(path.resolve(exportRoot.path() + '/app.template.html'));
        let path_parts = FileUtils_1.pathinfo(file, FileUtils_1.EPATH_PARTS.PATHINFO_ALL);
        const dirName = path.dirname(file);
        const fileName = path.basename(file);
        if (folder === fileName) {
            folder = "";
        }
        let templateVariables = {
            libRoot: '/Code/client/src/lib',
            lodashUrl: '/Code/client/src/lib/external/lodash.min.js',
            requireBaseUrl: "/Code/client/src/lib/xibm/ibm",
            jQueryUrl: "/Code/client/src/lib/external/jquery-1.9.1.min.js",
            data: "",
            user: "/user",
            css: './' + cleanUrl(fileName.replace('.dhtml', '.css')),
            theme: "bootstrap",
            blox_file: "./" + folder + '/' + fileName.replace('.dhtml', '.xblox'),
            scene_file: "./" + folder + '/' + fileName,
            mount: "workspace",
            "VFS_VARS": json_1.serialize({
                "user_drivers": './user/drivers',
                "system_drivers": './system/drivers'
            }, null, 2)
        };
        //console.log('export HTML' + folder + '/' + fileName);
        template = StringUtils_1.replace(template, null, templateVariables, {
            begin: '%',
            end: '%'
        });
        let content = io.read(file);
        content = content.replace('<viewHeaderTemplate/>', template);
        content = content.replace(/\burl\s*\(\s*["']?([^"'\r\n\)\(]+)["']?\s*\)/gi, function (matchstr, parens) {
            let parts = parens.split('://');
            let mount = parts[0];
            let path = parts[1];
            if (mount && path) {
                return "url('./" + path + "')";
            }
            return parens;
        });
        let dom = cheerio.load(content);
        let extra = '\n<script type="text/javascript">';
        extra += '\n\tvar test = 0;';
        extra += '\n</script>';
        dom('HEAD').append(dom(extra));
        io.write(file.replace('.dhtml', '.html'), dom.html());
    }
    exportHTMLFile(options) {
        let exportRoot = jet.dir(options.root + '/export/');
        let source = jet.dir(options.target + '/user/workspace/');
        let file = path.resolve(source.path() + '/ascene.dhtml');
        let template = io.read(path.resolve(exportRoot.path() + '/app.template.html'));
        let templateVariables = _.mixin({
            libRoot: '/Code/client/src/lib',
            lodashUrl: '/Code/client/src/lib/external/lodash.min.js',
            requireBaseUrl: "/Code/client/src/lib/xibm/ibm",
            jQueryUrl: "/Code/client/src/lib/external/jquery-1.9.1.min.js",
            data: "",
            user: "/user",
            css: "./ascene.css",
            theme: "bootstrap",
            blox_file: "./ascene.xblox",
            mount: "workspace",
            "VFS_VARS": json_1.serialize({
                "user_drivers": './user/drivers',
                "system_drivers": './system/drivers'
            }, null, 2)
        }, options);
        template = StringUtils_1.replace(template, null, templateVariables, {
            begin: '%',
            end: '%'
        });
        let content = io.read(file);
        content = content.replace('<viewHeaderTemplate/>', template);
        let did = false;
        content = content.replace(/\burl\s*\(\s*["']?([^"'\r\n\)\(]+)["']?\s*\)/gi, function (matchstr, parens) {
            let parts = parens.split('://');
            let mount = parts[0];
            let path = parts[1];
            if (mount && path) {
                did = true;
                return "url('./" + path + "')";
            }
            return parens;
        });
        let dom = cheerio.load(content);
        let extra = '\n<script type="text/javascript">';
        extra += '\n\tvar test = 0;';
        extra += '\n</script>';
        dom('HEAD').append(dom(extra));
        io.write(file.replace('.dhtml', '.html'), dom.html());
    }
    exportDevices(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userDevicesPath = path.resolve(options.target + '/user/devices');
                let devices = yield Devices_1.getDevices(userDevicesPath, 'user_devices', options);
                io.write(userDevicesPath + '/user_devices.json', json_1.serialize({
                    items: devices
                }, null, 2));
                devices.forEach(device => {
                    if (device.user) {
                        io.write(path.join(options.target, '/user/devices/' + device.path), json_1.serialize({
                            inputs: device.user.inputs
                        }, null, 2));
                    }
                });
                let systemDevicesPath = path.resolve(options.target + '/data/system/devices');
                devices = (yield Devices_1.getDevices(systemDevicesPath, 'system_devices', options));
                devices.forEach(device => {
                    if (device.user) {
                        io.write(path.join(options.target, '/data/system/devices/' + device.path), json_1.serialize({
                            inputs: device.user.inputs
                        }, null, 2));
                    }
                });
                io.write(systemDevicesPath + '/system_devices.json', json_1.serialize({
                    items: devices
                }, null, 2));
            }
            catch (e) {
                console_1.console.error('error exporting devices:', e);
            }
        });
    }
    exportDrivers(options) {
        let userDriversPath = path.resolve(options.target + '/user/drivers');
        let drivers = Drivers_1.getDrivers(userDriversPath, 'user_drivers');
        io.write(userDriversPath + '/user_drivers.json', json_1.serialize({
            items: drivers
        }, null, 2));
        let systemDriversPath = path.resolve(options.target + '/data/system/drivers');
        drivers = Drivers_1.getDrivers(systemDriversPath, 'system_drivers');
        io.write(systemDriversPath + '/system_drivers.json', json_1.serialize({
            items: drivers
        }, null, 2));
    }
    exportMisc(options) {
        let source = jet.dir(options.root + '/export');
        let target = jet.dir(options.target);
        jet.copy(source.path(), target.path(), {
            matching: [
                '**'
            ],
            overwrite: true
        });
        /**
         * update config
         */
        let template = io.read(path.resolve(source.path() + '/profile_device_server.json'));
        let content = StringUtils_1.replace(template, null, options, {
            begin: '%',
            end: '%'
        });
        if (options.linux32) {
            jet.exists(target.path() +
                path.sep + '/server/linux_32/nxappmain/profile_device_server.json') && io.write(target.path() + path.sep +
                '/server/linux_32/nxappmain/profile_device_server.json', content);
        }
        if (options.linux64) {
            jet.exists(target.path() +
                path.sep + '/server/linux_64/nxappmain/profile_device_server.json') && io.write(target.path() + path.sep +
                '/server/linux_64/nxappmain/profile_device_server.json', content);
        }
        if (options.windows) {
            jet.exists(target.path() +
                path.sep + '/server/windows/nxappmain/profile_device_server.json') && io.write(target.path() + path.sep +
                '/server/windows/nxappmain/profile_device_server.json', content);
        }
        if (options.arm) {
            jet.exists(target.path() +
                path.sep + '/server/arm/nxappmain/profile_device_server.json') && io.write(target.path() + path.sep +
                '/server/arm/nxappmain/profile_device_server.json', content);
        }
        if (options.osx) {
            jet.exists(target.path() +
                path.sep + '/server/osx_64/nxappmain/profile_device_server.json') && io.write(target.path() + path.sep + '/server/osx_64/nxappmain/profile_device_server.json', content);
        }
        /**
         * update boot start.js
         */
        template = io.read(path.resolve(source.path() + '/start.js'));
        content = StringUtils_1.replace(template, null, options, {
            begin: '%',
            end: '%'
        });
        options.linux32 !== false && jet.exists(target.path() + '/server/linux_32/start.js') && io.write(target.path() + '/server/linux_32/start.js', content);
        options.linux64 !== false && jet.exists(target.path() + '/server/linux_64/start.js') && io.write(target.path() + '/server/linux_64/start.js', content);
        options.windows !== false && io.write(target.path() + '/server/windows/start.js', content);
        options.arm !== false && jet.exists(target.path() + '/server/arm/start.js') && io.write(target.path() + '/server/arm/start.js', content);
        options.osx !== false && jet.exists(target.path() + '/server/osx_64/start.js') && io.write(target.path() + '/server/osx_64/start.js', content);
    }
    exportClientEx(options) {
        let source = jet.dir(path.resolve(options.client) + '');
        let target = jet.dir(options.target + '/Code/client');
        jet.copy(source.path(), target.path(), {
            matching: [
                '**'
            ],
            overwrite: true
        });
    }
    exportClient(options) {
        let source = jet.dir(options.root + '/Code/client');
        let target = jet.dir(options.target + '/Code/client');
        jet.copy(source.path(), target.path(), {
            matching: [
                '**'
            ],
            overwrite: true
        });
    }
    exportClientDist(options) {
        let source = jet.dir(options.root + '/dist/windows/Code/client/');
        let target = jet.dir(options.target + '/Code/client');
        jet.copy(source.path(), target.path(), {
            matching: [
                '**'
            ],
            overwrite: true
        });
    }
    exportUser(options) {
        let source = jet.dir(options.user);
        let target = jet.dir(options.target + '/user');
        console_1.console.log('export user from ' + source.path() + ' to ' + target.path());
        try {
            jet.copy(source.path(), target.path(), {
                matching: [
                    '**',
                    '!./.git/**/*',
                    '!**/**claycenter',
                    '!./claycenter',
                    '!**claycenter'
                ],
                overwrite: true
            });
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                console_1.console.error('Error copying, file exists!', err);
            }
            if (err.code === 'EACCES') {
                console_1.console.error('Error copying, file access perrmissions!', err);
            }
            console_1.console.error('error : ', err);
        }
    }
    exportSystem(options) {
        let source = jet.dir(options.system + '/system');
        let target = jet.dir(options.target + '/data/system');
        console_1.console.log('export system data from ' + source.path() + ' to ' + target.path());
        jet.copy(source.path(), target.path(), {
            matching: [
                '**'
            ],
            overwrite: true
        });
    }
    clean() {
        // let dir = 'leveldown';
        // let files = ['*.lib', '*.pdb'];
    }
    copyServer(options, platform) {
        let target = jet.dir(options.target + '/server/' + platform);
        let isDebug = false;
        let source = "";
        if (options.nodeServers) {
            if (!jet.exists(options.nodeServers + '/' + platform)) {
                return;
            }
            source = jet.dir(options.nodeServers + '/' + platform);
        }
        else {
            if (!isDebug) {
                source = jet.dir(options.root + '/server/' + platform);
            }
            else {
                source = jet.dir(options.root + '/server/nodejs/dist/' + platform);
            }
        }
        if (!jet.exists(source.path())) {
            return;
        }
        console_1.console.info('export Device-Server ' + platform + ' from : ' + source.path());
        try {
            jet.copy(source.path(), target.path(), {
                matching: [
                    '**'
                ],
                overwrite: true
            });
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                console_1.console.error('Error copying, file exists!', err);
            }
            if (err.code === 'EACCES') {
                console_1.console.error('Error copying, file access perrmissions!', err);
            }
        }
    }
    exportServer(options) {
        options.windows !== false && this.copyServer(options, 'windows');
        options.linux32 !== false && this.copyServer(options, 'linux_32');
        options.linux64 !== false && this.copyServer(options, 'linux_64');
        options.arm !== false && this.copyServer(options, 'arm');
        options.osx !== false && this.copyServer(options, 'osx_64');
    }
    /**
     * Create the default directory layout
     */
    createDirectoryLayout(options) {
        //jet.dir(options.target + '/www/');
    }
    /**
     *
     * @param options
     */
    exportMongo(options) {
        let source = jet.dir(options.serverTemplates + '/mongo');
        let target = jet.dir(options.target + '/mongo');
        jet.copy(source.path(), target.path(), {
            matching: [
                'mongod-arm',
                'mongod-linux_32',
                'mongod-linux_64',
                'mongod-windows.exe',
                'mongod-32.exe',
                'mongod-osx'
            ],
            overwrite: true
        });
    }
}
exports.default = Exporter;
//# sourceMappingURL=Exporter.js.map