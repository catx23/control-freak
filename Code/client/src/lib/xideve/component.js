define([
    "dcl/dcl",
    "xide/model/Component",
    "xide/utils",
    "dojo/has",
    "require",
    "xideve/delite/Template",
    "dojo/Deferred",
    "xaction/ActionProvider"
], function (dcl, Component, utils, has, require, deliteTemplate, Deferred, ActionProvider) {
    /**
     * @class xideve.component
     * @extends module:xide/model/Component
     */
    return dcl([Component, ActionProvider.dcl], {
        cmdOffset: '',
        userBaseUrl: '',
        /**
         * @member ctx {module:xide/manager/Context}
         */
        ctx: null,
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Implement base interface
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        getDependencies: function () {
            if (has('xideve') == false) {
                return [];
            }
            return [
                'dcl/dcl',
                'davinci/davinci_',
                'xdojo/declare',
                'xdojo/has',
                'xideve/types',
                'xideve/views/VisualEditor',
                'xideve/Embedded',
                'xide/widgets/ExpressionJavaScript',
                'xideve/manager/WidgetManager',
                'xideve/manager/LibraryManager',
                'xideve/manager/ContextManager',
                'xideve/Templates',
                'xideve/Template',
                'xide/widgets/DomStyleProperties'
            ];
        },
        /**
         * @inheritDoc
         */
        getLabel: function () {
            return 'xideve';
        },
        /**
         * @inheritDoc
         */
        getBeanType: function () {
            return this.getLabel();
        },
        /**
         * @inheritDoc
         */
        run: function () {
            if (!this.userBaseUrl) {
                this.userBaseUrl = dojo.baseUrl;
            }
            this.registerEditors();
        },
        _started: false,
        onCreateEditor: function () {
            var dfd = new Deferred();
            if (!this._started) {
                var _re = require;
                var _em = _re('xideve/Embedded');
                var veEmbedded = new _em();
                var self = this;
                veEmbedded.start(this.ctx, false, this.cmdOffset, this.userBaseUrl).then(function (embedded) {
                    has.add('xideve', function () {
                        return true
                    });
                    self._started = true;
                    dfd.resolve();
                }.bind(this));
            } else {
                dfd.resolve();
            }
            return dfd;
        },
        registerEditors: function () {
            var VisualEditor = utils.getObject('xideve/views/VisualEditor'),
                WidgetManager = utils.getObject('xideve/manager/WidgetManager'),
                ContextManager = utils.getObject('xideve/manager/ContextManager'),
                LibraryManager = utils.getObject('xideve/manager/LibraryManager'),
                ctx = this.ctx;

            var library = utils.getObject('davinci/library');
            library.ctx = ctx;

            var resource = utils.getObject('davinci/de/resource').then((r) => {
                r.ctx = ctx;
            })


            VisualEditor.component = this;
            WidgetManager.component = this;
            ContextManager.component = this;
            LibraryManager.component = this;
            /**
             * Register editors
             */
            this.ctx.registerEditorExtension('Visual Editor', 'cfhtml', 'fa-laptop', this, true, null, VisualEditor, {
                updateOnSelection: false,
                leftLayoutContainer: null,
                rightLayoutContainer: null,
                ctx: this.ctx,
                mainView: this.ctx.mainView
            });


            var resourceManager = this.ctx.getResourceManager();
            var BASE_URL = resourceManager.getVariable('BASE_URL');
            var IBM_ROOT = 'xibm/ibm/';
            var template = deliteTemplate.create(BASE_URL, BASE_URL + IBM_ROOT, BASE_URL, 'bootstrap', resourceManager.getVariable('APP_URL'));
            //temp.
            var templateClass = utils.getObject('xideve/Template'),
                templateRegistry = utils.getObject('xideve/Templates'),
                templateInstance = new templateClass(utils.mixin({
                    resourceDelegate: this.ctx.getResourceManager(),
                    ctx: this.ctx,
                    getDependencies: function () {
                        return [this.contextClass];
                    },
                    bootstrapModules: ""

                }, template));

            templateRegistry.register('delite', templateInstance);
            this.ctx.registerEditorExtension('Visual Editor', 'dhtml', 'fa-laptop', this, true, null, VisualEditor, {
                updateOnSelection: false,
                leftLayoutContainer: null,
                rightLayoutContainer: null,
                ctx: this.ctx,
                mainView: this.ctx.mainView,
                beanContextName: this.ctx.mainView.beanContextName,
                template: templateInstance
            });

            this.ctx.registerEditorExtension('Visual Editor', 'html', 'fa-laptop', this, false, null, VisualEditor, {
                updateOnSelection: false,
                leftLayoutContainer: null,
                rightLayoutContainer: null,
                ctx: this.ctx,
                mainView: this.ctx.mainView,
                beanContextName: this.ctx.mainView.beanContextName,
                template: templateInstance
            });
            this.ctx.registerEditorExtension('New Window', 'html|cfhtml|dhtml', 'fa-globe', this, false, function (item, extraArgs, overrides, where) {
                var itemUrl = ctx.getFileManager().getImageUrl(item, null, {
                    viewer: 'xideve'
                });
                window.open(itemUrl);
            });


            if (!this.ctx.getWidgetManager()) {
                this.ctx.widgetManager = this.ctx.createManager(WidgetManager, null);
                this.ctx.widgetManager.init();
            }
            
            if (!this.ctx.getLibraryManager()) {
                this.ctx.libraryManager = this.ctx.createManager(LibraryManager, null);                
                this.ctx.libraryManager.init();
            }

            if (!this.ctx.getContextManager()) {
                this.ctx.contextManager = this.ctx.createManager(ContextManager, null);
                this.ctx.contextManager.init();
            }
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Post work
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Register editors and add managers to the current context
         * @callback
         */
        onReady: function () {
            this.registerEditors();
        }
    });
});