/** @module xcf/driver/DefaultDriver */
define([
    "dcl/dcl",
    'xdojo/has',
    'xide/utils',
    "xcf/model/Command",
    'xide/types',
    "xdojo/has!host-node?nxapp/protocols/ProtocolBase",
    "xdojo/has!host-node?dojo/node!./node_modules/pigpio",
    "xdojo/has!host-node?dojo/node!yargs-parser"
], function (dcl, has, utils, Command,types,ProtocolBase, pigpio,yargs) {


    // The returning module
    var Module = null;
    //////////////////////////////////////////////////////////
    //
    //  Constants
    //
    var isServer = has('host-node');        // We are running server-side ?
    var isIDE = has('xcf-ui');              // We are running client-side and in the IDE?

    //No ProtocolBase means we're running on client side
    if (!ProtocolBase) {
        //create dummy module
        Module = dcl(null, {});
        patchModule();
        return Module;
    }


    /**
     * Default driver template. This will used for new drivers!
     *
     * @class module:xcf/driver/DefaultDriver
     * @extends module:xcf/driver/DriverBase
     * @augments module:xide/mixins/EventedMixin
     * @link http://rawgit.com/net-commander/windows-dist/master/docs/Driver/modules/module-xcf_driver_DriverBase.html
     * @link https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pwmwritedutycycle
     * @link http://www.myelectronicslab.com/tutorial/raspberry-pi-3-gpio-model-b-block-pinout/
     * @link http://razzpisampler.oreilly.com/ch05.html
     */
    Module = dcl([ProtocolBase], {
        _gpios:null,
        destroy: function () {
            for (var id in this._gpios){
                var gpio = this._gpios[id];
                gpio.disableAlert();
            }
            delete this._gpios;
        },
        /**
         * Override connect since we're not really connecting to anything
         */
        connect: function () {
            this._gpios = {};
            this.owner.onConnected();
        },
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
        write: function (data, options) {
            var intArray = utils.bufferFromDecString(data);
            var buffer = new Buffer(intArray);
            var str = data;
            var args = str.split(" ");
            var cmd = "" + args[0];
            args.shift();
            this.isDebug() && console.log('write : ' + str, args);
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
                console.warn('cmd '+cmd +' doesnt exists');
            }
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
        _sendError: function (data, command, options) {
            if(!options){
                console.error('have no options',options);
            }
            if(!options.params){
                console.error('have no params',options);
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
            nr = parseInt(nr,10);
            mode = parseInt(mode,10);
            var gpio = this.getGPIO(nr);
            gpio.mode(mode);
        },
        digitalWrite:function(nr,value,options){
            nr = parseInt(nr,10);
            value = parseInt(value,10);
            var gpio = this.getGPIO(nr);
            gpio.digitalWrite(value);
            this._send({
                value:value,
                gpio:nr
            },'digitalWrite',options);
        },
        digitalRead:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value  = gpio.digitalRead();
            this._send({
                value:value,
                gpio:nr
            },'digitalRead',options);
        },
        getGPIO:function(nr){
            var gpio = this._gpios[nr];
            if(!gpio){
                this._gpios[nr] = new pigpio.Gpio(nr);
            }
            return this._gpios[nr];
        },
        pwmWrite:function(nr,cycle,options){
            nr = parseInt(nr,10);
            cycle = parseInt(cycle,10);
            var gpio = this.getGPIO(nr);
            gpio.pwmWrite(cycle);
        },
        hardwarePwmWrite:function(nr,frequency,cycle,options){
            nr = parseInt(nr,10);
            cycle = parseInt(cycle,10);
            frequency = parseInt(frequency,10);
            var gpio = this.getGPIO(nr);
            gpio.hardwarePwmWrite(frequency,cycle);
        },
        getPwmDutyCycle:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value  = gpio.getPwmDutyCycle();
            this._send({
                value:value,
                gpio:nr
            },'getPwmDutyCycle',options);
        },
        pwmRange:function(nr,range){
            nr = parseInt(nr,10);
            range = parseInt(range,10);
            var gpio = this.getGPIO(nr);
            gpio.pwmRange(range);
        },
        getPwmRange:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value  = gpio.getPwmRange();
            this._send({
                value:value,
                gpio:nr
            },'getPwmRange',options);
        },
        getPwmRealRange:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value  = gpio.getPwmRealRange();
            this._send({
                value:value,
                gpio:nr
            },'getPwmRealRange',options);
        },
        pwmFrequency:function(nr,frequency){
            nr = parseInt(nr,10);
            frequency = parseInt(frequency,10);
            var gpio = this.getGPIO(nr);
            gpio.pwmFrequency(frequency);
        },
        getPwmFrequency:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value  = gpio.getPwmFrequency();
            this._send({
                value:value,
                gpio:nr
            },'getPwmFrequency',options);
        },
        servoWrite:function(nr,pulseWidth,options){
            nr = parseInt(nr, 10);
            pulseWidth = parseInt(pulseWidth, 10);
            var gpio = this.getGPIO(nr);
            gpio.servoWrite(pulseWidth);

        },
        getServoPulseWidth:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            var value = gpio.getServoPulseWidth();
            this._send({
                value:value,
                gpio:nr
            },'getServoPulseWidth',options);
        },
        enableInterrupt:function(nr,edge,timeout){
            nr = parseInt(nr,10);
            edge = parseInt(edge,10);
            timeout = parseInt(timeout,10);
            var gpio = this.getGPIO(nr);
            gpio.enableInterrupt(edge,timeout);
        },
        disableInterrupt:function(nr){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            gpio.disableInterrupt();
        },
        enableAlert:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            gpio.enableAlert();
            var self = this;
            gpio.on('alert',function(level,tick){
                self._send({
                    level:level,
                    tick:tick,
                    gpio:nr
                },'enableAlert',options);
            });
        },
        disableAlert:function(nr,options){
            nr = parseInt(nr,10);
            var gpio = this.getGPIO(nr);
            gpio.disableAlert();
        },
        pullUpDown:function(nr,pud){
            nr = parseInt(nr,10);
            pud = parseInt(pud,10);
            var gpio = this.getGPIO(nr);
            gpio.pullUpDown(pud);

        },
        trigger:function(nr,pulse,level){
            nr = parseInt(nr,10);
            pulse = parseInt(pulse,10);
            level = parseInt(level,10);
            var gpio = this.getGPIO(nr);
            gpio.trigger(pulse,level);
        },
        init:function(){
            this._gpios = {};
        }
    });


    //////////////////////////////////////////////////////////
    //
    //  Optional: An example implementation to extend commands in the interface for additional fields
    //

    function patchModule(){
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
                            {value:0,label:"INPUT"},
                            {value:1,label:"OUTPUT"},
                            {value:4,label:"ALT0"},
                            {value:5,label:"ALT1"},
                            {value:6,label:"ALT2"},
                            {value:7,label:"ALT3"},
                            {value:3,label:"ALT4"},
                            {value:2,label:"ALT5"}
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

            if(command._gpioFunc === 'pwmWrite') {
                command._value = command._value || 1;
                result.push(utils.createCI('test', types.ECIType.STRING, command._value, {
                    group: 'GPIO',
                    title: 'Value',
                    dst: '_value',
                    order: 199
                }));
            }

            if(command._gpioFunc === 'hardwarePwmWrite') {
                result.push(utils.createCI('test', types.ECIType.STRING, command._frequency, {
                    group: 'GPIO',
                    title: 'Frequency',
                    dst: '_frequency',
                    order: 199
                }));
            }

            if(command._gpioFunc === 'servoWrite') {
                result.push(utils.createCI('test', types.ECIType.STRING, command._pulse, {
                    group: 'GPIO',
                    title: 'Pulse Width',
                    dst: '_pulse',
                    order: 199
                }));
            }

            if(command._gpioFunc === 'pwmRange') {
                result.push(utils.createCI('test', types.ECIType.STRING, command._range, {
                    group: 'GPIO',
                    title: 'Range',
                    dst: '_range',
                    order: 199
                }));
            }

            if(command._gpioFunc === 'pwmFrequency') {
                result.push(utils.createCI('test', types.ECIType.STRING, command._frequency, {
                    group: 'GPIO',
                    title: 'Frequency',
                    dst: '_frequency',
                    order: 199
                }));
            }


            if(command._gpioFunc === 'enableInterrupt') {

                result.push(utils.createCI('test', types.ECIType.ENUMERATION, command._edge, {
                    group: 'GPIO',
                    title: 'Edge',
                    dst: '_edge',
                    order: 200,
                    widget:{
                        options:[
                            {value:0,label:"RISING_EDGE"},
                            {value:1,label:"FALLING_EDGE"},
                            {value:2,label:"EITHER_EDGE"}
                        ]
                    }
                }));

                result.push(utils.createCI('test', types.ECIType.STRING, command._timeout, {
                    group: 'GPIO',
                    title: 'Timeout',
                    dst: '_timeout',
                    order: 201
                }));
            }


            //add gpio mode field
            if(command._gpioFunc === 'pullUpDown') {
                result.push(utils.createCI('test', types.ECIType.ENUMERATION, command._pud, {
                    group: 'GPIO',
                    title: 'PUD',
                    dst: '_pud',
                    order: 199,
                    widget:{
                        options:[
                            {value:0,label:"PUD_OFF"},
                            {value:1,label:"PUD_DOWN"},
                            {value:2,label:"PI_PUD_UP"}
                        ]
                    }
                }));
            }

            if(command._gpioFunc === 'trigger') {

                result.push(utils.createCI('test', types.ECIType.STRING, command._pulse, {
                    group: 'GPIO',
                    title: 'Pulse Length',
                    dst: '_pulse',
                    order: 199
                }));

                result.push(utils.createCI('test', types.ECIType.STRING, command._level, {
                    group: 'GPIO',
                    title: 'Level',
                    dst: '_level',
                    order: 199
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
                name: 'PI-GPIO',
                iconClass: 'fa-code',
                items: [

                    createBlock('Set GPIO Mode','fa-cogs',null,
                        { 'GPIO': '_gpio','GPIO_MODE': '_mode'},
                        "setMode {{GPIO}} {{GPIO_MODE}}","setMode",
                        "Sets the GPIO mode",
                        scope,owner,target,group),

                    createBlock('Digital Write','fa-send',null,
                        { 'GPIO': '_gpio','GPIO_VALUE': '_value'},
                        "digitalWrite {{GPIO}} {{GPIO_VALUE}}","digitalWrite",
                        "Sets the GPIO level to 0 or 1. If PWM or servo pulses are active on the GPIO they are switched off.",
                        scope,owner,target,group),

                    createBlock('Digital Read','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "digitalRead {{GPIO}}","digitalRead",
                        "Returns the GPIO level",
                        scope,owner,target,group),

                    createBlock('PWM Write','fa-send',null,
                        { 'GPIO': '_gpio','DUTY_CYCLE': '_value'},
                        "pwmWrite {{GPIO}} {{DUTY_CYCLE}}","pwmWrite",
                        "Starts PWM on the GPIO. Uses DMA to control and schedule the pulse lengths and duty cycles. pwmRange can be used to change the default range of 255.Parameter Duty Cycle : an unsigned integer >= 0 (off) and <= range (fully on). range defaults to 255.",
                        scope,owner,target,group),

                    createBlock('PWM Hardware Write','fa-send',null,
                        { 'GPIO': '_gpio','DUTY_CYCLE': '_value', 'FREQUENCY': '_frequency'},
                        "hardwarePwmWrite {{GPIO}} {{FREQUENCY}} {{DUTY_CYCLE}}","hardwarePwmWrite",
                        "Starts hardware PWM on the GPIO at the specified frequency and dutyCycle. " +
                        "Frequencies above 30MHz are unlikely to work. Returns this. " +
                        "The actual number of steps between off and fully on is the integral part of 250 million divided by frequency. " +
                        "The actual frequency set is 250 million / steps. There will only be a million steps for a frequency of 250. Lower frequencies will have more steps and higher frequencies will have fewer steps. duytCycle is automatically scaled to take this into account. All models of the Raspberry Pi support hardware PWM on GPIO18.",
                        scope,owner,target,group),

                    createBlock('Get PWM Duty Cycle','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "getPwmDutyCycle {{GPIO}}","getPwmDutyCycle",
                        "Returns the PWM duty cycle setting on the GPIO.",
                        scope,owner,target,group),

                    createBlock('PWM Range','fa-send',null,
                        { 'GPIO': '_gpio','RANGE': '_range'},
                        "pwmRange {{GPIO}} {{RANGE}}","pwmRange",
                        "Selects the duty cycle range to be used for the GPIO. " +
                        "Subsequent calls to pwmWrite will use a duty cycle between 0 (off) and range (fully on). If PWM is currently active on the GPIO its duty cycle will be scaled to reflect the new range." +
                        "<br/>Parameter Range : an unsigned integer in the range 25 through 40000",
                        scope,owner,target,group),

                    createBlock('Get PWM Range','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "getPwmRange {{GPIO}}","getPwmRange",
                        "Returns the duty cycle range used for the GPIO. If hardware PWM is active on the GPIO the reported range will be 1000000.",
                        scope,owner,target,group),

                    createBlock('Get PWM Real Range','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "getPwmRealRange {{GPIO}}","getPwmRealRange",
                        "Returns the real range used for the GPIO. If hardware PWM is active on the GPIO the reported real range will be approximately 250M divided by the set PWM frequency.",
                        scope,owner,target,group),

                    createBlock('Set PMW Frequency','fa-send',null,
                        { 'GPIO': '_gpio','FREQUENCY': '_frequency'},
                        "pwmFrequency {{GPIO}} {{FREQUENCY}}","pwmFrequency",
                        "Sets the frequency in hertz to be used for the GPIO." +
                        "Each GPIO can be independently set to one of 18 different PWM frequencies."+
                        "The selectable frequencies depend upon the sample rate which may be 1, 2, 4, 5, 8, or 10 microseconds (default 5). The sample rate can be set with the configureClock function. " +
                        "If PWM is currently active on the GPIO it will be switched off and then back on at the new frequency.",
                        scope,owner,target,group),

                    createBlock('Get PMW Frequency','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "getPwmFrequency {{GPIO}}","getPwmFrequency",
                        "Returns the frequency (in hertz) used for the GPIO. The default frequency is 800Hz." +
                        "If hardware PWM is active on the GPIO the reported frequency will be that set by hardwarePwmWrite.",
                        scope,owner,target,group),

                    createBlock('Servo Write','fa-send',null,
                        { 'GPIO': '_gpio','PULSEW': '_pulse'},
                        "servoWrite {{GPIO}} {{PULSEW}}","servoWrite",
                        "Starts servo pulses at 50Hz on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500 (most clockwise)." +
                        "<br/> pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500",
                        scope,owner,target,group),

                    createBlock('Get Servo Pulse Width','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "getServoPulseWidth {{GPIO}}","getServoPulseWidth",
                        "Returns the servo pulse width setting on the GPIO.",
                        scope,owner,target,group),

                    createBlock('Enable Interrupt','fa-send',null,
                        { 'GPIO': '_gpio','EDGE': '_edge','TIME_OUT': '_timeout'},
                        "enableInterrupt {{GPIO}} {{EDGE}} {{TIMEOUT}}","enableInterrupt",
                        "Enables interrupts for the GPIO. Interrupts can have an optional timeout. The level argument passed to the interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout expires.",
                        scope,owner,target,group),

                    createBlock('DisableInterrupt','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "disableInterrupt {{GPIO}}","disableInterrupt",
                        "Enables interrupts for the GPIO. Interrupts can have an optional timeout. The level argument passed to the interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout expires.",
                        scope,owner,target,group),

                    createBlock('Enable Alert','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "enableAlert {{GPIO}}","enableAlert",
                        "Enables alerts for the GPIO. An alert event will be emitted every time the GPIO changes state." +
                        "Add a block of type finish to retrieve the even values.",
                        scope,owner,target,group),

                    createBlock('Disable Alert','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "disableAlert {{GPIO}}","disableAlert",
                        "Disables alerts for the GPIO.",
                        scope,owner,target,group),

                    createBlock('Set Pull Type ','fa-send',null,
                        { 'GPIO': '_gpio','PUD': '_pud'},
                        "pullUpDown {{GPIO}} {{PUD}}","pullUpDown",
                        "Sets or clears the resistor pull type for the GPIO.",
                        scope,owner,target,group),

                    createBlock('Trigger','fa-send',null,
                        { 'GPIO': '_gpio','PULSE': '_pulse','LEVEL': '_level'},
                        "trigger {{GPIO}} {{PULSE}} {{PULSE}}","trigger",
                        "Sends a trigger pulse to the GPIO. The GPIO is set to level for pulseLen microseconds and then reset to not level.",
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

