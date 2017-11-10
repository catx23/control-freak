"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs'), path = require('path'), net = require('net'), os = require('os'), child_process = require('child_process');
function checkPort(port, host, callback) {
    var status = null;
    var Socket = net.Socket;
    var socket = new Socket(), status = null;
    // Socket connection established, port is open
    socket.on('connect', function () {
        status = 'open';
        socket.end();
    });
    socket.setTimeout(1500); // If no response, assume port is not listening
    socket.on('timeout', function () {
        status = 'closed';
        socket.destroy();
        console.error('time out');
        callback(null, status, host, port);
    });
    socket.on('error', function (exception) {
        status = 'closed';
        console.error('error ', exception);
        callback(null, status, host, port);
    });
    socket.on('close', function (exception) {
        callback(null, status, host, port);
    });
    //socket.connect(port, host);
    /*
        var client = net.connect({port: port},
            function() { //'connect' listener
                client.end();
                status = 'open';
                console.log('con',arguments);
            });
        socket.setTimeout(1500);
        client.on('timeout', function() {
            status = 'closed';
            client.destroy();
            console.error('time out' , exception);
        });
        client.on('error', function(exception) {
            status = 'closed';
            console.error('error ' , exception);
        });

        client.on('close', function(exception) {
            callback(null, status,host,port);
            console.log('bad : ',arguments);
        });*/
}
function isDeviceServerRunning() {
}
exports.default = {
    isDeviceServerRunning: isDeviceServerRunning,
    checkPort: checkPort,
    isWindows: function () {
        return os.platform() === 'win32';
    }
};
//# sourceMappingURL=utils.js.map