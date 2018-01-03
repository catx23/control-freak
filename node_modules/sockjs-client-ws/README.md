# SockJS Client Node

Node client for [SockJS](https://github.com/sockjs). Currently, only
the WebSocket transport is supported.

## Usage

    var sjsc = require('sockjs-client-ws');
    var client = sjsc.create("http://localhost/sjsServer");
    client.on('connection', function () { // connection is established });
    client.on('data', function (msg) { // received some data });
    client.on('error', function (e) { // something went wrong });
    client.write("Have some text you mighty SockJS server!");
