define([
    "dcl/dcl",
    "nxapp/protocols/Tcp",
    "xide/mixins/EventedMixin",
    "dojo/node!net",
    "dojo/node!util",
    "dojo/node!events",
    "dojo/has",
    "xide/utils"
], function(dcl,Tcp,EventedMixin,net,util,events,has,utils){

    var EventEmitter = events.EventEmitter;
    var MPD_SENTINEL = /^(OK|ACK|list_OK)(.*)$/m;
    var OK_MPD = /^OK MPD /;

    function noop(err) {
        if (err) {
            this.emit('error', err);
        }
    }



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
            console.log('on message : ')
        },
        handleMessage : function(err, msg) {
            //console.log('message: ' + err,msg);
            var handler = this.msgHandlerQueue.shift();
            handler && handler(err, msg);
            var self = this;
            if(msg){
                var bufferInt = utils.stringToBuffer(self.buffer.toString());
                var buffer = new Buffer(bufferInt);
                //console.log('handle message : ' + self.buffer.toString());
                self.owner.onData(self.buffer.toString(),buffer);
            }
        },
        sendWithCallback : function(cmd, cb) {
            cb = cb || noop.bind(this);
            this.msgHandlerQueue.push(cb);
            this.send(cmd + "\n");
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
        sendCommand :function(command, callback) {

            console.log('send command: '+command);
            var self = this;
            callback = callback || noop.bind(this);
            self.send("noidle\n");
            self.sendWithCallback(command, callback);
            self.sendWithCallback("idle", function(err, msg) {
                self.handleIdleResultsLoop(err, msg);
            });
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

                    self.buffer = self.buffer.substring(msg.length + line.length + 1);
                }
                var bufferInt = utils.stringToBuffer(self.buffer.toString());
                var buffer = new Buffer(bufferInt);
                console.log('received : ' + self.buffer.toString(),util.inspect(bufferInt));
                self.owner.onData(self.buffer.toString(),buffer);
            });
        },
        write:function(what) {
            var intArray = utils.bufferFromDecString(what);
            var buffer = new Buffer(intArray);
            what = buffer.toString();
            
            this.sendCommand(what);
            /*
            //convert buffer from byte array string to string
            var intArray = utils.bufferFromDecString(what);
            var buffer = new Buffer(intArray);
            what = buffer.toString();
            this.owner.isDebug() && console.log('write '+what);
            this.send(buffer);
            */
        }
    });
});

