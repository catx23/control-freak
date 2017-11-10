define([
    "dcl/dcl",
    "xide/utils",
    "xide/types",
    "xide/console",
    "xcf/model/Command",
    "xdojo/has!host-node?nxapp/protocols/ProtocolBase",
    "xdojo/has!host-node?dojo/node!yargs-parser"
], function (dcl,utils,types, console,Command,ProtocolBase,yargs) {
    var five = null;
    var debug = true;
    // The returning module
    var Module = null;

    //the johnny-five module, set when connected.
    var JohnnyFive = null;

    // client side, return nothing
    if (!ProtocolBase) {
        //create dummy module
        Module = dcl(null, {});
        patchModule();
        return Module;
    }


    Module = dcl(ProtocolBase, {
        isNodeJS: true,
        board: null,
        context:null,
        inputs: {
            A0: {pin: {}, value: 0},
            A1: {pin: {}, value: 0},
            A2: {pin: {}, value: 0},
            A3: {pin: {}, value: 0},
            A4: {pin: {}, value: 0},
            A5: {pin: {}, value: 0}
        },
        outputs: {
            D1: {pin: {}, value: 0},
            D2: {pin: {}, value: 0},
            D3: {pin: {}, value: 0},
            D4: {pin: {}, value: 0},
            D5: {pin: {}, value: 0},
            D6: {pin: {}, value: 0},
            D7: {pin: {}, value: 0},
            D8: {pin: {}, value: 0},
            D9: {pin: {}, value: 0},
            D10: {pin: {}, value: 0},
            D11: {pin: {}, value: 0},
            D12: {pin: {}, value: 0},
            D13: {pin: {}, value: 0}
        },
        get: function(field) {
            if(this.inputs[field]){
                return this.inputs[field].value;
            }else{
                console.error('pin doesnt exists : ' + field,this.inputs);
            }
        },
        set: function(field, value) {
            value = parseInt(value,10);

            if(this.inputs[field] != undefined) {

                if(parseInt(this.inputs[field].value, 10) !== parseInt( value, 10 )) {
                    this.inputs[field].value = value;
                    //this.emit('change', {field: field, value: this.inputs[field].value});
                }
            }
            else if(this.outputs[field] !== undefined) {
                if(parseInt(this.outputs[field].value,10) !== parseInt(value,10)) {
                    this.outputs[field].value = value;
                    if(this.connected) {
                        this.setHardwarePin(field, value);
                    }
                }
            }
            return this;
        },
        setHardwarePin: function(field, value) {
            var outputField = this.outputs[field];

            if(outputField && outputField.pin) {
                var pinMode = outputField.pin.mode;
            }

            if(outputField !== undefined && (field === 'D3'
                || field === 'D5'
                || field === 'D6'
                || field === 'D9'
                || field === 'D10'
                || field === 'D11') ) {
                var pinMode = outputField.pin.mode;

                // Check which pinmode is set on the pin to determine which method to call
                if (pinMode === this.PINMODES.PWM || pinMode === this.PINMODES.OUTPUT) {
                    this.outputs[field].pin.brightness(value);

                } else if(pinMode === this.PINMODES.SERVO) {
                    this.outputs[field].pin.to(value);
                }

                // For reference:
                //MODES:
                //{ INPUT: 0,
                //OUTPUT: 1,
                //ANALOG: 2,
                //PWM: 3,
                //SERVO: 4,
                //SHIFT: 5,
                //I2C: 6,
                //ONEWIRE: 7,
                //STEPPER: 8,
                //IGNORE: 127,
                //UNKOWN: 16 },

            }
            else if(pinMode == this.PINMODES.OUTPUT) {
                var pinMode = outputField.pin.mode;
                if(value >= 255) {
                    this.outputs[field].pin.on();
                }
                else {
                    this.outputs[field].pin.off();
                }
            }
        },
        addDefaultPins:function(){
            var self = this;
            // Store all pin mode mappings (string -> integer)
            this.PINMODES = this.board.io.MODES;

            var pollFreq = 100;

            // Instantiate each sensor listed on the model to the sensors array
            for(var input in this.inputs) {

                (function() {

                    if(!parseInt(input, 10)) {
                        var sensor = JohnnyFive.Sensor({
                            pin: input,
                            freq: pollFreq
                        });

                        this.inputs[input].pin = sensor;

                        sensor.scale([0, 1023]).on("data", function() {
                            self.set('A'+this.pin, Math.floor(this.value));
                            //console.log('sensor data '+'A'+this.pin,Math.floor(this.value));
                        });
                    }
                    else {
                        this.board.pinMode(input, JohnnyFive.Pin.INPUT);
                    }

                }.bind(this))();
            }


            // Cycle through and add all the outputs here
            for(var output in this.outputs) {
                (function() {
                    // hack for right now to hard code pin <3 as pwm, pin 9 as servo
                    var pin = parseInt(output.substr(1),10);
                    var outputPin;

                    if (pin === 3 || pin === 5 || pin === 6 || pin === 10 || pin === 11 || pin === 9) {
                        outputPin = new JohnnyFive.Led(pin);
                    }
                    //else if(pin === 9) {
                    //outputPin = new five.Servo({
                    //pin: pin,
                    //range: [0,180],
                    //});
                    //}

                    this.outputs[output].pin = outputPin;

                }.bind(this))();
            }

        },
        constructor:function(options){
            utils.mixin(this,options);
        },
        _sendError: function (data, command, options) {
            if(!options){
                console.error('have no options',options);
                options = {};
            }
            if(!options.params){
                console.error('have no params',options);
                options.params = {wait:true};
            }
            var wait = options.params.wait;
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));
            if (wait) {
                self.owner.onError(command, options, new Buffer(outString));
            } else {
                self.owner.onData(outString, new Buffer(outString));
            }
        },
        setMode:function(nr,mode,options){
            var board = this.board;
            //nr = parseInt(nr,10);
            mode = parseInt(mode,10);

            //this.context.pinMode(nr,mode);
            this.setHardwarePin(nr,mode);
        },
        digitalWrite:function(nr,value,options){
            this.board.digitalWrite(parseInt(nr,10), parseInt(value,10));
        },
        digitalRead:function(nr,options){
            this.board.digitalRead(parseInt(nr,10),function(value){
                console.log('digitalRead: ',value);
                this._send({
                    value:value,
                    gpio:nr
                },'digitalRead',options);
            }.bind(this));
        },
        _send: function (data, command, options) {
            var wait = options.params.wait;
            var self = this;
            var outString = JSON.stringify(utils.mixin({
                command: command
            }, data, null, 2));

            if (wait) {
                self.owner.onFinish(command, options, new Buffer(outString));
            } else {
                self.owner.onData(outString, new Buffer(outString));
            }
        },
        analogRead:function(nr,options){
            var self = this;
            /*
            var handler = function(value){
                console.log('analogRead: ',value);
                self._send({
                    value:value,
                    gpio:nr
                },'analogRead',options);
            }.bind(this);

            //this.board.analogRead.apply(this.board,[parseInt(nr,10),handler]);
            this.context.analogRead(parseInt(nr,10),handler);*/

            self._send({
                value:this.get(nr,10),
                gpio:parseInt(nr,10)
            },'analogRead',options);

        },
        /**
         *
         * @param what {string} A string encoded byte array in the 01,02,... format
         * @returns {null}
         */
        write:function(what,options){
            var _parsed = null;
            //convert buffer from byte array string to string
            var intArray = utils.bufferFromDecString(what);
            var buffer = new Buffer(intArray);

            what = buffer.toString();

            var args = what.split(" ");
            var cmd = "" + args[0];
            args.shift();

            this.isDebug() && console.log('write : ' + what, args);

            if (typeof this[cmd] === 'function') {
                args.push(options);
                try {
                    return this[cmd].apply(this, args);
                }catch(e){
                    console.error('Error running '+cmd + " : " + e.message);
                    this._sendError({
                        error:e.message
                    },cmd,options);
                }
            }else{
                console.error('cant find command '+cmd);
            }

            return;

            try {
                _parsed = (new Function("{\n" + what + "\n}")).apply(this.context,[console,this]);
            }catch(e) {
                console.error('Arduino: Error running code : ' + e.message, e);
                console.trace();
                this.owner.onError(what, e);
                utils.stack();
            }

            debug && console.log('Arduino,result '+_parsed);
            return null;
        },
        onButton:function(){
            console.log('on button');
            //send to IDE or clients
            this.owner.onData("on button");
        },
        onConnected:function(){
            this.owner.onConnected();
        },
        onInfo:function(evt){
            var owner=this.owner;
            var connectionManager = owner.delegate;
            connectionManager.onData(owner,evt);
        },
        connect: function () {
            var five = null;
            var self = this;
            try {
                five = require(["dojo/node!johnny-five"],function(_five){
                    JohnnyFive = _five;
                    five = _five;
                    var myBoard;
                    try {
                        //if(global['_j5_context']) {

                        if(global['_j5_context'] && global['_j5_context'][self.options.host]){
                            console.error('re-use!');
                            self.context = global['_j5_context'][self.options.host].context;
                            self.board = global['_j5_context'][self.options.host].board;
                            self.inputs = global['_j5_context'][self.options.host].inputs;
                            self.outputs = global['_j5_context'][self.options.host].outputs;
                            self.connected = true;
                            self.onConnected();
                            return;
                        }

                        myBoard = new five.Board({
                            repl: false,
                            debug: false,
                            port: self.options.host
                        });

                        myBoard.on("error", function (e) {
                            console.error('johnny-five ', e);
                            self._sendError(e['class'] + ':' + e.message, 'connect', self.options);
                        })
                        myBoard.on("ready", function () {
                            self.context = this;
                            self.context.j5 = _five;
                            self.context.log = console.log;
                            self.board = myBoard;
                            self.addDefaultPins();
                            self.connected = true;
                            self.onConnected();


                            if(!global['_j5_context']){
                                global['_j5_context'] = {}
                            }
                            global['_j5_context'][self.options.host] = {
                                context:self.context,
                                board:myBoard,
                                inputs : self.inputs,
                                outputs : self.outputs
                            };
                        });

                        myBoard.on("info", function (event) {
                            self.onInfo(event);
                            //console.log("%s sent an 'info' message: %s", event.class, event.message);
                        });

                    }catch(e){
                        console.error('----'+ e.message,e.stack);
                        utils.stack();
                    }
                });
            }catch(e){
                console.error('error requiring '+ e.message,e);
            }
        },
        /***
         * Standard callback when we have a message from the device we're bound to (specified in profile).
         * 1. put the message in the incoming queue, tag it as 'unread'
         * 2. in case we have messages to send and we are in 'onReply' mode, trigger outgoing queue
         *
         * @param data {Object} : Message struct build by the device manager
         * @param data.device {Object} : Device info
         * @param data.device.host {String} : The host
         * @param data.device.port {String} : The host's port
         * @param data.device.protocol {String} : The host's protocol

         * @param data.message {String} : RAW message, untreated
         */
        onMessage: function (data) {},
        end:function(){
            console.error('disconnect');
            if(this.context){
                this.context.disconnect();
                this.board = null;
            }
        },
        destroy: function () {
            console.error('disconnect');
            if(this.context){
                this.board = null;
            }
        }
    });

    Module.is = function(){
        return types.PROTOCOL.SERIAL;
    };

    function patchModule(){

        var PIN_MODES = {
            INPUT: 0x00,
            OUTPUT: 0x01,
            ANALOG: 0x02,
            PWM: 0x03,
            SERVO: 0x04
        };

        Module.getFields = function (command, fields) {
            var result = [];
            //add a GPIO field
            if(command._isGPIO) {
                command._gpio = command._gpio || 17;
                result.push(utils.createCI('test', types.ECIType.STRING, command._gpio, {
                    group: 'GPIO',
                    title: 'GPIO',
                    dst: '_gpio',
                    order: 197
                }));
            }

            //add gpio mode field
            if(command._gpioFunc === 'setMode') {
                command._mode = command._mode || "OUTPUT";
                result.push(utils.createCI('test', types.ECIType.ENUMERATION, command._mode, {
                    group: 'GPIO',
                    title: 'Mode',
                    dst: '_mode',
                    order: 198,
                    widget:{
                        options:[
                            {value:PIN_MODES.INPUT,label:"INPUT"},
                            {value:PIN_MODES.OUTPUT,label:"OUTPUT"},
                            {value:PIN_MODES.ANALOG,label:"ANALOG"},
                            {value:PIN_MODES.PWM,label:"PWM"},
                            {value:PIN_MODES.SERVO,label:"SERVO"}
                        ]
                    }
                }));
            }

            if(command._gpioFunc === 'digitalWrite') {
                command._value = command._value || 1;
                result.push(utils.createCI('test', types.ECIType.ENUMERATION, command._value, {
                    group: 'GPIO',
                    title: 'Value',
                    dst: '_value',
                    order: 199,
                    widget:{
                        options:[
                            {value:0,label:"0"},
                            {value:1,label:"1"}
                        ]
                    }
                }));
            }

            if(command._gpioFunc === 'analogWrite') {
                command._value = command._value || 1;
                result.push(utils.createCI('test', types.ECIType.ENUMERATION, command._value, {
                    group: 'GPIO',
                    title: 'Value',
                    dst: '_value',
                    order: 199,
                    widget:{
                        options:[
                            {value:0,label:"0"},
                            {value:1,label:"1"}
                        ]
                    }
                }));
            }


            return result;
        };
        /**
         *
         * @param label
         * @param icon
         * @param ctrAgs
         * @param variables
         * @param send
         * @param func
         * @param description
         * @param scope
         * @param owner
         * @param target
         * @param group
         */
        function createBlock(label,icon,ctrAgs,variables,send,func,description,scope, owner, target, group){
            return {
                name: label,
                owner: owner,
                icon: icon,
                proto: Command,
                target: target,
                ctrArgs: utils.mixin({
                    icon:icon,
                    flags:0,
                    name:label,
                    scope: scope,
                    group: group,
                    variables:variables ? JSON.stringify(variables) : "{}",
                    send:send,
                    _isGPIO:true,
                    _gpioFunc:func,
                    description:description
                },ctrAgs)
            };
        }

        /**
         * Extend xblox for new blocks/commands.
         * @param scope
         * @param owner
         * @param target
         * @param group
         * @param items
         * @returns {*}
         */
        Module.getNewBlocks=function(scope, owner, target, group, items){

            if(!items){
                return null;
            }
            items.push({
                name: 'Johnny-Five',
                iconClass: 'fa-code',
                items: [
                    createBlock('Set GPIO Mode','fa-cogs',null,
                        { 'GPIO': '_gpio','GPIO_MODE': '_mode'},
                        "setMode {{GPIO}} {{GPIO_MODE}}","setMode",
                        "Set the mode of a specific pin, one of INPUT, OUTPUT, ANALOG, PWM, SERVO. Mode constants are exposed via the Pin class",
                        scope,owner,target,group),

                    createBlock('Digital Write','fa-send',null,
                        { 'GPIO': '_gpio','GPIO_VALUE': '_value'},
                        "digitalWrite {{GPIO}} {{GPIO_VALUE}}","digitalWrite",
                        "Write a digital value (0 or 1) to a digital pin.",
                        scope,owner,target,group),

                    createBlock('Digital Read','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "digitalRead {{GPIO}}","digitalRead",
                        "Returns the GPIO level",
                        scope,owner,target,group),

                    createBlock('Analog Read','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "analogRead {{GPIO}}","analogRead",
                        "Register a handler to be called whenever the board reports the voltage value (0-1023) of the specified analog pin.",
                        scope,owner,target,group),

                    createBlock('Analog Write','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "analogWrite {{GPIO}} {{GPIO_VALUE}}","analogWrite",
                        "Write an unsigned, 8-bit value (0-255) to an analog pin.",
                        scope,owner,target,group)
                ]
            });
            return items;
        };
        /**
         * Override interface for "toText"
         * @param command
         * @param text
         * @returns {*}
         */
        Module.toText = function (command, text) {
            if(!command._isGPIO){
                return;
            }
            if(command.variables){
                var commandVariables = utils.fromJson(command.variables);
                var variables = {};

                for(var variable in commandVariables){
                    variables[variable]=command[commandVariables[variable]] || " ";
                }
                text = utils.replace(text,null,variables,{
                    begin:'{{',
                    end:'}}'
                });
                return text;
            }

        };
        Module.resolveAfter = function (command,inputString) {
            if(!command._isGPIO){
                return;
            }
            if(command.variables){
                var commandVariables = utils.fromJson(command.variables);
                var variables = {};
                for(var variable in commandVariables){
                    variables[variable]=command._resolve(command[commandVariables[variable]],{
                        flags:0x00000800
                    },false);
                }
                inputString = utils.replace(inputString,null,variables,{
                    begin:'{{',
                    end:'}}'
                });
            }
            return inputString;
        };
    }

    patchModule();

    return Module;
});

