define(["module","dcl/dcl"], function(module,dcl){
    return dcl(null, {
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
        	
        },
        test:function(){
        	
        	//send a message :
        	this.sendMessage('pwon',true);//sends message to device , respecting start & end settings . forcing now!
        }
    });
});

