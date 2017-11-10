/** @module nxapp/protocols/JSON-RPC */
define([
    'dcl/dcl',
    "xide/utils",
    "xide/types",
    'xdojo/has!host-node?nxapp/protocols/ProtocolBase',
    "dojo/Deferred",
    'xdojo/has',
    "xcf/model/Command"
],function(dcl,utils,types,ProtocolBase,Deferred,has,Command){

    var debug = true;
    var debugData = true;
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
     * MQTT protocol mqttClient
     * @class module:nxapp/protocols/MQTT
     * @extends module:nxapp/protocols/ProtocolBase
     */
    Module = dcl(ProtocolBase,{
        declaredClass:"nxapp.protocols.JSON-RPC",
        _socket:null,
        protocolName:'json-rpc',
        instance:null,
        getOptions:function(host,port,deviceOptions){
            var options = {
            };
            return utils.mixin(options,deviceOptions);
        },
        onConnected:function(){
            this.owner.onConnected();
        },
        onError:function(error,options) {
            this.delegate.onError(this.connection,utils.mixin({
                code:error
            },options),this.options);
        },
        onClose:function(data) {
            this.delegate.onClose(this.connection,data);
        },
        _client:null,
        connect:function(){
            var _options = this.options;
            if(!_options || !_options.driver){
                debug || this.isDebug() &&  console.error('no driver in options',_options);
                return this;
            }
            var host  = _options.host;
            var port  = _options.port;
            var deviceOptions = utils.getJson(_options.options || {});
            if(deviceOptions.debug===true){
                debug = true;
            }
            var self = this;
            this.getModule('jayson').then(function(jayson){
                try {
                    self._client = jayson.client[deviceOptions.interface](host);
                    self.onConnected();
                }catch(e){
                    console.error('error creating client',e);
                }
            });
            
            this.host = host;
            this.port = port;
            this.protocol = this.protocolName;
            this._socket = {};
            this._socket.writable=true;
            return this;
        },
        onData:function(evt,buffer){
            debugData || this.isDebug() && console.log('MQTT->onData ' + evt.topic,utils.inspect(evt));
            this.delegate.onData(this.connection,evt,buffer);
        },
        onCommandError:function(cmd,options){
            debug || this.isDebug() && console.log('MQTT->CommandError ' + cmd + ' id ' + options.id + ' src ' + options.src);
            try {
                this.delegate.onData(this.connection, utils.mixin({
                    cmd: cmd,
                    event: types.EVENTS.ON_COMMAND_ERROR
                },options));
            }catch(e){
                console.error('---',e);
            }
        },
        onFinish:function(cmd,options,buffer){
            debug || this.isDebug() && console.log('MQTT onFinish ' + cmd + ' id ' + options.id + ' src ' + options.src);
            try {
                this.delegate.onData(this.connection, utils.mixin({
                    cmd: cmd,
                    event: types.EVENTS.ON_COMMAND_FINISH
                },options),buffer);
            }catch(e){
                console.error('onFinish-Error:',e);
            }
        },
        /**
         *
         * @param data {string} A string encoded byte array in the 01,02,... format
         * @param command
         * @param options
         * @private
         */
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
        write:function(what,options) {
            var _parsed = null;
            //convert buffer from byte array string to string
            var intArray = utils.bufferFromDecString(what);
            var buffer = new Buffer(intArray);
            what = buffer.toString();
            var self = this;
            try {
                var args = utils.getJson(options.params.args);
                if(!_.isArray(args)){
                    args = [];
                }
                this._client.request(what,args, function (err, response) {
                    if (err) {
                        console.error('error:  ', err);
                    }
                    self._send({
                        value: response.result
                    }, 'request ' + what + '(' + JSON.stringify(args)+')', options);
                });
            }catch(e){
                console.error("error making client request");
            }
        },
        send:function(cmd,options) {

            return;
        },
        close:function() {

        }
    });

    function patchModule(){
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
                    flags:32768,
                    name:label,
                    scope: scope,
                    group: group,
                    send:send,
                    _isJSONRPC:true,
                    _func:func,
                    description:description
                },ctrAgs)
            };
        }

        Module.getFields = function (command, fields) {
            var result = [];
            if (command._isJSONRPC) {
                command._args = command._args || {};
                result.push(utils.createCI('arguments',types.ECIType.ARGUMENT,command._args,{
                    group:'Arguments',
                    title:'Arguments',
                    dst:'_args'
                }));
            }
            return result;
        };

        /**
         * @param command
         * @returns {*|{}}
         */
        Module.getCommandArgs = function (command) {
            return command._args;
        };
        
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
                name: 'JSON-RPC',
                iconClass: 'fa-code',
                items: [
                    createBlock('Request','fa-send',null,
                        { 'GPIO': '_gpio'},
                        "request","request",
                        "",
                        scope,owner,target,group)
                ]
            });
            return items;
        };

        Module.options = function (query) {
            try {
                var dfd = new Deferred();
                var ECIType = types.ECIType;
                var NetworkGroup = 'Network';
                function createOption(label, value) {
                    return {
                        label: label,
                        value: value
                    }
                }
                var cis = [
                    utils.createCI('interface', ECIType.ENUMERATION,'', {
                        group: NetworkGroup,
                        title:'Interface',
                        description:"",
                        value:'http',
                        options:[
                            createOption('Tcp','tcp'),
                            createOption('Tls','tls'),
                            createOption('HTTP','http'),
                            createOption('HTTPS','https')
                        ]
                    })

                ];
                dfd.resolve(cis);
                return dfd;
            } catch (e) {
                console.error('error', e);
            }
            return dfd;
        };
    }
    Module._is=function(){
        return types.PROTOCOL.TCP;
    };
    
    patchModule();
    
    return Module;
});