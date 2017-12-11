(function (parent) {
    'use strict';

    var url    = require('url'),
        http   = require('http'),
        https  = require('https'),
        uuid   = require('node-uuid'),
        events = require('events'),
        WebSocketTransport = require('./WebSocketTransport'),
        util;

    function InvalidURL (parsedURL) {
        this.parsedURL = parsedURL;
    }
    InvalidURL.prototype = {
        prototype: Error.prototype,
        toString: function () { return "Invalid URL: " + this.parsedURL.href; }
    };

    function InvalidState (extra) {
        this.extra = extra;
    }
    InvalidState.prototype = {
        prototype: Error.prototype,
        toString: function () { return "Invalid State " + this.extra; }
    };

    util = (function () {
        var empty = {};
        return {
            hasOwnProperty: function (obj, field) {
                return empty.hasOwnProperty.call(obj, field);
            },

            shallowCopy: function (src, dest) {
                var keys = Object.keys(src),
                    i;
                for (i = 0; i < keys.length; i += 1) {
                    dest[keys[i]] = src[keys[i]];
                }
            },

            liftFunctions: function (src, dest, fields) {
                var i, field;
                for (i = 0; i < fields.length; i += 1) {
                    field = fields[i];
                    if (undefined !== src[field] &&
                        undefined !== src[field].call) {
                        dest[field] = src[field].bind(src);
                    }
                }
            }
        };
    }());

    function SockJSClient (server) {
        var parsed, serverId, sessionId;

        parsed = url.parse(server);

        if ('http:' === parsed.protocol) {
            this.client = http;
        } else if ('https:' === parsed.protocol) {
            this.client = https;
        } else {
            throw new InvalidURL(parsed);
        }

        if (parsed.pathname === '/') {
            parsed.pathname = '';
        }

        serverId = Math.round(Math.random() * 999);
        sessionId = uuid();

        this.server = url.parse(
            parsed.protocol + "//" + parsed.host + parsed.pathname +
                "/" + serverId + "/" + sessionId);

        this.error = Object.getPrototypeOf(this).error.bind(this);
        this.connection = Object.getPrototypeOf(this).connection.bind(this);
        this.closed = Object.getPrototypeOf(this).closed.bind(this);

        this.emitter = new events.EventEmitter();
        util.liftFunctions(
            this.emitter, this,
            ['on', 'once', 'removeListener', 'removeAllListeners', 'emit']);

        this.writeBuffer = [];
    }

    SockJSClient.prototype = {
        isReady:   false,
        isClosing: false,
        isClosed:  false,

        connect: function () {
            if (this.isReady || this.isClosing || this.isClosed) {
                return;
            }
            var that = this
            var transport = new WebSocketTransport('ws://'+this.server.host+this.server.path+'/websocket');
            transport.write = function(writeBuffer){
              for(var i in writeBuffer){
                var message = writeBuffer[i];
                transport.send(message, function(){
                  that.error()
                });         
              }
            };
            transport.on('data', function(data){
              that.emit('data',data);
            });
            transport.on('connection', function(){
              that.connection(transport);
            });
            transport.on('close', this.closed);
        },

        connection: function (transport) {
            if (this.isClosing) {
                transport.close();
            } else if (! (this.isReady || this.isClosed)) {
                this.isReady = true;
                this.transport = transport;
                this.emit('connection');
                if (0 !== this.writeBuffer.length) {
                    transport.write(this.writeBuffer);
                    this.writeBuffer = [];
                }
            }
        },

        error: function () {
            this.isReady = false;
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift('error');
            this.emit.apply(this, args);
            if (this.isClosing) {
                this.closed();
            }
        },

        write: function (message) {
            if (this.isClosed || this.isClosing) {
                return;
            } else if (this.isReady) {
                return this.transport.write([message]);
            } else {
                this.writeBuffer.push(message);
            }
        },
        send: function(message){
          this.write(message)
        },
        close: function () {
            if (! (this.isClosing || this.isClosed)) {
                this.isClosing = true;
                if (this.isReady) {
                    this.isReady = false;
                    this.transport.close();
                }
            }
        },

        closed: function () {
            if (! this.isClosed) {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift('close');
                this.emit.apply(this, args);
            }
            this.isClosed  = true;
            this.isClosing = false;
            this.isReady   = false;
        }
    };

    exports.create = function (url) {
        var sjsc = new SockJSClient(url);
        sjsc.connect();
        return sjsc;
    };
    exports.InvalidURL = InvalidURL;
    exports.InvalidState = InvalidState;

}(this));
