/** @module xapp/manager/Context */
define([
    "dcl/dcl",
    'xide/manager/ContextBase',
    'xide/manager/PluginManager',
    'xapp/manager/Application',
    'xide/manager/ResourceManager',
    'xide/mixins/EventedMixin',
    'xide/types',
    'xide/utils',
    './_WidgetPickerMixin',
    'xide/manager/Reloadable',
    'xcf/types/Types',
    'xdojo/has',
    'dojo/Deferred'
], function (dcl, ContextBase, PluginManager, Application, ResourceManager, EventedMixin, types, utils, _WidgetPickerMixin, Reloadable, Types, has, Deferred) {
    var isIDE = has('xcf-ui');
    var debugWire = false;
    var debugBoot = false;
    var debugRun = false;
    var Instance = null;
    var NotifierClass = dcl([EventedMixin.dcl], {});
    var Notifier = new NotifierClass({});
    /**
     * Lightweight context for end-user apps
     * @class module:xapp/manager/Context
     * @augments module:xide/mixins/EventedMixin
     * @extends module:xide/manager/ContextBase
     */
    var Module = dcl([ContextBase, Reloadable, _WidgetPickerMixin], {
        declaredClass: "xapp/manager/Context",
        settings: null,
        application: null,
        blockManager: null,
        getUserDirectory: function () {
            var resourceManager = this.getResourceManager(),
                userDir = resourceManager ? resourceManager.getVariable('USER_DIRECTORY') || {} : null;
            return userDir;
        },
        getResourceManager: function () {
            return this.resourceManager;
        },
        getMount: function (mount) {
            var resourceManager = this.getResourceManager();
            var vfsConfig = resourceManager ? resourceManager.getVariable('VFS_CONFIG') || {} : null;
            if (vfsConfig && vfsConfig[mount]) {
                return vfsConfig[mount];
            }
            return null;
        },
        getBlock: function (url) {
            return this.getDeviceManager().getBlock(url);
        },
        getVariable: function (deviceId, driverId, variableId) {
            var deviceManager = ctx.getDeviceManager();
            var device = deviceManager.getDeviceById(deviceId),
                result = null;
            if (!device) {
                return null;
            }
            var driverScope = device.driver;
            //not initiated driver!
            if (driverScope && driverScope.blockScope) {
                driverScope = driverScope.blockScope;
            }

            if (!driverScope) {
                if (device) {
                    var driverId = deviceManager.getMetaValue(device, types.DEVICE_PROPERTY.CF_DEVICE_DRIVER);
                    driverScope = ctx.getBlockManager().getScope(driverId);
                    result = driverScope.getVariableById(driverId + '/' + variableId);
                }
            }
            return result;
        },
        wireNode: function (widget, event, block, params) {
            var thiz = this,
                rejectFunction = null,
                onBeforeRun = null;

            if (!widget['__setup']) {
                widget['__setup'] = {};
            }

            if (widget['__setup'][block.id]) {
                return;
            }
            widget['__setup'][block.id] = true;
            if (params) {
                if (event === types.EVENTS.ON_DRIVER_VARIABLE_CHANGED) {

                    var varParams = params.params;
                    var deviceId = varParams[0],
                        driverId = varParams[1],
                        variableId = varParams[2];

                    var variable = this.getBlock(variableId);
                    rejectFunction = function (evt) {
                        var variable = evt.item;
                        var _variableIn = thiz.getBlock(variableId);
                        if (_variableIn && variable && _variableIn.id === variable.id) {
                            return false;
                        }
                        if (variable.id === variableId) {
                            return false;
                        }
                        return true;
                    };
                    onBeforeRun = function (block, evt) {
                        var variable = evt.item;
                        block.override = {
                            variables: {
                                value: variable.value
                            }
                        };
                    }
                }
            }

            if (!widget) {
                console.error('have no widget for event ' + event);
                return;
            }
            if (!block) {
                console.error('have no block for event ' + event);
                return;
            }

            if (!event) {
                console.error('have no event');
                return;
            }

            if (!_.isString(event)) {
                console.error('event not string ', event);
                return;
            }

            debugWire && console.log('wire node : ' + event);


            /**
             *
             * @param event
             * @param value: original event data
             * @param block
             * @param widget
             */
            var run = function (event, value, block, widget) {

                if (event === 'load' && widget.__didRunLoad) {
                    return;
                }
                if (event === 'load') {
                    widget.__didRunLoad = true;
                }

                if (thiz.delegate && thiz.delegate.isDesignMode && thiz.delegate.isDesignMode()) {
                    return;
                }

                //filter, custom reject function
                if (rejectFunction) {

                    var abort = rejectFunction(value);
                    if (abort) {
                        return;
                    }
                }
                debugRun && console.log('run ! ' + event + ' for block ' + block.name + ':' + block.id);
                if (block._destroyed) {
                    console.error('run failed block invalid, block has been removed');
                    return;
                }

                if (!block.enabled) {
                    return;
                }
                var context = widget,
                    result;
                if (block && context) {
                    block.context = context;
                    block._targetReference = context;
                    if (onBeforeRun) {
                        onBeforeRun(block, value);
                    }
                    result = block.solve(block.scope, {
                        highlight: true,
                        args: [value]
                    });
                    debugWire && console.log('run ' + block.name + ' for even ' + event + ' for ' + this.id, result);
                }
            };

            //patch the target
            if (!widget.subscribe) {
                utils.mixin(widget, EventedMixin.prototype);
            }

            var _target = widget.domNode || widget,
                _event = event,
                _isWidget = widget.declaredClass || widget.startup,
                _hasWidgetCallback = widget.on != null && widget['on' + utils.capitalize(_event)] != null,
                _handle = null,
                _isDelite = _target.render != null && _target.on != null;


            if (_isWidget &&
                //dijit
                (widget.baseClass && widget.baseClass.indexOf('dijitContentPane') != -1)
                //delite
                || widget.render != null || widget.on != null) {
                _isWidget = false;//use on
            }

            if (_target) {
                //plain node
                if (!_isDelite && (!_hasWidgetCallback || !_isWidget)) {
                    if (utils.isSystemEvent(event)) {
                        _handle = widget.subscribe(event, function (evt) {
                            run(event, evt, block, widget);
                        }.bind(this), widget);
                    } else {
                        _handle = widget.__on(_target, event, function (evt) {
                            run(event, evt, block, widget);
                        });
                    }
                } else {
                    _target = widget;
                    var useOn = true;
                    if (useOn) {
                        if (!_isDelite) {
                            var _e = 'on' + utils.capitalize(_event);
                            widget[_e] = function (val, nada) {
                                if (_target.ignore !== true) {
                                    run(event, val);
                                }
                            }
                        } else {
                            if (utils.isSystemEvent(event)) {
                                _handle = _target.subscribe(event, function (evt) {
                                    run(event, evt, block, widget);
                                }.bind(this), widget);
                            }
                            else {
                                if (utils.isNativeEvent(event)) {
                                    event = event.replace('on', '');
                                }
                                _handle = _target.on(event, function (evt) {
                                    var value = evt.target.value;
                                    if ("checked" in evt.target) {
                                        value = evt.target.checked;
                                    }
                                    run(event, value, block, widget);
                                }.bind(this));
                            }
                        }
                    } else {
                        widget['on' + utils.capitalize(_event)] = function (val) {
                            if (_target.ignore !== true) {
                                run(event, val);
                            }
                        }
                    }
                }

                if (_handle) {
                    if (widget.addHandle) {
                        widget.addHandle(event, _handle);
                    }
                    if (!block._widgetHandles) {
                        block._widgetHandles = [];
                    }
                    block._widgetHandles.push(_handle);

                } else {
                    console.error('wire widget: have no handle', widget);
                }
            }
        },
        wireWidget: function (scope, widget, node, event, group, params) {
            var blocks = scope.getBlocks({
                group: group
            });
            debugWire && console.log('wire widget : ' + event + ' for group ' + group, blocks);
            if (!blocks || !blocks.length) {
                debugWire && console.log('have no blocks for group : ' + group);
            }
            for (var j = 0; j < blocks.length; j++) {

                var block = blocks[j];
                debugWire && console.log('activate block : ' + block.name + ' for ' + event, block);
                this.wireNode(widget, event, block, params);
            }
        },
        wireScope: function (scope) {
            debugWire && console.log('wire scope ' + scope.id);
            var allGroups = scope.allGroups(),
                thiz = this,
                delegate = thiz.delegate || {},
                widgets = [];

            var getParams = function (group) {
                var event = null,
                    widgetId = null,
                    parts = group.split('__'),
                    params = [];

                //no element, set to body
                if (parts.length == 1) {
                    event = parts[0];
                    widgetId = 'body';
                    if (isIDE) {
                        var _body = editorContext.rootWidget;
                        _body.domNode.runExpression = editorContext.global.runExpression;
                    }
                }

                if (parts.length == 2) {
                    var blockUrl;
                    //can be: event & block url: onDriverVariableChanged__variable://deviceScope=user_devices&device=bc09b5c4-cfe6-b621-c412-407dbb7bcef8&driver=9db866a4-bb3e-137b-ae23-793b729c44f8&driverScope=user_drivers&block=2219d68b-862f-92ab-de5d-b7a847930a7a
                    //can be: widget id & event: btnCurrentFileName__load
                    if (parts[1].indexOf('://') !== -1) {
                        event = parts[0];
                        widgetId = 'body';
                        blockUrl = parts[1];
                    } else {
                        event = parts[1];
                        widgetId = parts[0];

                    }
                    if (blockUrl) {
                        var url_parts = utils.parse_url(blockUrl);
                        var url_args = utils.urlArgs(url_parts.host);
                        params = [
                            url_args.device.value,
                            url_args.driver.value,
                            blockUrl
                        ]
                    }
                }

                //scripted__onDriverVariableChanged__variable://deviceScope=user_devices&device=bc09b5c4-cfe6-b621-c412-407dbb7bcef8&driver=9db866a4-bb3e-137b-ae23-793b729c44f8&driverScope=user_drivers&block=2219d68b-862f-92ab-de5d-b7a847930a7a
                if (parts.length == 3) {
                    event = parts[1];
                    widgetId = parts[0];
                    var _blockUrl = parts[2];
                    var _url_parts = utils.parse_url(_blockUrl);
                    var _url_args = utils.urlArgs(_url_parts.host);
                    params = [
                        _url_args.device.value,
                        _url_args.driver.value,
                        _blockUrl
                    ]
                }
                if (parts.length == 5) {
                    event = parts[1];
                    widgetId = parts[0];
                    params = [
                        parts[2],
                        parts[3],
                        parts[4]
                    ]

                }

                if (event && widgetId) {
                    var widget = document.getElementById(widgetId);
                    if (!widget && widgetId === 'body') {
                        widget = document.body;
                    }
                    return {
                        event: event,
                        widgetId: widgetId,
                        widget: widget,
                        params: params
                    }
                }

                return null;
            };

            var wireBlock = function (block) {
                block._on(types.EVENTS.ON_ITEM_REMOVED, function (evt) {
                    try {
                        //console.log('on block removed', evt.item);
                        if (block._widgetHandles) {
                            var _handles = block._widgetHandles;
                            for (var i = 0; i < _handles.length; i++) {
                                if (_handles[i].remove) {
                                    _handles[i].remove();
                                }
                            }
                            delete block._widgetHandles;

                        }
                    } catch (e) {
                        console.error('troubble!' + e, e);
                    }
                }, this);
            };
            for (var i = 0; i < allGroups.length; i++) {
                var group = allGroups[i];
                var params = getParams(group);
                if (params && params.widget) {
                    this.wireWidget(scope, params.widget, params.widget.domNode || params.widget, params.event, group, params);
                } else {
                    console.error('cant resolve group ' + group);
                }
                var blocks = scope.getBlocks({
                    group: group
                });
                if (!blocks || !blocks.length) {
                    debugWire && console.warn('have no blocks for group : ' + group);
                }
                if (isIDE) {
                    for (var j = 0; j < blocks.length; j++) {
                        var block = blocks[j];
                        wireBlock(block);
                    }
                }
                params.widget && widgets.indexOf(params.widget) == -1 && widgets.push(params.widget);
            }

            for (var i = 0; i < widgets.length; i++) {
                var widget = widgets[i];
                if (widget.__didEmitLoad) {
                    return;
                }
                debugBoot && console.log('emit load', widget);
                widget.__didEmitLoad = true;
                if (widget.nodeName === 'BODY') {
                    $(widget.nodeName).trigger('load');
                } else {
                    if (widget.emit) {
                        try {
                            widget.emit('load', widget);
                        } catch (e) {
                            console.error('firing load', e);
                        }
                    }
                }
            }

            isIDE && scope._on(types.EVENTS.ON_ITEM_ADDED, function (evt) {
                var params = getParams(evt.item.group);
                if (params && params.widget) {
                    debugWire && console.log('on item added', arguments);
                    var item = evt.item;
                    var editorContext = delegate.getEditorContext ? delegate.getEditorContext() : null;
                    var widget = params.widget.domNode || params.widget;
                    thiz.wireNode(widget, params.event, evt.item, editorContext, params);
                    wireBlock(evt.item);
                }
            });

        },
        onBlockFilesLoaded: function (scopes) {
            if (this.isVE()) {
                return;
            }
            debugBoot && console.log('xapp:onSceneBlocksLoaded, wire scope!', scopes);
            for (var i = 0; i < scopes.length; i++) {
                var scope = scopes[i];
                try {

                    this.wireScope(scope);
                } catch (e) {
                    logError(e, 'onBlockFilesLoaded')
                }
            }
        },
        loadXBloxFiles: function (files) {
            var thiz = this;
            function loadXBLOXFiles() {
                thiz.getBlockManager().loadFiles(files).then(function (scopes) {
                    debugBoot && console.log('   Checkpoint 8.1. xapp/manager/context->xblox files loaded');
                    thiz.onBlockFilesLoaded(scopes);
                })
            }

            files = [];
            if (files.length == 0) {
                var item = this.settings.item;
                if (item) {
                    var mount = utils.replaceAll('/', '', item.mount);
                    var extension = utils.getFileExtension(item.path);
                    var path = item.path.replace('.' + extension, '.xblox');
                    var sceneBloxItem = {
                        mount: mount,
                        path: path
                    };
                    files.push(sceneBloxItem);

                    var content = {
                        "blocks": [],
                        "variables": []
                    };
                    var fileManager = this.getFileManager();
                    if (fileManager.serviceObject) {
                        this.getFileManager().mkfile(mount, path, JSON.stringify(content, null, 2)).then(function () {
                            loadXBLOXFiles();
                        });
                    } else {
                        loadXBLOXFiles();
                    }
                }
            }
        },
        _appModule: null,
        loadAppModule: function (item) {
            if (this._appModule) {
                //return _appModule;
            }
            var dfd = new Deferred();
            if (!item) {
                dfd.resolve();
                return dfd;
            }
            var itemUrl = item.path.replace('./', '').replace('.dhtml', '');
            var mid = item.mount.replace('/', '') + '/' + itemUrl;
            var _require = require;
            mid = mid.split(' ').join('%20');

            var url = _require.toUrl(item.mount.replace('/', '') + '/' + itemUrl);
            debugBoot && console.log('load default app.js ' + mid);
            try {
                _require.undef && _require.undef(mid);
            } catch (e) {
                console.warn('error unloading app module ' + mid, e);
            }
            try {
                //probe
                _require([mid], function (appModule) {
                    dfd.resolve(appModule);
                    _require.config({
                        urlArgs: null
                    });
                });
            } catch (e) {
                console.error('error loading module ', e);
                dfd.resolve();
            }
            this._appModule = dfd;

            return dfd;
        },
        /**
         * Called when all managers and minimum dependencies are loaded.
         *
         * At this point we're load our xblox files and fire them!
         *
         *
         */
        onReady: function (settings) {
            debugBoot && console.log('Checkpoint 8. xapp/manager->onReady');
            if (settings) {
                this.settings = settings;
            } else {
                settings = this.settings;
            }

            var xbloxFiles = this.settings.xbloxScripts || [];
            if (xbloxFiles.length === 0 && settings.item) {
                xbloxFiles.push({
                    path: settings.item.path.replace('.dhtml', '.xblox').replace('.html', '.xblox'),
                    mount: settings.item.mount
                });
            }

            this.loadXBloxFiles(xbloxFiles);
            var thiz = this;
            debugBoot && console.info('-app ready', this);
            if (!this.isVE()) {
                this.loadAppModule(settings.item).then(function () {
                    thiz.application.onReady();
                    console.log('app module loaded from ');
                    setTimeout(function () {
                        thiz.publish('onContextReady', thiz);
                        thiz.publish('DevicesConnected');
                    }, 1500);
                });
            } else {
                this.application.onReady();
                this.application.publishVariables();
            }
            /*
            this.loadAppModule(settings.item).then(function(){
                console.log('app module loaded from ');
                setTimeout(function(){
                    thiz.publish('onContextReady',thiz);
                    thiz.publish('DevicesConnected');
                },1500);
            });
            */
            //this.application.onReady();
        },
        isVE: function () {
            return this.delegate;
        },
        init: function (settings) {
            this.settings = settings;
            if (settings && settings.mixins) {
                this.doMixins(settings.mixins);
            }
            debugBoot && console.log('Checkpoint 7. xapp/manager->init(settings)', settings);
            var thiz = this;
            this.subscribe(types.EVENTS.ON_DEVICE_DRIVER_INSTANCE_READY, function (evt) {
                if (thiz._timer) {
                    clearTimeout(thiz._timer);
                    delete thiz._timer;
                }
                var instance = evt.instance;
                if (!instance) {
                    return;
                }
                if (thiz['__instance_variables_' + instance.id]) {
                    //return;
                }
                thiz['__instance_variables_' + instance.id] = true;
                thiz.timer = setTimeout(function () {
                    thiz.publish(types.EVENTS.ON_APP_READY, {
                        context: thiz
                    });
                    thiz.application.publishVariables();
                }, 10);

            });
            
            if (has('debug')) {
                this.loadXIDE();
            }


            function ready() {
                require([
                    'xfile/manager/FileManager',
                    'xide/manager/ResourceManager',
                    'xnode/manager/NodeServiceManager',
                    'xcf/manager/DriverManager',
                    'xcf/manager/DeviceManager',
                    'xcf/manager/BlockManager',
                    'xcf/model/ModelBase',
                    'xcf/model/Command',
                    'xcf/model/Variable',
                    'xcf/factory/Blocks'
                ], function (FileManager, ResourceManager, NodeServiceManager, DriverManager, DeviceManager, BlockManager) {

                    debugBoot && console.log('Checkpoint 7.0 xapp/Context::init');
                    thiz.doMixins(thiz.mixins);
                    thiz.blockManager = thiz.createManager(BlockManager);
                    thiz.blockManager.init();
                    thiz.fileManager = thiz.createManager(FileManager, settings.xFileConfig, {
                        serviceUrl: settings.rpcUrl,
                        singleton: true
                    });
                    thiz.fileManager.init();
                    thiz.resourceManager = thiz.createManager(ResourceManager, settings.xFileConfig, {
                        serviceUrl: settings.rpcUrl,
                        singleton: true
                    });
                    thiz.driverManager = thiz.createManager(DriverManager, null, {
                        serviceUrl: settings.rpcUrl,
                        singleton: true
                    }
                    );
                    thiz.driverManager.init();

                    try {
                        thiz.driverManager.ls('system_drivers').then(function () {
                            thiz.driverManager.ls('user_drivers').then(function () {
                                debugBoot && console.log('Checkpoint 7.1 drivers loaded');

                                thiz.deviceManager = thiz.createManager(DeviceManager, null, {
                                    serviceUrl: settings.rpcUrl,
                                    singleton: true
                                }
                                );
                                thiz.deviceManager.init();
                                thiz.deviceManager.ls('system_devices').then(function () {
                                    thiz.deviceManager.ls('user_devices').then(function () {
                                        debugBoot && console.log('Checkpoint 7.1.1 devices loaded');
                                        thiz.onReady();
                                    });

                                });


                                thiz.resourceManager.init();
                                var nodeServices = settings.NODE_SERVICES;
                                if (nodeServices) {
                                    var url = location.href;
                                    var parts = utils.parse_url(url);
                                    nodeServices[0].host = parts.host;
                                    if (nodeServices[0].info) {
                                        nodeServices[0].info.host = 'http://' + parts.host;
                                    }
                                }

                                thiz.nodeServiceManager = thiz.createManager(NodeServiceManager, null, {
                                    serviceUrl: settings.rpcUrl,
                                    singleton: true,
                                    services: settings.NODE_SERVICES
                                });
                                thiz.nodeServiceManager.init();
                            });
                        });
                        Notifier.publish('onContextReady', thiz);
                    } catch (e) {
                        logError(e);
                    }
                });
            }

            if (!this.isVE()) {
                this.loadAppModule(settings.item).then(function () {
                    ready();
                })
            } else {
                ready();
            }

        },
        mergeFunctions: function (target, source) {
            for (var i in source) {
                var o = source[i];
                if (_.isFunction(source[i])) {
                    debugBoot && console.log('override ' + i);
                    target[i] = o;
                }
            }
        },
        onModuleUpdated: function (evt) {
            var _obj = dojo.getObject(evt.moduleClass);
            if (_obj && _obj.prototype) {
                this.mergeFunctions(_obj.prototype, evt.moduleProto);
            }
        },
        getApplication: function () {
            return this.application;
        },
        getBlockManager: function () {
            return this.blockManager;
        },
        getFileManager: function () {
            return this.fileManager;
        },
        getDriverManager: function () {
            return this.driverManager;
        },
        /**
         *
         * @returns {module:xcf.manager.DeviceManager}
         */
        getDeviceManager: function () {
            return this.deviceManager;
        },
        getNodeServiceManager: function () {
            return this.nodeServiceManager;
        },
        initManagers: function () {
            this.pluginManager.init();
            this.application.init();
        },
        constructManagers: function (settings) {

            this.pluginManager = this.createManager(PluginManager);
            this.application = this.createManager(Application);
            Instance = this;
            var self = this;
            if (settings) {
                this.settings = settings;
                if (settings.delegate) {
                    this.delegate = settings.delegate;
                }
            }
            if (this.isVE() && settings.item) {
                this.loadAppModule(settings.item);
            }

        },
        initVe: function () {
            this.notifier = Notifier;
        }
    });

    Module.getInstance = function () {
        return Instance;
    }
    Module.notifier = Notifier;
    return Module;

});