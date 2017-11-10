/** @module xcf/driver/DriverBase */
define([
    "dcl/dcl",
    'xdojo/has',
    'xide/types'
], function (dcl,has,types) {

    var _debug = false;
    /**
     * Driver Base Class
     *
     * Please read {@link module:xide/types}
     *
     * Online docs: http://rawgit.com/mc007/xcfnode/tree/master/out
     *
     * @class module:xcf.driver.DriverBase
     */
    var Module = dcl(null, {
        declaredClass:'system_drivers/DriverBase',
        /**
         * The information about the device in this structure:
         * @example
         * {
         *   driver:"Marantz/MyMarantz.js",
         *   host:"102.123.23.23"
         *   port:23,
         *   protocol:"tcp"
         *   scope:"system_drivers"
         * }
         *
         * @type {object}
         */
        options: null,
        /**
         * The information about the driver it self
         * @example
         * {
         *   name:"My Marantz",
         *   path:"Marantz/My Marantz.meta.json"
         * }
         *
         * @private
         * @type {object}
         */
        storeItem: null,
        /**
         * The xBlox scope object for this driver. It contains all commands, variables and settings. You can blocks
         * through here
         * @private
         * @access private
         */
        blockScope: null,
        /**
         * Our delegate is in charge to send messages
         * @private
         * @access private
         */
        delegate: null,
        /**
         * @type {string}
         * @default \r
         */
        lineBreak: '\r',
        // (optional, but recommended) name your class:
        // constructor is a method named ... 'constructor'
        constructor: function (name) {},
        /**
         * sendSettings contains the constants for receiving and sending data to a device
         * its being set at initialization time and has this structure:
         * @example
         {
             constants:{
                 end:'\r',
                 start:'',
             },
             send:{
                 interval:500,
                 mode:true|false,    //true=onReply | false=Interval
                 onReply:'\n',
                 timeout:500
             }
         }
         * @type {object}
         */
        sendSettings: null,
        /**
         * responseSettings contains the constants for receiving data from a device
         * its being set at initialization time and has this structure:
         * @example
         {
                start:false,
                startString:''
                cTypeByte:false,        //construction type 'Per Byte'
                cTypePacket:false,      //construction type 'Per Packet'
                cTypeDelimiter:true,    //construction type 'Per Delimiter'
                cTypeCount:false,       //construction type 'Per Count'
                delimiter:'',           //the delimiter
                count:10                //packet count
         }
         * @type {object}
         */
        responseSettings: null,
        /**
         * currently outgoing message queue
         * @private
         * @type {message[]}
         */
        outgoing: null,
        /**
         * currently incoming message queue
         * @private
         * @type {message[]}
         */
        incoming: null,
        // reference to a Javascript timer object, used for sending outgoing messages. private!
        /**
         * @private
         */
        queueTimer: null,
        /**
         * private!in case processOutgoing is busy
         * @private
         */
        busy: false,
        /**
         * Method to add a logging message.
         *
         * @param level {string} This can be error, warning, info, trace or custom
         * @param type {string} An additional string, by default this is set to "Device"
         * @param message {string} The message it self
         * @param data {object} An optional object/data you want to include
         *
         * @example
         *
         // for instance you want to log any incoming message in a custom way, you need to overwrite 'sendMessage' in
         // your base class like this:

         onMessage: function (data) {

                this.log('info', 'my marantz', 'Marantz Driver Message: ' + data.message, {
                    some: 'extra',
                    message: data
                });

                this.inherited(arguments); //important, call BaseDriver::onMessage!
            }
         *
         */
        log: function (level, type, message, data) {

            return this.inherited(arguments);

        },
        /**
         * Callback when we got changed by an external editor or the IDE.
         */
        onReloaded: function (evt) {
        },
        /***
         * Unescape string from line breaks
         * @param str
         * @returns {*}
         */
        unescape: function (str) {
            try {
                if (str) {
                    return JSON.parse('"' + str + '"');
                }
            }catch(e){

            }
            return str;
        },
        /**
         * Surround command with 'start' and 'end' constant, specified in the command settings
         * of the driver.
         * @param msg
         * @returns {*|string|String}
         */
        prepareMessage: function (msg) {


            // add 'start'
            if (this.sendSettings.constants.start) {
                msg = this.sendSettings.constants.start + msg;
            }

            // add 'end'
            if (this.sendSettings.constants.end) {
                var _t = this.sendSettings.constants.end.split('\\n').join('\n');
                if (_t) {
                    _t = _t.split('\\r').join('\r');
                }
                msg += _t;
            }

            var _m = msg.split('\\n').join('\n');
            if (_m) {
                _m = _m.split('\\r').join('\r');
            }
            //console.log('send '+_m);
            return _m;
        },
        /***
         * Process outgoing sends last message from this.outgoing
         * @param force
         */
        processOutgoing: function (force) {


            if(force==true){
                this.busy=false;
            }

            //locked?
            if (this.busy) {
                return;
            }
            this.busy = true;

            var thiz = this;
            if (!this.outgoing) {
                this.outgoing = [];
            }

            //console.log('process ');
            //send via interval
            if (!this.sendSettings.send.mode && this.sendSettings.send.interval > 0) {
                //prepare timer if not already
                this.queueTimer = this.queueTimer || setInterval(function () {
                    thiz.busy = false;//reset lock
                    thiz.processOutgoing();
                }, this.sendSettings.send.interval);
            }

            var messageToSend = this.outgoing[0];//pick the first

            //now finally send it out
            if (messageToSend) {

                messageToSend.msg = this.prepareMessage(messageToSend.msg);

                //send via interval mode
                if(!this.sendSettings.send.mode){
                    try {
                        if (thiz.delegate && thiz.delegate.sendDeviceCommand) {
                            thiz.delegate.sendDeviceCommand(thiz, messageToSend.msg,messageToSend.src,messageToSend.id);
                        } else {
                            console.error('have no delegate');
                        }
                    } catch (e) {
                        console.error('error sending message : ' + e.message);
                    }
                    //remove from out going
                    thiz.outgoing.remove(messageToSend);
                }else{

                    //send via onReply mode

                    //special case, first command && nothing received yet:
                    if(this.incoming==null || force==true){
                        try {

                            if (thiz.delegate && thiz.delegate.sendDeviceCommand) {
                                thiz.delegate.sendDeviceCommand(thiz, messageToSend.msg,messageToSend.src,messageToSend.id);
                            } else {
                                console.error('have no delegate');
                            }
                        } catch (e) {
                            console.error('error sending message : ' + e.message);
                            console.trace();
                        }
                        //remove from out going
                        thiz.outgoing.remove(messageToSend);
                        thiz.busy = false;//reset lock
                    }
                }
            }
        },
        /**
         * Send message send a string to the device. Basing on the send settings this message will be queued or send
         * on reply.
         * @param msg {string} the string to send
         * @param now {string} force sending now!
         * @param src {string} the id of the source block
         * @param id {string} the id of the send job
         */
        callMethod: function (method, args, src, id) {
            if (this.delegate && this.delegate.callMethod) {
                if(!_.isString(args)){
                    args = JSON.stringify(args);
                }
                return this.delegate.callMethod(this,method, args, src, id);
            }
        },
        /**
         * Send message send a string to the device. Basing on the send settings this message will be queued or send
         * on reply.
         * @param msg {string} the string to send
         * @param now {string} force sending now!
         * @param src {string} the id of the source block
         * @param id {string} the id of the send job
         */
        sendMessage: function (msg, now,src,id) {

            if (!this.sendSettings) {
                console.error('have no send settings');
                return;
            }

            //check we have a queue array
            if (!this.outgoing) {
                this.outgoing = [];
            }


            /**
             * if this.sendSettings.send.mode == false, its sending via 'interval', if true its on 'reply'
             */

            if (now !== false) {

                var _interval = parseInt(this.sendSettings.send.interval) || 0;

                //we send per interval
                if (!this.sendSettings.send.mode && _interval > 0) {

                    //add it to the queue
                    this.outgoing.push({
                        msg: msg,
                        src:src,
                        id:id
                    });

                    //trigger outgoing
                    this.processOutgoing();

                }else if (!_interval) {//we se

                    if (this.delegate && this.delegate.sendDeviceCommand) {
                        return this.delegate.sendDeviceCommand(this, msg,src,id);
                    } else {
                        console.error('have no delegate');
                    }
                }
                //we send on reply
                else if (this.sendSettings.send.mode) {


                    //add it to the queue
                    this.outgoing.push({
                        msg: msg,
                        src:src,
                        id:id
                    });

                    //trigger outgoing
                    this.processOutgoing();

                    return;
                }

                return;
            }

            //we send directly
            if (this.delegate && this.delegate.sendDeviceCommand) {
                return this.delegate.sendDeviceCommand(this, msg,src,id);
            } else {
                console.error('have no delegate');
            }

            return false;
        },
        /**
         * Deal with Javascript special characters, indexOf("\n") fails otherwise
         * @returns {string}
         */
        getLineBreakSend: function () {
            if (!this.sendSettings) {
                return '';
            }
            var lineBreak = '' + this.sendSettings.constants.end;
            var lb = JSON.parse('"' + lineBreak + '"');
            /*
             var n1 = lineBreak.charCodeAt(0);
             var n2 = lineBreak.charCodeAt(1);

             if(!isNaN(n1) && !isNaN(n2)){
             if(n1 == 92){// means '\'
             if(n2 == 114 ){
             lineBreak = '\r';
             }
             if(n2 == 110 ){
             lineBreak = '\n';
             }
             }
             }
             */
            return lb || '\r';
        },
        /**
         * Deal with Javascript special characters, indexOf("\n") fails otherwise
         * @returns {string}
         */
        getLineBreak: function () {
            if (!this.responseSettings || !this.responseSettings.cTypeDelimiter) {
                return '';
            }
            var lineBreak = '' + this.responseSettings.delimiter;
            var lb = JSON.parse('"' + lineBreak + '"');
            /*
             var n1 = lineBreak.charCodeAt(0);
             var n2 = lineBreak.charCodeAt(1);

             if(!isNaN(n1) && !isNaN(n2)){
             if(n1 == 92){// means '\'
             if(n2 == 114 ){
             lineBreak = '\r';
             }
             if(n2 == 110 ){
             lineBreak = '\n';
             }
             }
             }*/
            return lb || '\r';
        },
        /**
         * Splits a message string from the device server into an array of messages. Its using 'responseSettings'
         * @param str
         * @returns {string[]}
         */
        split: function (str) {

            if (!this.responseSettings || !this.getLineBreak()) {
                return [str];
            }
            if (this.responseSettings.cTypeDelimiter) {
                var lineBreak = this.getLineBreak();
                var has = str.indexOf(lineBreak);
                if (has != -1) {
                    var _split = str.split(lineBreak);
                    return _split;
                }
                return [str];
            }
            return [str];
        },
        /////////////////////////////////////////////////////////////////////////////////////
        //
        //  Utils
        //
        /////////////////////////////////////////////////////////////////////////////////////
        /**
         * Return true if we have message
         * @returns {boolean}
         */
        hasMessages: function () {
            return this.outgoing && this.outgoing.length > 0;
        },
        /**
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
         *
         * @example

                // for instance you might update the "Volume" Variable within onMessage:
                onMessage:function(data){

                    var value = data.message;
                    var volume = 0;
                    if (value.indexOf('MV') != -1 && value.indexOf('MVMAX') == -1) {
                        var _volume = value.substring(2, value.length);
                        _volume = parseInt(_volume.substring(0, 2));
                        if (!isNaN(_volume)) {
                            this.setVariable('Volume', _volume);
                            volume = _volume;
                        }
                    }

                    // do something else with volume:
                    this.log('info',null,'Did update volume to ' + volume);

                    //important, call BaseDriver::onMessage!
                    this.inherited(arguments);

                }
         */
         onMessage: function (data) {
            //track message
            this.incoming = data;
            _debug && console.log('incoming message : ' + data.message);
            //we're in 'onReply' mode
            if (this.sendSettings && this.sendSettings.send.mode) {
                var _onReplyString = '' + this.unescape(this.sendSettings.send.onReply);
                var _messageString = '' + this.unescape(data.message);
                if (!this.sendSettings.send.onReply || _onReplyString ===_messageString) {
                    console.log(' did match on onReply!');
                //if (!this.sendSettings.send.onReply || this.unescape(this.sendSettings.send.onReply) === data.message) {
                    /*console.error('trigger send');*/
                    this.processOutgoing(true);
                }
            }
        },
        /***
         * Standard callback when we have a feedback message from any device. The message data contains
         * all needed info like which device, the response, etc...
         * @param msg
         */
        onBroadcastMessage: function (msg) {
        },
        /**
         * Main entry when this instance is started
         * @returns {boolean}
         */
        start: function () {
            this.outgoing = [];
            return true;
        },
        /**
         * Set a variable's value
         * @param title {string} the name of the variable
         * @param value {string} the new value
         */
        setVariable:function(title,value){
            var _variable = this.blockScope.getVariable(title);
            if (_variable) {
                _variable.value = value;
                _variable.set('value',value);
            } else {
                _debug &&  console.log('no such variable : ' + title);
                return;
            }
            this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                item: _variable,
                scope: this.blockScope,
                owner: this,
                save: false
            });
        },
        /**
         * Return a variable's value
         * @param title {string} the name of the variable
         * @returns {string} the value of the variable
         */
        getVariable:function(title){
            var _variable = this.blockScope.getVariable(title);
            if (_variable) {
                return _variable.value;
            }
            return '';
        },
        callCommand:function (title) {
            var _block = this.blockScope.getBlockByName(title);
            if (_block) {
                _block.solve(this.blockScope);
            }
        }
    });

    dcl.chainAfter(Module,'onMessage');
    dcl.chainAfter(Module,'start');
    return Module;
});
