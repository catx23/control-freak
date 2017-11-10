"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('electron').app;
const Menu = require('electron').Menu;
const BrowserWindow = require('electron').BrowserWindow;
let setDevMenu = function () {
    let _lastWindow = null;
    let devMenu = Menu.buildFromTemplate([{
            label: 'Development',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'F5',
                    click: function () {
                        try {
                            BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
                        }
                        catch (e) { }
                    }
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: 'F12',
                    click: function () {
                        if (BrowserWindow.getFocusedWindow() || _lastWindow) {
                            _lastWindow = BrowserWindow.getFocusedWindow();
                            _lastWindow.toggleDevTools();
                        }
                    }
                },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Fullscreen',
                    accelerator: 'F11',
                    click: function () {
                        let win = BrowserWindow.getFocusedWindow();
                        win.setFullScreen(!win.isFullScreen());
                    }
                },
                {
                    label: 'Hide this Menu',
                    click: function () {
                        let win = BrowserWindow.getFocusedWindow();
                        win.setMenuBarVisibility(false);
                    }
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Open In Browser',
                    click: function () {
                        require("electron").shell.openExternal("http://localhost:8887/Code/xapp/xcf/index.php?theme=blue&debug=false&run=run-release&protocols=true&xideve=true&plugins=false&xblox=true&files=true");
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    accelerator: 'F1',
                    click: function () {
                        require("electron").shell.openExternal("http://localhost:8887/docs/Getting_Started");
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(devMenu);
};
exports.default = {
    setDevMenu: setDevMenu
};
//# sourceMappingURL=dev_helper.js.map