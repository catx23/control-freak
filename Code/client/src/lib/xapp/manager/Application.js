define([
    "dcl/dcl",
    'dojo/Deferred',
    'xide/types',
    'xide/utils',
    //'dojo/dom-construct',
    "xide/manager/ManagerBase"
], function (dcl, Deferred, types, utils, ManagerBase) {
    var debugBootstrap = false;
    var debugBlocks = false;
    //Application
    var Module = dcl([ManagerBase], {
        declaredClass: "xapp/manager/Application",
        delegate: null,
        settings: null,
        constructor: function (args) {
            utils.mixin(this, args);
            this.id = utils.createUUID();
        },
        runBlox: function (path, id, context, settings) {
            var parts = utils.parse_url(path);
            debugBlocks && console.log('run blox: ' + id + ' with ', settings);
            var bm = this.ctx.getBlockManager();
            bm.load(parts.scheme, parts.host).then(function (scope) {
                var block = scope.getBlockById(id);
                if (block) {
                    block.context = context;
                    if (settings) {
                        block.override = settings;
                    }
                    return block.solve(block.scope);
                } else {
                    debugBlocks && console.error('have no block !');
                }
            }, function (e) {
                debugBlocks && console.error('error loading block files ' + e, e);
            });
        },
        onReloaded: function () {
            console.log('on reloaded', arguments);
        },

        run: function (settings) {
            this.settings = settings;
        },
        loadScript: function (url) {
            /*
            debugger;
            domConstruct.create('script', {
                src:url
            }, query('head')[0]);*/
        },
        publishVariables: function () {

            var deviceManager = this.ctx.getDeviceManager();
            if (deviceManager) {
                var deviceInstances = deviceManager.deviceInstances;
                for (var i in deviceInstances) {
                    var instance = deviceInstances[i];
                    var instanceOptions = instance.options;
                    if (!instanceOptions) {
                        continue;
                    }

                    if (instance.blockScope) {
                        var basicVariables = instance.blockScope.getVariables({
                            group: types.BLOCK_GROUPS.CF_DRIVER_BASIC_VARIABLES
                        });
                        var out = [];
                        for (var i = 0; i < basicVariables.length; i++) {
                            var variable = basicVariables[i];

                            this.publish(types.EVENTS.ON_DRIVER_VARIABLE_CHANGED, {
                                item: variable,
                                scope: instance.blockScope,
                                owner: this,
                                save: false,                         //dont save it
                                source: types.MESSAGE_SOURCE.DEVICE,  //for prioritizing
                                publishMQTT: false
                            });
                        }
                    }
                }
            }
        },
        onReady: function () {
            debugBootstrap && console.log('   Checkpoint 5.3 managers ready');
            this.publish(types.EVENTS.ON_APP_READY, {
                context: this.ctx,
                application: this,
                delegate: this.delegate
            });
        },
        onXBloxReady: function () {
            var _re = require,
                thiz = this;
            debugBootstrap && console.log('   Checkpoint 5.2 xblox component ready');
            _re(['xblox/embedded', 'xblox/manager/BlockManager'], function (embedded, BlockManager) {
                debugBootstrap && console.log('   Checkpoint 5.2 setup xblox');
                //IDE's block manager
                if (thiz.delegate && thiz.delegate.ctx) {

                    var ctx = thiz.delegate.ctx;

                    if (ctx.nodeServiceManager) {
                        thiz.ctx.nodeServiceManager = ctx.nodeServiceManager;
                    }

                    if (ctx.getBlockManager()) {
                        thiz.ctx.blockManager = ctx.getBlockManager();
                    }

                    if (ctx.getDriverManager()) {
                        thiz.ctx.driverManager = ctx.getDriverManager();
                        thiz.ctx.deviceManager = ctx.getDeviceManager();
                    }


                    thiz.onReady();


                } else {
                    var blockManagerInstance = new BlockManager();
                    blockManagerInstance.ctx = thiz.ctx;
                    thiz.ctx.blockManager = blockManagerInstance;
                }
                thiz.onReady();
            });
        },
        /**
         *
         * @param settings {Object}
         * @param settings.delegate {xideve/manager/WidgetManager}
         * @returns {Deferred}
         */
        start: function (settings) {
            this.initReload && this.initReload();
            debugBootstrap && console.log('xapp/Application::start ', settings);
            var def = new Deferred();
            var thiz = this;
            this.delegate = settings.delegate;
            debugBootstrap && console.log('Checkpoint 5 xapp/manager/Application->start, load xblox');
            try {
                this.ctx.pluginManager.loadComponent('xblox').then(function () {
                    debugBootstrap && console.log('   Checkpoint 5.1 xblox component loaded');
                    def.resolve(thiz.ctx);
                    thiz.onXBloxReady();
                }, function (e) {
                    debugBootstrap && console.error('error loading xblox - component ' + e, e);
                });
            } catch (e) {
                console.error('error loading xblox ' + e, e);
                def.reject(e);
            }
            window['xapp'] = this;
            return def;
        }
    });


    Module.getApp = function () {
        return window['xapp'];
    }

    return Module;

});