/**
 * @module xideve/delite/_ContextWidgets
 */
define([
    "dojo/_base/declare",
    "dojo/query",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/_base/connect",
    "davinci/Theme",
    "davinci/ve/widget",
    "davinci/ve/Focus",
    "davinci/ve/metadata",
    "davinci/ve/States",
    "davinci/ve/HTMLWidget",
    "davinci/ve/DeliteWidget",
    "davinci/ve/utils/GeomUtils",
    "dojox/html/_base",
    'xide/utils',
    "dojo/has",
    "xide/registry"
], function (declare,
             query,
             Deferred,
             all,
             connect,
             Theme,
             Widget,
             Focus,
             metadata,
             States,
             HTMLWidget,
             DeliteWidget,
             GeomUtils,
             _base,
             utils,
             shas,registry) {

    var debugWidgets = false;
    var debugAttach = false;
    var parseNodeData = function (node, options) {
        // summary:
        // 		Same general routine as widgetObject._getData,
        // 		only adding the "html." prefix to the widget type to make it look like a widget to the Dojo Composition Tool.
        //
        if (!node) {
            return undefined;
        }

        options = options || {};

        var data = {};
        data.properties = {};

        for (var i = 0; i < node.attributes.length; i++) {
            var a = node.attributes[i];
            if (!a.specified || !a.nodeValue) {
                continue;
            }
            var n = a.nodeName.toLowerCase();
            if (n == "id" || n == "widgetid" || n == "style") {
                continue;
            } else if (n.charAt(0) == "_") {
                continue;
            }
            var v = a.nodeValue;
            if (v && n == "class") {
                v = v.replace("HtmlWidget", "").trim();
                if (!v) {
                    continue;
                }
            }
//		if(options.serialize){
//			var p = properties[n];
//			if(p && p.type == "url"){
//				v = context.getContentUrl(v);
//			}
//		}
            data.properties[n] = v;
        }

        if (node.tagName.toLowerCase() == "script") {
            data.children = (node.innerHTML || undefined);
        }//else{
        //	data.children = widgetObject._getChildrenData(widget, options);
        //}
        return data;
    };
    /**
     *
     * @mixin module:xideve/delite/_ContextWidgets
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        _require: null,
        _register: null,
        _allWidgets:null,
        /**
         * Process dojoType, oawidget and dvwidget attributes on text content for containerNode
         */
        _processWidgets: function (containerNode, attachWidgets, states, scripts, content) {
            var prereqs = [],
                thiz = this;

            this._loadFileDojoTypesCache = {};
            debugWidgets && console.log('process widgets, scripts : ' + scripts);
            //@TODO: fixme : warm up registry, otherwise faulty id generation
            dijit.getUniqueId('delite/Button');
            dijit.getUniqueId('delite/ViewStack');
            dijit.getUniqueId('delite/Panel');
            dijit.getUniqueId('delite/TabBar');
            dijit.getUniqueId('delite/ToggleButton');
            dijit.getUniqueId('delite/RadioButton');
            dijit.getUniqueId('delite/Accordion');
            dijit.getUniqueId('delite/Switch');
            dijit.getUniqueId('delite/Slider');
            
            dojo.forEach(query("*", containerNode), function (n) {
                var type = n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
                //FIXME: This logic assume that if it doesn't have a dojo type attribute, then it's an HTML widget
                //Need to generalize to have a check for all possible widget type designators
                //(dojo and otherwise)
                if (!type) {
                    type = 'html.' + n.tagName.toLowerCase();
                }
                //doUpdateModelDojoRequires=true forces the SCRIPT tag with dojo.require() elements
                //to always check that scriptAdditions includes the dojo.require() for this widget.
                //Cleans up after a bug we had (7714) where model wasn't getting updated, so
                //we had old files that were missing some of their dojo.require() statements.
                prereqs.push(this.loadRequires((type || "").replace(/\./g, "/"), false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/));
                prereqs.push(this._preProcess(n));

                this._preserveStates(n, states);
                this._preserveDojoTypes(n);
            }, this);
            var promise = new Deferred();
            all(prereqs).then(function () {
                try {
                    var _require = this.getGlobal()["require"];
                    thiz._require = _require;
                    _require([
                        "delite/register",
                        "requirejs-dplugins/has",
                        "dojo/has"
                    ], function (register, has, dHas) {

                        has.add('use-dcl', function () {
                            return true;
                        });

                        dHas.add('use-dcl', function () {
                            return true;
                        });

                        dHas.add('drivers', function () {
                            return true;
                        });
                        dHas.add('devices', function () {
                            return true;
                        });


                        _require([
                            "requirejs-domready/domReady"
                        ], function () {
                            debugAttach && console.log('Checkpoint 1. domReady');
                            thiz._register = register;
                            _require(['dojox/html/_base'], function (html) {
                                html.set(containerNode, content, {
                                    executeScripts: true,
                                    onEnd: function () {
                                        //debugWidgets && console.log('got scripts : ' + this._code);
                                        // save any scripts for later execution
                                        var _scripts = this._code;
                                        if (_scripts) {
                                            try {
                                                debugWidgets && console.log('process scripts: ' +scripts );
                                                dojox.html.evalInGlobal(scripts, containerNode);
                                            } catch (e) {
                                                console.error('Error eval script in Context._setSourceData, ' + e);
                                            }
                                        }

                                        if(scripts){
                                            var doc = thiz.getDocument();
                                            dojo.withDoc(doc, function () {
                                                _.each(scripts,function(url){

                                                    var parent = thiz.editor.item.getParent();
                                                    url = thiz.ctx.getFileManager().getImageUrl({
                                                        path:parent.path + '/' + url,
                                                        mount:thiz.editor.item.mount
                                                    },false);
                                                    var script = doc.createElement('script');
                                                    script.type = 'text/javascript';
                                                    script.src = url;
                                                    //var head = this.getDocumentElement().getChildElement('head');
                                                    var headElem = doc.getElementsByTagName('head')[0];
                                                    headElem.appendChild(script);
                                                })
                                            });
                                        }

                                        this.executeScripts = false;
                                        this.inherited('onEnd', arguments);
                                        try {
                                            thiz._restoreDojoTypes();
                                            try {
                                                register.parse();
                                            } catch (e) {
                                                console.error('error register::parse ', e);
                                            }
                                            promise.resolve();
                                            setTimeout(function () {
                                                if (attachWidgets) {
                                                    thiz._attachAll();
                                                }
                                            }, 800);

                                        } catch (e) {
                                            console.error('error attaching widgets!', e);
                                        }
                                        promise.resolve();
                                    }
                                });
                            });
                        }.bind(this));
                    }.bind(this));
                } catch (e) {
                    logError(e,'attach widgets');
                }
            }.bind(this));

            return promise;
        },
        _preProcess: function (node) {
            //need a helper to pre process widget
            // also, prime the helper cache
            var type = node.getAttribute("data-dojo-type") || node.getAttribute("dojoType");
            //FIXME: This logic assume that if it doesn't have a dojo type attribute, then it's an HTML widget
            //Need to generalize to have a check for all possible widget type designators
            //(dojo and otherwise)
            if (!type) {
                type = 'html.' + node.tagName.toLowerCase();
            }
            return Widget.requireWidgetHelper((type || "").replace(/\./g, "/")).then(function (helper) {
                if (helper && helper.preProcess) {
                    helper.preProcess(node, this);
                }
            }.bind(this));
        },
        getRequire: function () {
            return this._require;
        },
        getRegister: function () {
            return this._register;
        },
        attach: function (widget) {
            //debugAttach && console.log('attach widget',widget);
            if (!widget || widget._edit_focus) {
                return;
            }

            if (!widget._srcElement) {
                widget._srcElement = this._srcDocument.findElement(widget.id);
            }

            var data = parseNodeData(widget.domNode);
            if (!widget.type) {
                DeliteWidget.fixType(widget);
            }
            // The following two assignments needed for OpenAjax widget support
            if (!widget.type) {
                if (widget.metadata && widget.metadata.name && widget.metadata.name.indexOf('delite')) {
                    //fast cases
                    widget.type = utils.replaceAll('.', '/', widget.metadata.name);
                } else if (widget.declaredClass == 'davinci.ve.DeliteWidget' && widget.domNode && widget.domNode.baseClass && widget.domNode.baseClass.indexOf('d-') != -1) {
                    widget.type = 'delite' + '/' + utils.capitalize(widget.domNode.baseClass.replace('d-', ''));
                    switch (widget.type) {
                        case 'delite/Radio-button':
                        {
                            widget.type = 'delite/RadioButton';
                            break;
                        }
                        case 'delite/View-stack':
                        {
                            widget.type = 'delite/ViewStack';
                            break;
                        }
                        case 'delite/Tab-bar':
                        {
                            widget.type = 'delite/TabBar';
                            break;
                        }
                    }

                    //camel case cases, wtf
                    if (data && data.properties) {
                        var _is = data.properties['is'];
                        switch (_is) {
                            case'd-toggle-button':
                            {
                                widget.type = 'delite/ToggleButton';
                                break;
                            }
                            case'd-radio-button':
                            {
                                widget.type = 'delite/RadioButton';
                                break;
                            }
                        }
                    }
                    registry.add(widget.domNode);

                } else if (widget.isHtmlWidget) {
                    widget.type = "html." + widget.getTagName();

                } else if (widget.isGenericWidget && widget.domNode && widget.domNode.render != null && data && data.properties && (data.properties['is'])) {
                    var _is = data.properties['is'];
                    switch (_is) {
                        case'd-toggle-button':
                        {
                            widget.type = 'delite/ToggleButton';
                            break;
                        }
                        case'd-button':
                        {
                            widget.type = 'delite/Button';
                            break;
                        }
                        case'd-radio-button':
                        {
                            widget.type = 'delite/RadioButton';
                            break;
                        }
                    }
                } else if (widget.domNode && widget.domNode.getAttribute('is')) {
                    var _is = widget.domNode.getAttribute('is');
                    switch (_is) {
                        case'd-toggle-button':
                        {
                            widget.type = 'delite/ToggleButton';
                            break;
                        }
                    }
                    if(!widget.type){
                        widget.type = _is;
                    }
                }
                else if (widget.isGenericWidget) {
                    widget.type = widget.domNode.getAttribute('dvwidget');
                } else if (widget.isObjectWidget) {
                    widget.type = widget.getObjectType();
                }
                else {
                    widget.type = widget.declaredClass.replace(/\./g, "/"); //FIXME: not a safe association
                }
            }
            if(!widget.type){
                console.error('have no widget type : ',widget);
            }


            widget.metadata = widget.metadata || metadata.query(widget.type);
            widget._edit_context = this;
            if (!widget.type) {
                console.error('have no widget type!!!!', widget);
            }
            widget.attach();
            if (((widget.domNode && widget.domNode.declaredClass && widget.domNode.declaredClass === 'xblox/RunScript') ||
                (widget.type && widget.type === 'xblox/RunScript') ||
                (widget.type && widget.type.indexOf('delite') !== -1) && this._register)) {
                
            }

            //TODO: dijit-specific convention of "private" widgets
            if (widget.type.charAt(widget.type.lastIndexOf(".") + 1) == "_") {
                widget.internal = true;
                // internal Dijit widget, such as _StackButton, _Splitter, _MasterTooltip
                return;
            }

            var addOnce = function (array, item) {
                if (array.indexOf(item) === -1) {
                    array.push(item);
                }
            };
            var id = widget.getId() || widget.id;
            if (id) {
                addOnce(this._widgetIds, id);
                this._allWidgets[id]=widget;
            }
            var objectId = widget.getObjectId(widget);
            if (objectId) {
                addOnce(this._objectIds, objectId);
            }

            debugAttach && console.log('attach widget ' + widget.type, widget);
            try {
                this.updateBackground(widget.domNode);
            }catch(e){
                console.error('ero',e);
            }
            Widget.requireWidgetHelper((widget.type || "").replace(/\./g, "/")).then(function (helper) {
                if (helper && helper.preProcess){
                    helper.preProcess(node, this);
                }
            }.bind(this));

            // Recurse down widget hierarchy
            //dojo.forEach(widget.getChildren(true), this.attach, this);
            var _children = widget.getChildren(true);
            //this.observe(widget.domNode);
            if(widget.domNode && widget.domNode.refreshRendering){
                //widget.domNode.refreshRendering();
            }
            _.each(_children,this.attach,this);

            var self = this;
            if(widget.domNode){
                widget.domNode.isDesign = function(){
                    return self.getVisualEditor()._designMode;
                }
            }
            if(widget.domNode && widget.domNode.createdCallback){
                //widget.domNode.createdCallback();
            }
        },
        observe:function(target){
            /*
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
// create an observer instance

            var observer = new MutationObserver(function(mutation) {
                    console.log('changed ',mutation);

                }),
// configuration of the observer:
                config = {
                    attributes: true // this is to watch for attribute changes.
                };
// pass in the element you wanna watch as well as the options
            observer.observe(target, config);
            */
        },
        _attachAll: function () {
            this._allWidgets = {};
            var rootWidget = this.rootWidget = new HTMLWidget({}, this.rootNode);
            rootWidget._edit_context = this;
            rootWidget.isRoot = true;
            var _doc = this._srcDocument;
            var _docEl = _doc.getDocumentElement();
            var body = _docEl.getChildElement("body");
            rootWidget._srcElement = this._srcDocument.getDocumentElement().getChildElement("body");
            var style = null;
            if (rootWidget._srcElement) {
                rootWidget._srcElement.setAttribute("id", "myapp");
                style = rootWidget._srcElement.getAttribute("style");
                if(style){
                    this.rootNode.setAttribute('style',style);
                }
            }
            this._attachChildren(this.rootNode);
            this.updateBackground(this.rootNode);
            this.widgetsReadyDfd.resolve();
            debugAttach && console.log('context::_attachAll!',this._allWidgets);
        },
        _attachChildren: function (containerNode) {
            var _c = query("> *", containerNode);
            debugAttach && console.log('attach children widgets:', _c);
            _c.map(Widget.getWidget).forEach(this.attach, this);
        },
        detach: function (widget) {
            // FIXME: detaching context prevent destroyWidget from working
            var arrayRemove = function (array, item) {
                var i = array.indexOf(item);
                if (i != -1) {
                    array.splice(i, 1);
                }
            };
            var id = widget.getId() || widget.id;
            if (id) {
                arrayRemove(this._widgetIds, id);
                delete this._allWidgets[id];
            }
            var objectId = widget.getObjectId();
            if (objectId) {
                arrayRemove(this._objectIds, objectId);
            }

            if (this._selection) {
                for (var i = 0; i < this._selection.length; i++) {
                    if (this._selection[i] == widget) {
                        this.focus(null, i);
                        this._selection.splice(i, 1);
                    }
                }
            }
            var library = metadata.getLibraryForType(widget.type);
            if (library) {
                var libId = library.name,
                    data = [widget.type, this];

                // Always invoke the 'onRemove' callback.
                metadata.invokeCallback(library, 'onRemove', data);
                // If this is the last widget removed from page from a given library,
                // then invoke the 'onLastRemove' callback.
                this._widgets[libId] -= 1;
                if (this._widgets[libId] === 0) {
                    metadata.invokeCallback(library, 'onLastRemove', data);
                }
            }
            _.each(widget.getChildren(),this.detach,this);
            registry.remove(id);
            delete this._containerControls;
        },
        getWidget:function(str){
            return this.widgetHash[str];
        },
        /**
         * Called by any command that can causes widgets to be added/deleted/moved/changed
         *
         * @param {number} type  0 - modified, 1 - added, 2 - removed
         */
        widgetChanged: function (type, widget) {
            if (type == 1) {
                this.widgetHash[widget.id] = widget;
            } else if (type == 2) {
                delete this.widgetHash[widget.id];
            }
        },
        resizeAllWidgets: function () {
            this.getTopWidgets().forEach(function (widget) {
                if (widget.resize) {
                    widget.resize();
                }
            });
        },
        /**
         * Returns an array of all widgets in the current document.
         * In the returned result, parents are listed before their children.
         */
        getAllWidgets: function () {
            var result = [];
            var find = function (widget) {
                result.push(widget);
                widget.getChildren().forEach(function (child) {
                    find(child);
                });
            };
            if (this.rootWidget) {
                find(this.rootWidget);
            }
            return result;
        },
        /**
         * Called by any commands that can causes widgets to be added or deleted.
         */
        widgetAddedOrDeleted: function (resetEverything) {
            var helper = Theme.getHelper(this.getTheme());
            if (helper && helper.widgetAddedOrDeleted) {
                helper.widgetAddedOrDeleted(this, resetEverything);
            } else if (helper && helper.then) { // it might not be loaded yet so check for a deferred
                helper.then(function (result) {
                    if (result.helper) {
                        this.theme.helper = result.helper;
                        if (result.helper.widgetAddedOrDeleted) {
                            result.helper.widgetAddedOrDeleted(this, resetEverything);
                        }
                    }
                }.bind(this));
            }
        },
        /**
         * Clear any cached widget bounds
         */
        clearCachedWidgetBounds: function () {
            this.getAllWidgets().forEach(function (widget) {
                var domNode = widget.domNode;
                if (domNode) {
                    GeomUtils.clearGeomCache(domNode);
                }
            });
        },
        updateFocus: function (widget, index, inline) {
            if (this.editor.getDisplayMode && this.editor.getDisplayMode() == 'source') {
                return;
            }
            Widget.requireWidgetHelper(widget.type).then(function (helper) {
                if (!this.editor.isActiveEditor()) {
                    return;
                }
                var box, op, parent;

                if (!metadata.queryDescriptor(widget.type, "isInvisible")) {
                    //Get the margin box (deferring to helper when available)
                    var helper = widget.getHelper();
                    if (helper && helper.getMarginBoxPageCoords) {
                        box = helper.getMarginBoxPageCoords(widget);
                    } else {
                        var node = widget.getStyleNode();
                        if (helper && helper.getSelectNode) {
                            node = helper.getSelectNode(this) || node;
                        }
                        box = GeomUtils.getMarginBoxPageCoords(node);
                    }

                    parent = widget.getParent();
                    op = {move: !(parent && parent.isLayout && parent.isLayout())};

                    //FIXME: need to consult metadata to see if layoutcontainer children are resizable, and if so on which axis
                    var resizable = (parent && parent.isLayout && parent.isLayout() ) ?
                        "none" : metadata.queryDescriptor(widget.type, "resizable");
                    switch (resizable) {
                        case "width":
                            op.resizeWidth = true;
                            break;
                        case "height":
                            op.resizeHeight = true;
                            break;
                        case "both":
                            op.resizeWidth = true;
                            op.resizeHeight = true;
                    }
                }
                this.focus({
                    box: box,
                    op: op,
                    hasLayout: (widget.isLayout && widget.isLayout()),
                    isChild: parent && parent.isLayout && parent.isLayout()
                }, index, inline);

                // Currently only used by theme editor
                this._focuses[0].showContext(this, widget);

            }.bind(this));
        },
        updateFocusAll: function () {
            if (this.editor && this.editor.getDisplayMode && this.editor.getDisplayMode() == 'source') {
                return;
            }
            var selection = this._selection;
            if (selection) {
                for (var i = 0; i < selection.length; i++) {
                    this.updateFocus(selection[i], i);
                }
            }
            //Update all of the highlights that show which widgets appear in a custom state
            // but which are actually visible on the base state and "shining through" to custom state
            States.updateHighlightsBaseStateWidgets(this);
        },
        hideFocusAll: function (startIndex) {
            if (!startIndex) {
                startIndex = 0;
            }
            var containerNode = this.getFocusContainer();
            if (this._focuses) {
                for (var i = startIndex; i < this._focuses.length; i++) {
                    var focus = this._focuses[i];
                    if (focus.domNode.parentNode == containerNode) {
                        focus.hide();
                        containerNode.removeChild(focus.domNode);
                    }
                }
            }
        },
        // If widget is in selection, returns the focus object for that widget
        getFocus: function (widget) {
            var i = this.getSelection().indexOf(widget);
            return i == -1 ? null : this._focuses[i];
        },
        /**
         * Returns true if the given node is part of the focus (ie selection) chrome
         */
        isFocusNode: function (node) {
            if (this._selection && this._selection.length && this._focuses && this._focuses.length >= this._selection.length) {
                for (var i = 0; i < this._selection.length; i++) {
                    if (this._focuses[i].isFocusNode(node)) {
                        return true;
                    }
                }
            }
            return false;
        },
        focus: function (state, index, inline) {
            this._focuses = this._focuses || [];
            var clear = false;
            if (index === undefined) {
                clear = true;
                index = 0;
            }
            var focus;
            if (index < this._focuses.length) {
                focus = this._focuses[index];
            } else {
                dojo.withDoc(this.getDocument(), dojo.hitch(this, function () {
                    focus = new Focus();
                    focus._edit_focus = true;
                    focus._context = this;
                }));
                this._focuses.push(focus);
            }

            //FIXME: DELETE THIS var containerNode = this.getContainerNode();
            var containerNode = this.getFocusContainer();
            if (state) {
                if (state.box && state.op) {
                    if (!focus._connected) {
                        this._connects.push(connect.connect(focus, "onExtentChange", this, "onExtentChange"));
                        focus._connected = true;
                    }
                    var w = this.getSelection();
                    focus.resize(state.box, w[0]);
                    var windex = index < w.length ? index : 0;	// Just being careful in case index is messed up
                    focus.resize(state.box, w[windex]);
                    focus.allow(state.op);
                    if (focus.domNode.parentNode != containerNode) {
                        containerNode.appendChild(focus.domNode);
                    }
                    focus.show(w[windex], {inline: inline});
                } else { // hide
                    focus.hide();
                }
                index++; // for clear
            } else if (!clear) { // remove
                if (focus.domNode.parentNode == containerNode) {
                    focus.hide();
                    containerNode.removeChild(focus.domNode);
                }
                this._focuses.splice(index, 1);
                this._focuses.push(focus); // recycle
            }
            if (clear) {
                this.hideFocusAll(index);
            }

        },
        /**
         * Returns the container node for all of the focus chrome DIVs
         */
        getFocusContainer: function () {
            var _c = document.getElementById('focusContainer');
            if (!_c) {
                _c = dojo.create('div', {'class': 'focusContainer', id: 'focusContainer'}, document.body);
                davinci.Workbench.focusContainer = _c;
            }
            return _c;
        },
        getTopWidgets: function () {
            var topWidgets = [];
            for (var node = this.rootNode.firstChild; node; node = node.nextSibling) {
                if (node.nodeType == 1 && node._dvWidget) {
                    topWidgets.push(node._dvWidget);
                }
            }
            return topWidgets;
        }
    });
});
