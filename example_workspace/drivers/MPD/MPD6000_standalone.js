define([
    "dcl/dcl",
    "nxapp/protocols/Tcp",
    "xide/mixins/EventedMixin",
    "dojo/node!net",
    "dojo/node!util",
    "dojo/node!events",
    "module",
    "dojo/has"
], function(dcl,Tcp,EventedMixin,net,util,events,module,has){
    var EventEmitter = events.EventEmitter;
    var MPD_SENTINEL = /^(OK|ACK|list_OK)(.*)$/m;
    var OK_MPD = /^OK MPD /;

    function noop(err) {
        if (err) {
            this.emit('error', err);
        }
    }


    MpdClient.Command = Command;
    MpdClient.cmd = cmd;
    MpdClient.parseKeyValueMessage = parseKeyValueMessage;
    MpdClient.parseArrayMessage = parseArrayMessage;

    function MpdClient() {
        EventEmitter.call(this);
        this.buffer = "";
        this.msgHandlerQueue = [];
        this.idling = false;
    }
    if(has("host-node")) {
        util.inherits(MpdClient, EventEmitter);
    }

    var defaultConnectOpts = {
        host: 'localhost',
        port: 6600
    };

    MpdClient.connect = function(options) {
        options = options || defaultConnectOpts;

        var client = new MpdClient();
        client.socket = net.connect(options, function() {
            client.emit('connect');
        });
        client.socket.setEncoding('utf8');
        client.socket.on('data', function(data) {
            client.receive(data);
        });
        client.socket.on('close', function() {
            client.emit('end');
        });
        client.socket.on('error', function(err) {
            client.emit('error', err);
        });
        return client;
    }

    MpdClient.prototype.receive = function(data) {

        console.log('received : ',data);

        var m;
        this.buffer += data;

        while (m = this.buffer.match(MPD_SENTINEL)) {
            var msg = this.buffer.substring(0, m.index)
                , line = m[0]
                , code = m[1]
                , str = m[2];

            if (code === "ACK") {
                var err = new Error(str);
                this.handleMessage(err);
            } else if (OK_MPD.test(line)) {
                this.setupIdling();
            } else {
                this.handleMessage(null, msg);
            }

            this.buffer = this.buffer.substring(msg.length + line.length + 1);

        }
    };

    MpdClient.prototype.handleMessage = function(err, msg) {
        var handler = this.msgHandlerQueue.shift();
        handler(err, msg);
    };

    MpdClient.prototype.setupIdling = function() {
        var self = this;
        self.sendWithCallback("idle", function(err, msg) {
            self.handleIdleResultsLoop(err, msg);
        });
        self.idling = true;
        self.emit('ready');
    };

    MpdClient.prototype.sendCommand = function(command, callback) {
        var self = this;
        callback = callback || noop.bind(this);
        self.send("noidle\n");
        self.sendWithCallback(command, callback);
        self.sendWithCallback("idle", function(err, msg) {
            self.handleIdleResultsLoop(err, msg);
        });
    };

    MpdClient.prototype.sendCommands = function(commandList, callback) {
        var fullCmd = "command_list_begin\n" + commandList.join("\n") + "\ncommand_list_end";
        this.sendCommand(fullCmd, callback || noop.bind(this));
    };

    MpdClient.prototype.handleIdleResultsLoop = function(err, msg) {
        var self = this;
        if (err) {
            self.emit('error', err);
            return;
        }
        self.handleIdleResults(msg);
        if (self.msgHandlerQueue.length === 0) {
            self.sendWithCallback("idle", function(err, msg) {
                self.handleIdleResultsLoop(err, msg);
            });
        }
    };

    MpdClient.prototype.handleIdleResults = function(msg) {
        var self = this;
        msg.split("\n").forEach(function(system) {
            if (system.length > 0) {
                var name = system.substring(9);
                self.emit('system-' + name);
                self.emit('system', name);
            }
        });
    };

    MpdClient.prototype.sendWithCallback = function(cmd, cb) {
        cb = cb || noop.bind(this);
        this.msgHandlerQueue.push(cb);
        this.send(cmd + "\n");
    };

    MpdClient.prototype.send = function(data) {
        this.socket.write(data);
    };

    function Command(name, args) {
        this.name = name;
        this.args = args;
    }

    Command.prototype.toString = function() {
        return this.name + " " + this.args.map(argEscape).join(" ");
    };

    function argEscape(arg){
        // replace all " with \"
        return '"' + arg.toString().replace(/"/g, '\\"') + '"';
    }

    

// convenience
    function cmd(name, args) {
        return new Command(name, args);
    }

    function parseKeyValueMessage(msg) {
        var result = {};

        msg.split('\n').forEach(function(p){
            if(p.length === 0) {
                return;
            }
            var keyValue = p.match(/([^ ]+): (.*)/);
            if (keyValue == null) {
                throw new Error('Could not parse entry "' + p + '"')
            }
            result[keyValue[1]] = keyValue[2];
        });
        return result;
    }

    function parseArrayMessage(msg) {
        var results = [];
        var obj = {};

        msg.split('\n').forEach(function(p) {
            if(p.length === 0) {
                return;
            }
            var keyValue = p.match(/([^ ]+): (.*)/);
            if (keyValue == null) {
                throw new Error('Could not parse entry "' + p + '"')
            }

            if (obj[keyValue[1]] !== undefined) {
                results.push(obj);
                obj = {};
                obj[keyValue[1]] = keyValue[2];
            }
            else {
                obj[keyValue[1]] = keyValue[2];
            }
        });
        results.push(obj);
        return results;
    }


    return dcl([Tcp,EventedMixin.dcl], {
        /***
         * Standard callback when we have a message from the device we're bound to (specified in profile).
         * 1. put the message in the incoming queue, tag it as 'unread'
         * 2. in case we have messages to send and we are in 'onReply' mode, trigger outgoing queue
         *
         * @param data {Object} : Message Struct build by the device manager
         * @param data.device {Object} : Device info
         * @param data.device.host {String} : The host
         * @param data.device.port {String} : The host's port
         * @param data.device.protocol {String} : The host's protocol

         * @param data.message {String} : RAW message, untreated
         */
        onMessage:function(data){
            //console.log('on message : ')
        },
        handleMessage : function(err, msg) {
            console.log('message ' +msg);
            var handler = this.msgHandlerQueue.shift();
            handler(err, msg);
        },
        sendWithCallback : function(cmd, cb) {
            cb = cb || noop.bind(this);
            this.msgHandlerQueue.push(cb);
            this.send(cmd + "\n");
            console.log('send : '+cmd);
        },
        setupIdling : function() {
            var self = this;
            self.sendWithCallback("idle", function(err, msg) {
                self.handleIdleResultsLoop(err, msg);
            });
            self.idling = true;
            self._emit('ready');
        },
        send:function(data){
            this._socket.write(data);
        },
        handleIdleResults : function(msg) {
            var self = this;
            msg.split("\n").forEach(function(system) {
                if (system.length > 0) {
                    var name = system.substring(9);
                    console.log('emit');
                    self._emit('system-' + name);
                    self._emit('system', name);
                }
            });
        },

        handleIdleResultsLoop : function(err, msg) {
            var self = this;
            if (err) {
                self._emit('error', err);
                return;
            }
            self.handleIdleResults(msg);
            if (self.msgHandlerQueue.length === 0) {
                self.sendWithCallback("idle", function(err, msg) {
                    self.handleIdleResultsLoop(err, msg);
                });
            }
        },
        onData:function(connection,string,buffer){
            console.log('on data '  + string);
        },
        sendCommand :function(command, callback) {
            var self = this;
            callback = callback || noop.bind(this);
            self.send("noidle\n");
            self.sendWithCallback(command, callback);
            self.sendWithCallback("idle", function(err, msg) {
                self.handleIdleResultsLoop(err, msg);
            });
        },
        connectB: function () {
            console.log('connect ');
           
            
            var defaultConnectOpts = {
                host: 'localhost',
                port: 6600
            };


            var client = MpdClient.connect({
                port: 6600,
                host: 'localhost'
            });
            client.on('system', function(name) {
                console.log("update", name);
            });

            client.on('system-player', function() {
                console.log('system-player : ',arguments);
                client.sendCommand(cmd("status", []), function(err, msg) {
                    if (err) throw err;
                    console.log('status',msg);
                });
            });
            return;
            
            var self = this;
            this._socket = net.connect(defaultConnectOpts, function() {
                console.log('connected');
                self.buffer = "";
                self.msgHandlerQueue = [];
                self.idling = false;
            });

            this._socket.setEncoding('utf8');

            this._socket.on('data', function(data) {
                console.log('data '+data.toString());
                var m;
                self.buffer += data;
                while (m = self.buffer.match(MPD_SENTINEL)) {

                    var msg = self.buffer.substring(0, m.index)
                        , line = m[0]
                        , code = m[1]
                        , str = m[2];

                    if (code === "ACK") {
                        var err = new Error(str);
                        self.handleMessage(err);
                    } else if (OK_MPD.test(line)) {
                        self.setupIdling();
                    } else {
                        self.handleMessage(null, msg);
                    }

                    self.buffer = self.buffer.substring(msg.length + line.length + 1);
                    console.log('received : ' + self.buffer.toString());
                }
            });
        },
        connect2: function () {
            
            
            
            var defaultConnectOpts = {
                host: 'localhost',
                port: 6600
            };

            /*

            var client = MpdClient.connect({
                port: 6600,
                host: 'localhost'
            });
            client.on('system', function(name) {
                console.log("update", name);
            });

            client.on('system-player', function() {
                console.log('system-player : ',arguments);
                client.sendCommand(cmd("status", []), function(err, msg) {
                    if (err) throw err;
                    console.log('status',msg);
                });
            });
            return;*/
            

            var self = this;
            this._socket = net.connect(defaultConnectOpts, function() {
                console.log('connected');
                self.buffer = "";
                self.msgHandlerQueue = [];
                self.idling = false;
                self._on('system-player', function() {
                    console.log('system player',arguments)
                    self.sendCommand(cmd("status", []), function(err, msg) {
                        if (err) throw err;
                        console.log(msg);
                    });
                });
            });

            this._socket.setEncoding('utf8');

            this._socket.on('data', function(data) {
                console.log('data '+data.toString());
                var m;
                self.buffer += data;
                while (m = self.buffer.match(MPD_SENTINEL)) {

                    var msg = self.buffer.substring(0, m.index)
                        , line = m[0]
                        , code = m[1]
                        , str = m[2];

                    if (code === "ACK") {
                        var err = new Error(str);
                        self.handleMessage(err);
                    } else if (OK_MPD.test(line)) {
                        self.setupIdling();
                    } else {
                        self.handleMessage(null, msg);
                    }

                    self.buffer = self.buffer.substring(msg.length + line.length + 1);
                    console.log('received : ' + self.buffer.toString());
                }
            });
            
        },
        test:function(){
        	//send a message :
        	this.sendMessage('pwon',true);//sends message to device , respecting start & end settings . forcing now!
        },
        onConnect:function(){
            var self = this;
            self._on('system-player', function() {
                self.sendCommand(cmd("status", []), function(err, msg) {
                    if (err) throw err;
                    console.log(msg);
                });
            });
            this._socket.setEncoding('utf8');

            this.buffer = "";
            this.msgHandlerQueue = [];
            this.idling = false;
            

            this._socket.on('data',function(data){
                var m;
                self.buffer += data;
                while (m = self.buffer.match(MPD_SENTINEL)) {
                    var msg = self.buffer.substring(0, m.index)
                        , line = m[0]
                        , code = m[1]
                        , str = m[2];

                    if (code === "ACK") {
                        var err = new Error(str);
                        self.handleMessage(err);
                    } else if (OK_MPD.test(line)) {
                        self.setupIdling();
                    } else {
                        self.handleMessage(null, msg);
                    }

                    console.log('received : ' + self.buffer.toString());
                    self.buffer = self.buffer.substring(msg.length + line.length + 1);
                    
                }
            });
        }
    });
});

