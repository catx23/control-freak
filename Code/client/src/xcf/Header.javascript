var debug=false;
var device=null;
var sctx=null;
var ctx=null;
var cctx=null;
var mctx=null;
var rtConfig="debug";
var dataHost ="";

var dojoConfig ={
        trace:{
            'loader-finish-exec':0
        },
        aliases:[['i18n', 'dojo/i18n']],
		ioPublish:true,
		baseUrl: '%APP_URL%/lib/',
		deferredInstrumentation:false,
		has: {
		    'dojo-firebug': false,
		    'tab-split':true,
		    'dojo-undef-api': true,
		    'xblox-ui':true,
		    'xlog':true,
		    'xblox':true,
		    'xideve':true,
		    'xreload':true,
		    'xidebeans':true,
		    'delite':true,
		    'xexpression':false,
		    'filtrex':true,
		    'dojo-built':true,
		    'ace-formatters':true,
		    'xnode-ui':true,
		    'xcf-ui':true,
		    'xcf':true,
		    'host-node':false,
		    'xace':true,
		    'drivers':true,
		    'devices':true,
		    'plugins':false,
		    'php':true,
		    'FileConsole':false,
		    'deferredInstrumentation':false,
		    'x-markdown':true,
		    'xtrack':true
        },
        tlmSiblingOfDojo: 0,
        parseOnLoad: false,
        async: 1,
        packages:%DOJOPACKAGES%,
		map:{
		    '*':{
		        'requirejs-dplugins/has':'requirejs-dplugins/ha3',
		        'decor/Observable':'xide/Observable'
            }
        }
};

var xcfConfig={
    "serviceUrl":"%RPC_URL%",
    "mixins":[
        {
            "declaredClass":'xtrack.manager.TrackingManager',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xide.manager.ServerActionBase',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xide.manager.SettingsManager',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xide.manager.ResourceManager',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true,
                resourceVariables:%RESOURCE_VARIABLES%
            }
        },
        {
            "declaredClass":'davinci.model.resource.Resource',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xfile.manager.FileManager',
            "mixin":{
                serviceClass:'XCOM_Directory_Service',
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xnode.manager.NodeServiceManager',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'davinci.model.resource.File',
            "mixin":{
                "serviceUrl":"%RPC_URL%",
                "singleton":true
            }
        },
        {
            "declaredClass":'xcf.manager.DriverManager',
            "mixin":{
                "prefetch":{
                    "system_drivers":%XCF_SYSTEM_DRIVERS%,
                    "user_drivers":%XCF_USER_DRIVERS%
                }
            }
        },
        {
            "declaredClass":'xcf.manager.DeviceManager',
            "mixin":{
                "prefetch":{
                    "system_devices":%XCF_SYSTEM_DEVICES%,
                    "user_devices":%XCF_USER_DEVICES%
                }
            }
        },
        {
            "declaredClass":'xfile.manager.MountManager',
            "mixin":{
                "prefetch":%XCF_MOUNTS%,
                "singleton":true
            }
        },
        {
            "declaredClass":'xcf.manager.Context',
            "mixin":{
                vfsConfigs:{
                    "Driver" : {
                        roots:%XCF_DRIVER_VFS_CONFIG%
                    },
                    "Device" : {
                        roots:%XCF_DEVICE_VFS_CONFIG%
                    }
                }
            }
        }
    ]
};

var xFileConfig ={
    "LAYOUT_PRESET":1,
    "PANEL_OPTIONS":{
        "ALLOW_COLUMN_RESIZE":true,
        "ALLOW_COLUMN_REORDER":true,
        "ALLOW_COLUMN_HIDE":true,
        "ALLOW_NEW_TABS":true,
        "ALLOW_MULTI_TAB":false,
        "ALLOW_INFO_VIEW":true,
        "ALLOW_LOG_VIEW":true,
        "ALLOW_BREADCRUMBS":false,
        "ALLOW_CONTEXT_MENU":true,
        "ALLOW_LAYOUT_SELECTOR":true,
        "ALLOW_SOURCE_SELECTOR":true
    },
    "ALLOWED_ACTIONS":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"FILE_PANEL_OPTIONS_LEFT":{"LAYOUT":2,"AUTO_OPEN":"true"},"FILE_PANEL_OPTIONS_MAIN":{"LAYOUT":2,"AUTO_OPEN":"true"},"FILE_PANEL_OPTIONS_RIGHT":{"LAYOUT":2,"AUTO_OPEN":"true"}};

var xFileConfig={
    FILES_STORE_URL:"%RPC_URL%",
    FILE_SERVICE:"%RPC_URL%",
    FILE_SERVICE_FULL:"%RPC_URL%",
    FILES_STORE_SERVICE_CLASS:'XCOM_Directory_Service',
    defaultStoreName:'workspace_user',
    RPC_PARAMS:{
        rpcUserField:'user',
        rpcUserValue:'e741198e1842408aa660459240d430a6',
        rpcSignatureField:'sig',
        rpcSignatureToken:'d39f3441e0f0cbe990c520f897bc84d7',
        rpcFixedParams:{}
    }
};
var xappPluginResources=%XAPP_PLUGIN_RESOURCES%;