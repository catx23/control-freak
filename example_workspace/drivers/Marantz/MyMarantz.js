define([
    "dcl/dcl",
    "xcf/model/Command",
    'xide/utils',
    'xide/types',
    'xdojo/has',
    "xdojo/has!host-node?nxapp/protocols/ProtocolBase"
], function (dcl,Command,utils,types,has,ProtocolBase) {
    // The returning module
    var Module = dcl(null, {
        updatePower: function (value) {
            value = value || this.getVariable('value');
            var out = 0;
            if (value.indexOf('@PWR:') != -1) {
                var _pw = value.split(':')[1];
                if (!isNaN(_pw)) {
                    this.setVariable('PowerState', _pw == 2 ? 'on' : 'off');
                    out = _pw;
                }
            }
            return out;
        },
        updateSource: function (value) {
            value = value || this.getVariable('value');
            if (value.startsWith('SI') && value.indexOf("@") ==-1 && value.length>2) {
                var _source = value.substring(2, value.length);
                this.setVariable('Source', _source);
            }
        },
        updateVolume: function (value) {
            value = value || this.getVariable('value') || "";
            var out = 0;
            if (value.indexOf('MV') != -1 && value.indexOf('MVMAX') == -1) {
                var _volume = value.substring(2, value.length);
                _volume = parseInt(_volume.substring(0, 2),10);
                if (!isNaN(_volume)) {
                    this.setVariable('Volume', _volume);
                    out = _volume;
                } else {
                    return null;
                }
            } else {
                return null;
            }
            return out;
        },
        testx: function (arg) {
            console.log('testx');
            return "mv?";
        },
        testCall: function (test) {
            var value = this.callCommand('PowerOn');
        },
        onMessage: function (data) {
            var message = data.message || "";
            if(!message || !message.length){
                return;
            }
            this.updateVolume(message);
            this.updatePower(message);
            this.updateSource(message);
            if (data.message.indexOf('MVMAX') != -1) {
                return;
            }
        },
        onDriverVariableChanged:function(evt){

            //grab the variable
            var variable = evt.item;

            //grab the xblox scope
            var blockScope = variable.scope;

            //abort if is not ours, we also receive here variable changes from other devices
            // notice:  we use != instead of !==
            //          this is because we compare 2 object pointers and not two primitive's values
            if(blockScope != this.blockScope){
                return;
            }

            //Example: make some special effort for variable "Volume"
            //if(variable.name ==="Volume"){
            //console.info("Volume changed : " + variable.value);
            //}


            //Example: abort if it is not a certain variable
            if(variable.name !=="value"){
                //console.warn("skip variable " + variable.name);
                return;
            }

            //Example: print something in console
            //console.log('onDriverVariableChanged '  + variable.name + ' new value:' + variable.value);


            //Example: do something with the variable
            var value = "" + variable.value; //important, build a new string
            value++;

            //Example: call a command
            if(value ==='whatever'){
                this.callCommand("Command Name");
            }

            //Example: store it in another variable
            if(value ==='whatever'){
                this.setVariable("the other variable's name ",value);
            }


        },
        /**
         * This function is called as soon the device is connected
         */
        start:function(){
            //some debugging message
            //console.log('started Marantz',this);
            //Example:  we subscribe on variable changes, globally
            this.subscribe("onDriverVariableChanged");
            //Example, specify the event handler explizit
            //this.subscribe("onDriverVariableChanged",this.onDriverVariableChanged);
        }
    });
    //////////////////////////////////////////////////////////
    //
    //  Constants
    //
    var isServer = has('host-node');        // We are running server-side ?
    var isIDE = has('xcf-ui');              // We are running client-side and in the IDE?

    function patchModule(){
        Module.getFields = function (command, fields) {
            var result = [];

            if(command._gpioFunc === 'setMode') {

                command._value = command._value || 1;

                result.push(utils.createCI('test', types.ECIType.STRING, command._gpio, {
                    group: 'GPIO',
                    title: 'Value',
                    dst: '_gpio',
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
                name: 'Marantz',
                iconClass: 'fa-code',
                items: [
                    createBlock('Set Input','fa-cogs',null,
                        { 'GPIO': '_gpio'},
                        "SI {{GPIO}}","setMode",
                        "Sets the GPIO mode",
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

    //No ProtocolBase means we're running on client side
    if (!ProtocolBase) {
        //create dummy module
        //Module = dcl(null, {});
        patchModule();
        return Module;
    }

    patchModule();

    return Module;
});