require([
    'xapp/manager/Context',
    'require',
    'dcl/dcl',
    "xide/utils",
    "xide/types"
], function (Context, require, dcl, utils, types) {

    var context = null;
    var deviceInstance = null;
    var deviceName = "File-Server";

    //subscribe to 'onContextReady' in order to have a valid application context object
    Context.notifier.subscribe('onContextReady', function (_context) {

        //track context
        context = _context;

        //Subscribe to 'DevicesConnected' in order to get a driver instance by name.
        //This gets called multiple times since there multiple device/driver sources (user/system)
        Context.notifier.subscribe('DevicesConnected', function (evt) {
            var deviceManager = context.getDeviceManager();
            //device instance
            deviceInstance = deviceManager.getInstanceByName(deviceName);

            //not yet there ? abort and wait for the next round
            if(!deviceInstance){

            }
        });
    });
});