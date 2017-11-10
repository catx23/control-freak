/** @module xcf/driver/DefaultDriver */
define([
    "dcl/dcl",
    'xdojo/has',
    'xide/utils'
], function (dcl, has, utils) {

    // The returning module
    var Module = null;

    //////////////////////////////////////////////////////////
    //
    //  Constants
    //
    var isServer = has('host-node');        // We are running server-side ?
    var isIDE = has('xcf-ui');              // We are running client-side and in the IDE?

    /**
     * Default driver template. This will used for new drivers!
     *
     * @class module:xcf/driver/DefaultDriver
     * @extends module:xcf/driver/DriverBase
     * @augments module:xide/mixins/EventedMixin
     * @link http://rawgit.com/net-commander/windows-dist/master/docs/Driver/modules/module-xcf_driver_DriverBase.html
     */
    Module = dcl(null, {
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
        //onMessage: function (data) {}
    });


    //////////////////////////////////////////////////////////
    //
    //  Optional: An example implementation to extend commands in the interface for additional fields
    //
    if (isIDE) {
        /**
         *
         * @param command {module:xcf/model/Command} The command which for which want to populate the fields.
         * @param fields {Object[]}
         * @link http://rawgit.com/net-commander/windows-dist/master/docs/Driver/modules/xcf_model_Command.js.html
         */
        Module.getFields = function (command, fields) {
            /*
            return [utils.createCI('test', 0, command.test, {
                group: 'General',
                title: 'test',
                dst: 'test',
                order: 198
            })];
            */
            return [];
        };
    }

    //////////////////////////////////////////////////////////
    //
    //  Optional: An example implementation to modify the string sent to a advice. This makes sense if you added additional fields as shown above.  
    //
    /**
     * Callback when a command is before parsing the expression in the "send" field. 
     * @param command {module:xcf/model/Command}
     * @param inputString {string}
     * @returns {string}
     */
    /*
    Module.resolveBefore = function (command,inputString) {
        return inputString;
    };
    */
    /**
     * Callback when a command was parsing the expression in the "send" field.
     * @param command {module:xcf/model/Command}
     * @param inputString {string}
     * @returns {string}
     */
    /*
    Module.resolveAfter = function (command,inputString) {
        return inputString;
    };
    */

    return Module;
});

