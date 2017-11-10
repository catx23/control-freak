define(['dojo/has', 'require', 'xide/Features'], function (has, require, Features) {

    window.xcfConfig={
        serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
        mixins:[
            {
                declaredClass:'xide.manager.ServerActionBase',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'xide.manager.SettingsManager',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'xide.manager.ResourceManager',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true,
                    resourceVariables:{
                        "XASWEB": "http:\/\/127.0.0.1\/projects\/x4mm\/Code\/client\/src",
                        "APP_URL": "http:\/\/127.0.0.1\/projects\/x4mm\/Code\/client\/src",
                        "SITEURL": "http:\/\/127.0.0.1\/projects\/x4mm\/Code\/xapp\/xcf\/",
                        "RPC_URL_SUFFIX": "",
                        "ROOT_URL_OFFSET": "",
                        "THEME": "blue",
                        "XCOM_PLUGINS_WEB_URL": "http:\/\/127.0.0.1\/projects\/x4mm\/Code\/xapp\/commander\/plugins\/",
                        "XAPP_PLUGIN_RESOURCES": [
                        ],
                        "DOJOPACKAGES": "[{name:'system_drivers',location:'http:\/\/127.0.0.1\/projects\/x4mm\/data\/system\/drivers\/'},{name:'ImageEdit',location:'http:\/\/127.0.0.1\/projects\/x4mm\/Code\/xapp\/commander\/plugins\/ImageEdit\/client\/'},{name:'Markdown',location:'http:\/\/127.0.0.1\/projects\/x4mm\/Code\/xapp\/commander\/plugins\/Markdown\/client\/'}]",
                        "XCF_DRIVER_VFS_CONFIG": "{\"System\":{\"name\":\"System\",\"mount\":\"root\"}}",
                        "XCF_DEVICE_VFS_CONFIG": "{\"System\":{\"name\":\"System\",\"mount\":\"root\"}}",
                        "COMPONENTS": "{\n\t\"xfile\": true,\n\t\"xnode\": true,\n\t\"xideve\": {\n\t\t\"cmdOffset\": \"..\\\/xide\\\/\"\n\t},\n\t\"xblox\": true\n}",
                        "PACKAGE_CONFIG": "run-release",
                        "HTML_HEADER": [
                        ],
                        "BODY_RESOURCES": "\u003Cscript type='text\/javascript' src='http:\/\/127.0.0.1\/projects\/x4mm\/Code\/client\/src\/xcf\/ext\/jquery.jspanel-compiled.js'\u003E\u003C\/script\u003E\n",
                        "RPC_TARGET": ".\/index.php?view=rpc",
                        "RPC_URL": "http:\/\/127.0.0.1\/projects\/x4mm\/Code\/xapp\/xcf\/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true",
                        "VFS_CONFIG": {
                            "docs": "\/PMaster\/projects\/x4mm\/docs\/docFiles",
                            "system_drivers": "\/PMaster\/projects\/x4mm\/data\/system\/drivers",
                            "user_drivers": "\/PMaster\/projects\/x4mm\/data\/\/user\/driver\/",
                            "system_devices": "\/PMaster\/projects\/x4mm\/data\/\/system\/devices",
                            "system_protocols": "\/PMaster\/projects\/x4mm\/data\/\/system\/protocols\/",
                            "master": "\/PMaster\/projects\/x4mm\/",
                            "javascript": "\/PMaster\/projects\/x4mm\/Code\/client\/src\/lib\/",
                            "php": "\/PMaster\/projects\/x4mm\/Code\/xapp\/",
                            "cfjs": "\/PMaster\/projects\/x4mm\/Code\/client\/src\/lib\/xcf",
                            "xidejs": "\/PMaster\/projects\/x4mm\/Code\/client\/src\/lib\/xide",
                            "workspace": "\/PMaster\/projects\/x4mm\/data\/workspace\/",
                            "logs": "\/PMaster\/projects\/x4mm\/server\/nodejs\/logs",
                            "root": "\/PMaster\/projects\/x4mm\/data\/workspace\/"
                        }
                    }
                }
            },
            {
                declaredClass:'xfile.manager.FileManager',
                mixin:{
                    serviceClass:'XCOM_Directory_Service',
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'davinci.model.resource.Resource',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'xnode.manager.NodeServiceManager',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'davinci.model.resource.File',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'davinci.model.resource.File',
                mixin:{
                    serviceUrl:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
                    singleton:true
                }
            },
            {
                declaredClass:'xcf.manager.Context',
                mixin:{
                    vfsConfigs:{
                        'Driver' : {
                            roots:{"System":{"name":"System","mount":"root"}}
                        },
                        'Device' : {
                            roots:{"System":{"name":"System","mount":"root"}}
                        }
                    }
                }
            }
        ]
    };
    window.xFileConfigMixin ={"LAYOUT_PRESET":1,"PANEL_OPTIONS":{
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
    },"ALLOWED_ACTIONS":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"FILE_PANEL_OPTIONS_LEFT":{"LAYOUT":2,"AUTO_OPEN":"true"},"FILE_PANEL_OPTIONS_MAIN":{"LAYOUT":2,"AUTO_OPEN":"true"},"FILE_PANEL_OPTIONS_RIGHT":{"LAYOUT":2,"AUTO_OPEN":"true"}};
    window.xFileConfig={
        FILES_STORE_URL:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
        FILE_SERVICE:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
        FILE_SERVICE_FULL:'http://127.0.0.1/projects/x4mm/Code/xapp/xcf/index.php?view=rpc&theme=blue&debug=false&run=run-release&protocols=false&xideve=true&plugins=false&xblox=true&files=true',
        FILES_STORE_SERVICE_CLASS:'XCOM_Directory_Service',
        defaultStoreName:'workspace',
        RPC_PARAMS:{
            rpcUserField:'user',
            rpcUserValue:'e741198e1842408aa660459240d430a6',
            rpcSignatureField:'sig',
            rpcSignatureToken:'d39f3441e0f0cbe990c520f897bc84d7',
            rpcFixedParams:{}
        }
    };
    window.xappPluginResources=[
        {
            "class": "cmx.types.Resource",
            "enabled": true,
            "name": "ImageEdit",
            "path": "ImageEdit\/xfile\/main",
            "type": "JS-PLUGIN",
            "url": "",
            "urlOri": "",
            "packageSuffix": ""
        },
        {
            "class": "cmx.types.Resource",
            "enabled": true,
            "name": "Markdown",
            "path": "Markdown\/main",
            "type": "JS-PLUGIN",
            "url": "",
            "urlOri": "",
            "packageSuffix": "xfile-release"
        }
    ];


    //--collect electron
    has.add("electron", function () { return window['getElectronWindow']});

    //--root selector node
    var ROOT_DIV = '#root';

    //-- back compat config, inserted in header as global
    var _xcfConfig = xcfConfig;

    var _driverData={
        "items": [
            {
                "name": "Examples",
                "isDir": true,
                "path": "Examples",
                "parentId": "",
                "children": [
                    {
                        "_reference": "Examples/Variables.meta.json"
                    }
                ],
                "beanType": "DRIVER_GROUP",
                "scope": "system_drivers"
            },
            {
                "name": "Default",
                "isDir": false,
                "path": "Default.meta.json",
                "blox": null,
                "user": {
                    "inputs": [
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_NAME",
                            "name": "CF_DRIVER_NAME",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Display Name",
                            "type": 13,
                            "uid": "-1",
                            "value": "Default",
                            "visible": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_ID",
                            "name": "CF_DRIVER_ID",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Id",
                            "type": 13,
                            "uid": "-1",
                            "value": "235eb680-cb87-11e3-9c1a-0800200c9a61",
                            "visible": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Visual",
                            "id": "CF_DRIVER_ICON",
                            "name": "CF_DRIVER_ICON",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Driver Icon",
                            "type": 18,
                            "uid": "-1",
                            "value": "./project1/318i.jpg",
                            "visible": false
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_CLASS",
                            "name": "CF_DRIVER_CLASS",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Driver Class",
                            "type": 4,
                            "uid": "-1",
                            "value": "./DriverBase.js",
                            "visible": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Settings",
                            "id": "CommandSettings",
                            "name": "CF_DRIVER_COMMANDS",
                            "order": 1,
                            "params": "{\"constants\":{\"start\":\"\",\"end\":\"\"},\"send\":{\"mode\":false,\"interval\":\"300\",\"timeout\":\"500\",\"onReply\":\"\"}}",
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Commands",
                            "type": "CommandSettings",
                            "uid": "-1",
                            "value": "[]",
                            "visible": true,
                            "view": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Variables",
                            "id": "VariableSettings",
                            "name": "CF_DRIVER_VARIABLES",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Variables",
                            "type": 13,
                            "uid": "-1",
                            "value": "[]",
                            "visible": false,
                            "view": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Responses",
                            "id": "ResponseSettings",
                            "name": "CF_DRIVER_RESPONSES",
                            "order": 1,
                            "params": "{\"start\":false,\"startString\":\"\",\"cTypeByte\":false,\"cTypePacket\":false,\"cTypeDelimiter\":true,\"cTypeCount\":false,\"delimiter\":\"\\\\r\",\"count\":\"\",\"wDelimiter\":\"\\\\r\",\"wCount\":\"\"}",
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Responses",
                            "type": 13,
                            "uid": "-1",
                            "value": "[]",
                            "visible": false,
                            "view": true
                        }
                    ]
                },
                "id": "235eb680-cb87-11e3-9c1a-0800200c9a61",
                "parentId": "drivers",
                "scope": "system_drivers"
            },
            {
                "name": "Variables",
                "isDir": false,
                "path": "Examples/Variables.meta.json",
                "blox": {
                    "blocks": [
                        {
                            "_containsChildrenIds": [],
                            "name": "Volume",
                            "group": "basicVariables",
                            "id": "9f62018d-6f2e-dcf2-4604-658c5dfa34f3",
                            "declaredClass": "xcf.model.Variable",
                            "gui": "off",
                            "cmd": "off",
                            "save": false,
                            "target": "None",
                            "value": "6",
                            "register": true,
                            "readOnly": false,
                            "isCommand": false,
                            "enabled": true,
                            "shareTitle": "",
                            "allowActionOverride": true,
                            "description": "No Description",
                            "canDelete": true,
                            "order": 0,
                            "type": "added",
                            "icon": "fa-play"
                        },
                        {
                            "_containsChildrenIds": [
                                "items"
                            ],
                            "group": "init",
                            "id": "3fd4496c-c4f0-7393-81cd-4e6c16b9ecbb",
                            "items": [
                                "4f3b295d-0883-7181-bfe3-80d9aae73eb3"
                            ],
                            "reference": "",
                            "declaredClass": "xblox.model.events.OnEvent",
                            "name": "On Event",
                            "event": "onDriverVariableChanged",
                            "filterPath": "item.name",
                            "filterValue": "Volume",
                            "valuePath": "item.value",
                            "isCommand": false,
                            "enabled": true,
                            "shareTitle": "",
                            "allowActionOverride": true,
                            "description": "No Description",
                            "canDelete": true,
                            "order": 0,
                            "type": "added",
                            "icon": "fa-play"
                        },
                        {
                            "_containsChildrenIds": [],
                            "parentId": "3fd4496c-c4f0-7393-81cd-4e6c16b9ecbb",
                            "id": "4f3b295d-0883-7181-bfe3-80d9aae73eb3",
                            "declaredClass": "xblox.model.code.RunScript",
                            "name": "Run Script",
                            "method": "console.log(\"On Variable Volume Changed \" + arguments[0]);",
                            "args": "",
                            "deferred": false,
                            "icon": "fa-code",
                            "isCommand": false,
                            "enabled": true,
                            "shareTitle": "",
                            "allowActionOverride": true,
                            "canDelete": true,
                            "order": 0,
                            "type": "added"
                        }
                    ],
                    "variables": null
                },
                "user": {
                    "inputs": [
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_NAME",
                            "name": "CF_DRIVER_NAME",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Display Name",
                            "type": 13,
                            "uid": "-1",
                            "value": "Variables",
                            "visible": true,
                            "changed": true,
                            "_active": false
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_ID",
                            "name": "CF_DRIVER_ID",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Id",
                            "type": 13,
                            "uid": "-1",
                            "value": "5d83e82f-954f-eba7-cb58-7316d8dc3cf3",
                            "visible": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Visual",
                            "id": "CF_DRIVER_ICON",
                            "name": "CF_DRIVER_ICON",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Driver Icon",
                            "type": 18,
                            "uid": "-1",
                            "value": "./project1/318i.jpg",
                            "visible": false
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "General",
                            "id": "CF_DRIVER_CLASS",
                            "name": "CF_DRIVER_CLASS",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Driver Class",
                            "type": 4,
                            "uid": "-1",
                            "value": "./Examples/Variables.js",
                            "visible": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Settings",
                            "id": "CommandSettings",
                            "name": "CF_DRIVER_COMMANDS",
                            "order": 1,
                            "params": "{\"constants\":{\"start\":\"\",\"end\":\"\"},\"send\":{\"mode\":false,\"interval\":\"300\",\"timeout\":\"500\",\"onReply\":\"\"}}",
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Commands",
                            "type": "CommandSettings",
                            "uid": "-1",
                            "value": "",
                            "visible": true,
                            "view": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Variables",
                            "id": "VariableSettings",
                            "name": "CF_DRIVER_VARIABLES",
                            "order": 1,
                            "params": null,
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Variables",
                            "type": 13,
                            "uid": "-1",
                            "value": "[]",
                            "visible": false,
                            "view": true
                        },
                        {
                            "chainType": 0,
                            "class": "cmx.types.ConfigurableInformation",
                            "dataRef": "",
                            "dataSource": "",
                            "description": null,
                            "enabled": true,
                            "enumType": "-1",
                            "flags": -1,
                            "group": "Responses",
                            "id": "ResponseSettings",
                            "name": "CF_DRIVER_RESPONSES",
                            "order": 1,
                            "params": "{\"start\":false,\"startString\":\"\",\"cTypeByte\":false,\"cTypePacket\":false,\"cTypeDelimiter\":true,\"cTypeCount\":false,\"delimiter\":\"\\\\r\",\"count\":\"\",\"wDelimiter\":\"\\\\r\",\"wCount\":\"\"}",
                            "parentId": "myeventsapp108",
                            "platform": null,
                            "storeDestination": "metaDataStore",
                            "title": "Responses",
                            "type": 13,
                            "uid": "-1",
                            "value": "",
                            "visible": false,
                            "view": true
                        }
                    ]
                },
                "id": "5d83e82f-954f-eba7-cb58-7316d8dc3cf3",
                "parentId": "Examples",
                "scope": "system_drivers"
            }
        ],
        "identifier": "path",
        "label": "name"
    }
    var _deviceData = {
        "items": [
            {
                "name": "Raspberry",
                "isDir": true,
                "path": "Raspberry",
                "type": "leaf",
                "parentId": "",
                "children": [
                    {
                        "_reference": "Raspberry/Raspberry-One.meta.json"
                    }
                ],
                "scope": "system_devices"
            },
            {
                "name": "Raspberry-One",
                "isDir": false,
                "path": "Raspberry/Raspberry-One.meta.json",
                "type": "node",
                "id": "7da7b6a8-8ec1-4f2e-c10a-c414edb34adb",
                "user": {
                    "inputs": [
                        {
                            "dataRef": null,
                            "description": "Title",
                            "enabled": true,
                            "flags": -1,
                            "group": "Common",
                            "id": "Title",
                            "name": "Title",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Title",
                            "type": 13,
                            "uid": -1,
                            "value": "Raspberry-One",
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Host",
                            "enabled": true,
                            "flags": -1,
                            "group": "Network",
                            "id": "Host",
                            "name": "Host",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Host",
                            "type": 13,
                            "uid": -1,
                            "value": "192.168.1.36",
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Enabled",
                            "enabled": true,
                            "flags": -1,
                            "group": "Common",
                            "id": "Enabled",
                            "name": "Enabled",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Enabled",
                            "type": 0,
                            "uid": -1,
                            "value": true,
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Driver",
                            "enabled": true,
                            "flags": -1,
                            "group": "Common",
                            "id": "Driver",
                            "name": "Driver",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Driver",
                            "type": 3,
                            "uid": -1,
                            "value": "235eb680-cb87-11e3-9c1a-0800200c9a61",
                            "visible": true,
                            "enumType": "Driver"
                        },
                        {
                            "dataRef": null,
                            "description": "Protocol",
                            "enabled": true,
                            "flags": -1,
                            "group": "Network",
                            "id": "Protocol",
                            "name": "Protocol",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Protocol",
                            "type": 3,
                            "uid": -1,
                            "value": "ssh",
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Port",
                            "enabled": true,
                            "flags": -1,
                            "group": "Network",
                            "id": "Port",
                            "name": "Port",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Port",
                            "type": 13,
                            "uid": -1,
                            "value": "22",
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Id",
                            "enabled": true,
                            "flags": -1,
                            "group": "Common",
                            "id": "Id",
                            "name": "Id",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Id",
                            "type": 13,
                            "uid": -1,
                            "value": "7da7b6a8-8ec1-4f2e-c10a-c414edb34adb",
                            "visible": false,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "Options",
                            "enabled": true,
                            "flags": -1,
                            "group": "Network",
                            "id": "Options",
                            "name": "Options",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Options",
                            "type": 28,
                            "uid": -1,
                            "value": "{\"username\":\"pi\",\"password\":\"asdasd\",\"html\":true}",
                            "visible": true,
                            "enumType": "-1"
                        },
                        {
                            "dataRef": null,
                            "description": "",
                            "enabled": true,
                            "flags": -1,
                            "group": -1,
                            "id": "DriverOptions",
                            "name": "DriverOptions",
                            "order": -1,
                            "params": null,
                            "parentId": -1,
                            "platform": null,
                            "storeDestination": null,
                            "title": "Driver Options",
                            "type": 5,
                            "uid": -1,
                            "value": 0,
                            "visible": true
                        }
                    ]
                },
                "parentId": "Raspberry",
                "scope": "system_devices"
            }
        ],
        "identifier": "path",
        "label": "name"
    };

    function initDrivers(types,data){

        var scope = "system_drivers";
        var store = this.initStore(data,scope);
        this.store = store;
        this.stores[scope] = store;
        this.onStoreReady(store);
        this.publish(types.EVENTS.ON_STORE_CREATED, {
            data: data,
            owner: this,
            store: store,
            type: this.itemType
        });
    }

    //--make flags as has & collect for ux-actions
    var APP_FEATURES = [
        'drivers',  //needed to do anything with drivers or devices
        'devices',  //hide device view
        'protocols',//enabled protocol actions and ux
        //'xblox',    //toggle explicit xblox
        'plugins',  //mime editors
        'xideve',   //visuald editor
        'drivers-ui',//driver interface
        'force-electron',//emulated box release
        'debug' // simulate release (for checking left to kill d messages)

    ];

    has.add('fiddle',function(){
        return true;
    })
    _.each(APP_FEATURES,function(feature){
        has.add(feature, function () { return false});
    });
    /**
     * @TODO forward
     * @param e
     * @param text
     */
    function mkError(e,text){typeof logError !=='undefined' && logError(e,text);}

    function load() {
        return require([
            'xdojo/declare',
            'xcf/types',
            'wcDocker/wcDocker',
            'xaction/xaction',
            'xblox/xblox',
            'xace/xace',
            'xwire/xwire',
            'xfile/xfile',
            'dgrid/dgrid',
            'xdocker/xdocker',
            'xgrid/xgrid',
            'xlog/xlog',
            'xnode/xnode',
            'xlang/i18',
            'xide/utils/StringUtils',
            'xide/types/Types',
            'xide/Lang',
            "xtest/DriverBase"

        ], function (declare,  cvTypes,_wcDocker,xaction,_xblox,_xace, _xwire, _xfile,dgrid, _xdocker, _xgrid, _xlog, _xnode, i18, StringUtils,Types,Lang,DriverBase) {

            function loadMain() {
                require([
                    'xide/debug',
                    'xide/types/Types',
                    'xcf/types/Types',
                    'xtest/Widgets',
                    'xtest/Managers',
                    'xtest/Views',
                    'xtest/XCFCommons',
                    'xtest/GUIALL',
                    'dojo/_base/lang',
                    "xide/manager/Context",
                    "xide/views/_MainView",
                    'xide/utils',
                    "xide/types",
                    "xide/manager/ResourceManager",
                    "xblox/manager/BlockManager",
                    "xcf/manager/DeviceManager",
                    "xcf/manager/DriverManager",
                    "xide/mixins/EventedMixin",
                    "xide/mixins/ReloadMixin",
                    "dcl/dcl",
                    "xide/manager/WindowManager",
                    "xlog/manager/LogManager",
                    "xide/manager/SettingsManager",
                    'xide/encoding/MD5',
                    'xide/editor/Default',
                    'xace/views/Editor',
                    'xide/views/ACEEditor',
                    'dojo/domReady!'
                ], function (debug, Types, XCTypes, Widgets, Managers, Views, XCFCommons,GUIALL, lang,
                             Context,_MainView,utils,types,ResourceManager,BlockManager,DeviceManager,DriverManager,EventedMixin,ReloadMixin,dcl,WindowManager,LogManager,SettingsManager,MD5,Default,Editor,ACEEditor) {



                    $('#loadingWrapper').remove();

                    var ctx = new Context(xcfConfig,null);
                    ctx.prepare();
                    ctx.getUserDirectory = function(){
                        return "";
                    };

                    ctx.blockManager = new BlockManager({
                        ctx:ctx
                    });

                    ctx.resourceManager = ctx.createManager(ResourceManager);
                    ctx.resourceManager.init();


                    ctx.deviceManager = ctx.createManager(DeviceManager);
                    ctx.driverManager = ctx.createManager(DriverManager);
                    ctx.windowManager = ctx.createManager(WindowManager);
                    ctx.logManager = ctx.createManager(LogManager);
                    ctx.settingsManager = ctx.createManager(SettingsManager);


                    ctx.deviceManager.init();
                    ctx.driverManager.init();



                    ctx.getDriverManager=function(){
                        return this.driverManager;
                    };
                    ctx.getDeviceManager =function(){
                        return this.deviceManager;
                    };


                    window['sctx'] = ctx;
                    var container = $('#root')[0];
                    var view = utils.addWidget(_MainView, {
                        ctx: ctx,
                        permissions: [],
                        config: xcfConfig,
                        container: container

                    }, null, container, true);

                    ctx.mainView = view;


                    //console.error('-ready main');
                    initDrivers.apply(ctx.driverManager,[types,_driverData]);
                    ctx.deviceManager.initStore(_deviceData,"system_devices");

                    var device  = ctx.deviceManager.getItemById("7da7b6a8-8ec1-4f2e-c10a-c414edb34adb");
                    var driver = ctx.driverManager.getItemById("235eb680-cb87-11e3-9c1a-0800200c9a61");


                    var deviceInfo = ctx.deviceManager.toDeviceControlInfo(device);
                    deviceInfo['clientSide'] = true;

                    var hash = MD5(JSON.stringify(deviceInfo), 1);
                    ctx.deviceManager.deviceInstances={};
                    ctx.deviceManager.deviceInstances[hash] = {
                        driver:driver,
                        options:deviceInfo

                    };

                    Default.Implementation.ctx = ctx;
                    Default.ctx = ctx;

                    Editor.ctx = ctx;
                    Editor.prototype.ctx = ctx;

                    ACEEditor.ctx = ctx;
                    ACEEditor.prototype.ctx = ctx;

                    var USER_DRIVER = window.MY_DRIVER  || {};
                    var baseClass = DriverBase,
                        driverProto = dcl([baseClass, EventedMixin.dcl,ReloadMixin.dcl], USER_DRIVER),
                        driverInstance = new driverProto();

                    driverInstance.declaredClass = "UserDriver";
                    driverInstance.options = {};
                    driverInstance.delegate = ctx.deviceManager;
                    driverInstance.driver = driver;
                    driverInstance.serverSide = false;
                    driverInstance.device = device;
                    try {

                        driverInstance.start();
                        driverInstance.initReload();
                    }catch(e){

                    }



                    try {
                        ready(require,ctx,view,driver,driverInstance,device);
                    } catch (e) {
                        mkError(e, 'error in main');
                    }
                });
            }
            loadMain();
        });
    }

    load();

    var Module = {};
    return Module;
});

