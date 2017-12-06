/**
 * @module xideve/delite/Context
 */
define([
    "require",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/query",
    "dojo/_base/connect",
    "xide/mixins/ReloadMixin",
    "xide/mixins/EventedMixin",
    "./_ContextMobile",
    "./_ContextTheme",
    "./_ContextCSS",
    "./_ContextJS",
    "./_ContextDelite",
    "./_ContextDojo",
    "./_ContextInterface",
    "./_ContextDocument",
    "./_ContextWidgets",
    "davinci/ve/ThemeModifier",
    "davinci/commands/CommandStack",
    "davinci/ve/tools/SelectTool",
    "davinci/model/Path",
    "davinci/Workbench",
    "davinci/ve/widget",
    "davinci/library",
    "davinci/ve/metadata",
    "davinci/ve/ChooseParent",
    "davinci/ve/States",
    "xide/utils",
    "dojox/html/_base"	// for dojox.html.evalInGlobal

], function (require,
             declare,
             lang,
             domClass,
             query,
             connect,
             ReloadMixin,
             EventedMixin,
             _ContextMobile,
             _ContextTheme,
             _ContextCSS,
             _ContextJS,
             _ContextDelite,
             _ContextDojo,
             _ContextInterface,
             _ContextDocument,
             _ContextWidgets,
             ThemeModifier,
             CommandStack,
             SelectTool,
             Path,
             Workbench,
             Widget,
             Library,
             metadata,
             ChooseParent,
             States,
             utils
) {

    davinci.ve._preferences = {}; //FIXME: belongs in another object with a proper dependency

    var debug = false;

    var contextCount = 0;
    var removeEventAttributes = function (node) {
        var libraries = metadata.getLibrary();	// No argument => return all libraries
        if (node) {
            dojo.filter(node.attributes, function (attribute) {
                return attribute.nodeName.substr(0, 2).toLowerCase() == "on";
            }).forEach(function (attribute) {
                var requiredAttribute = false;
                for (var libId in libraries) {
                    /*
                     * Loop through each library to check if the event attribute is required by that library
                     * in page designer
                     */
                    var library = metadata.getLibrary(libId);
                    var requiredAttribute = metadata.invokeCallback(library, 'requiredEventAttribute', [attribute]);
                    if (requiredAttribute) {
                        /*
                         * If the attribute is required by a library then we stop checking
                         * it only needs to be required by one library for us to leave it on the node
                         */

                        break;
                    }
                }
                //requiredAttribute=true;

                if (!requiredAttribute) {
                    /*
                     * No library requires this event attribute in page designer so we will remove it.
                     */
                    /*
                     node.removeAttribute(attribute.nodeName);
                     var _function = new Function("{" +attribute.nodeValue+"; }");

                     var _handle = dojo.connect(attribute.name.replace('on'),node,function(e){
                     _function.call(node,arguments);
                     });
                     node['__'+attribute.name] = _handle;*/

                    /*console.log('remove ' +attribute.nodeName);*/
                }
            });
        }
    };

    var removeHrefAttribute = function (node) {
        if (node.tagName.toUpperCase() == "A" && node.hasAttribute("href")) {
            node.removeAttribute("href");
        }
    };
    /**
     * @class module:xideve/delite/Context
     * @extends module:xideve/delite/_ContextWidgets
     * @extends module:xide/mixins/EventedMixin
     * @extends module:xide/mixins/ReloadMixin
     * @augments module:xideve/delite/_ContextCSS
     * @augments module:xideve/delite/_ContextInterface
     * @augments module:xideve/delite/_ContextDocument
     * @augments module:xideve/delite/_ContextDojo
     * @augments module:xideve/delite/_ContextJS
     * @augments module:xideve/delite/_ContextTheme
     * @augments module:xideve/delite/_ContextDelite
     * @augments module:xideve/delite/_ContextMobile
     */
    return declare("xideve/delite/Context", [_ContextMobile, _ContextTheme, 
        _ContextCSS, _ContextJS, _ContextDelite, _ContextDojo, _ContextInterface, _ContextDocument, _ContextWidgets, ThemeModifier, EventedMixin, ReloadMixin], {
        toWidget:function(node){
            let ret = null;
            _.each(this.widgetHash, (w) => {
                if (w.domNode == node) {
                    ret = w;
                }
                if (w.domNode.id == node.id) {
                    ret = w;
                }
            })
            return ret;
        },
        getWidgetById:function(id){
            let ret = null;
            _.each(this.widgetHash, (w) => {
                if (w.domNode.id == id) {
                    ret = w;
                }
            })
            return ret;
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Upgrade to xideve : begin
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////
        /***
         *
         * The document template
         *
         * @type {module:xideve/Template|null}
         *
         */
        template:null,
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Upgrade to xideve : end
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////
        // comma-separated list of modules to load in the iframe
        _scripts: [],
        delite: false,
        WIDGET_MODIFIED: 0,
        WIDGET_ADDED: 1,
        WIDGET_REMOVED: 2,
        WIDGET_REPARENTED: 3,
        WIDGET_ID_CHANGED: 4,
        maqStatesClassCount: 0,
        maqStatesClassPrefix: 'maqStatesClass',
        maqTypesClassCount: 0,
        maqTypesClassPrefix: 'maqTypesClass',
        /**
         * @type {module:davinci/ve/HTMLWidget}
         */
        rootWidget:null,
        /**
         *
         * @returns {module:davinci/ve/HTMLWidget}
         */
        getRootWidget:function(){
            return this.rootWidget;
        },

        /*=====
         // keeps track of widgets-per-library loaded in context
         _widgets: null,

         // Cache for the HTMLElement (model) holding the main `require` call.  Used in
         // addJavaScriptModule(), cleared in _setSource().
         _requireHtmlElem: null,

         // HTMLElement (model) of the <script> which points to "dojo.js".  Cleared
         // in _setSource().
         _dojoScriptElem: null,
         =====*/

        constructor: function (args) {
            if (!args) {
                args = {};
            }
            //this._contentStyleSheet =null;// Workbench.location() + require.toUrl("davinci/ve/resources/content.css");
            this._contentStyleSheet = require.toUrl("davinci/ve/resources/content.css");
            this._id = "_edit_context_" + contextCount++;
            this.widgetHash = {};
            this.delite = args.delite;
            lang.mixin(this, args);
            if (typeof this.containerNode == "string") {
                this.containerNode = dijit.byId(this.containerNode);
            }

            this._commandStack = new CommandStack(this);
            this._defaultTool = new SelectTool();

            this._widgetIds = [];
            this._objectIds = [];
            this._widgets = [];
            this._loadedCSSConnects = [];
            this._chooseParent = new ChooseParent({context: this});
            this.sceneManagers = {};


            this.catchEvents = true;
            this._customWidgetPackages = lang.clone(Library.getCustomWidgetPackages());

            // Invoke each library's onDocInit function, if library has such a function.
            var libraries = metadata.getLibrary();	// No argument => return all libraries
            for (var libId in libraries) {
                var library = metadata.getLibrary(libId);
                metadata.invokeCallback(library, 'onDocInit', [this]);
            }

            var _c = document.getElementById('focusContainer');
            if (!_c) {
                _c = dojo.create('div', {'class': 'focusContainer', id: 'focusContainer'}, document.body);
                davinci.Workbench.focusContainer = _c;
            }
            this.initReload();
        },
        getVisualEditor:function(){
            if (this.visualEditor && this.visualEditor._pageEditor) {
                //this.visualEditor._pageEditor._visualChanged(true);
                return this.visualEditor._pageEditor.delegate;
            }
            return null;
        },
        destroy: function () {
            this.deactivate();
            this.inherited(arguments);
            if (this._loadedCSSConnects) {
                this._loadedCSSConnects.forEach(connect.disconnect);
                delete this._loadedCSSConnects;
            }
        },
        isActive: function () {
            return !!this._activeTool;
        },
        onReloaded: function () {
            console.log('on reloaded');
        },
        /*
         * @returns the path to the file being edited
         */
        getPath: function () {

            /*
             * FIXME:
             * We dont set the path along with the content in the context class, so
             * have to pull the resource path from the model.
             *
             * I would rather see the path passed in, rather than assume the model has the proper URL,
             * but using the model for now.
             *
             */
            return new Path(this.getModel().fileName);
        },
        activate2: function () {
            debug && console.log('activate context');

            if (this.isActive()) {
                return;
            }

            this.loadStyleSheet(this._contentStyleSheet);
            this._attachAll();
            this._restoreStates();

            query("*", this.rootNode).forEach(function (n) {
                // Strip off interactivity features from DOM on canvas
                // Still present in model
                //console.log('removing event attributes : ',n);
                removeEventAttributes(n);	// Make doubly sure there are no event attributes (was also done on original source)
                removeHrefAttribute(n);		// Remove href attributes on A elements
            });
            this._AppStatesActivateActions();
            // The initialization of states object for BODY happens as part of user document onload process,
            // which sometimes happens after context loaded event. So, not good enough for StatesView
            // to listen to context/loaded event - has to also listen for context/statesLoaded.
            this._statesLoaded = true;
            connect.publish('/davinci/ui/context/statesLoaded', [this]);

            this._onLoadHelpers();


            var containerNode = this.getContainerNode();
            domClass.add(containerNode, "editContextContainer");

            if (this.catchEvents) {
                this._connects = [
                    connect.connect(this._commandStack, "onExecute", this, "onCommandStackExecute"),
                    // each time the command stack executes, onContentChange sets the focus, which has side-effects
                    // defer this until the stack unwinds in case a caller we don't control iterates on multiple commands
                    connect.connect(this._commandStack, "onExecute", function () {
                        setTimeout(this.onContentChange.bind(this), 0);
                    }.bind(this))

                ];

                this._designEvents = [
                    connect.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
                    connect.connect(this.getDocument(), "onkeyup", this, "onKeyUp"),
                    connect.connect(containerNode, "ondblclick", this, "onDblClick"),
                    connect.connect(containerNode, "onmousedown", this, "onMouseDown"),
                    connect.connect(containerNode, "onclick", this, "onMouseClick"),
                    connect.connect(containerNode, "onmousemove", this, "onMouseMove"),
                    connect.connect(containerNode, "onmouseup", this, "onMouseUp"),
                    connect.connect(containerNode, "onmouseover", this, "onMouseOver"),
                    connect.connect(containerNode, "onmouseout", this, "onMouseOut"),
                    connect.connect(containerNode, "contextmenu", this, "contextmenu")
                ];


            } else {
                this._connects = [
                    connect.connect(this._commandStack, "onExecute", this, "onCommandStackExecute"),
                    // each time the command stack executes, onContentChange sets the focus, which has side-effects
                    // defer this until the stack unwinds in case a caller we don't control iterates on multiple commands
                    connect.connect(this._commandStack, "onExecute", function () {
                        setTimeout(this.onContentChange.bind(this), 0);
                    }.bind(this)),
                    connect.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
                    connect.connect(this.getDocument(), "onkeyup", this, "onKeyUp")/*
                     connect.connect(containerNode, "ondblclick", this, "onDblClick"),
                     connect.connect(containerNode, "onmousedown", this, "onMouseDown"),
                     connect.connect(containerNode, "onmousemove", this, "onMouseMove"),
                     connect.connect(containerNode, "onmouseup", this, "onMouseUp"),
                     connect.connect(containerNode, "onmouseover", this, "onMouseOver"),
                     connect.connect(containerNode, "onmouseout", this, "onMouseOut")*/
                ];
            }

            if (this.visualEditor && this.visualEditor._pageEditor && this.visualEditor._pageEditor._visualChanged) {
                this.visualEditor._pageEditor._visualChanged(true);
            }

            try {
                this.setActiveTool();
            } catch (e) {
                debugger;
                console.error('set active tool failed! ' + e.message);
            }
            return true;
        },
        deactivate: function () {
            if (!this.isActive()) {
                return;
            }
            this._connects.forEach(connect.disconnect);
            this._designEvents.forEach(connect.disconnect);
            delete this._designEvents;
            delete this._connects;
            (this._focuses || []).forEach(function (f) {
                f._connected = false;
            });
            this._commandStack.clear();
            if (this._activeTool) {
                this._activeTool.deactivate();
                delete this._activeTool;
            }

            var containerNode = this.getContainerNode();
            // FIXME: what's _menu?
            //this._menu.unBindDomNode(containerNode);

            this.select(null);
            domClass.remove(containerNode, "editContextContainer");
            this.getTopWidgets().forEach(this.detach, this);
            this.unloadStyleSheet(this._contentStyleSheet);
        },


        _editorSelectionChange: function (event) {
            // we should only be here do to a dojo.parse exception the first time we tried to process the page
            // Now the editor tab container should have focus becouse the user selected it. So the dojo.processing should work this time
            if (event.editor.fileName === this.editor.fileName) {
                connect.unsubscribe(this._editorSelectConnection);
                delete this._editorSelectConnection;
                this._setSource(this._srcDocument);
            }
        },
        // Temporarily stuff a unique class onto element with each _preserveStates call.
        // Dojo will sometimes replace the widget's root node with a different root node
        // and transfer IDs and other properties to subnodes. However, Dojo doesn't mess
        // with classes.
        //FIXME: Need a more robust method, but not sure exactly how to make this bullet-proof and future-proof.
        //Could maybe use XPath somehow to address the root node.
        // preserve states specified to node
        _preserveStates: function (node, cache) {
            var statesAttributes = davinci.ve.states.retrieve(node);
//FIXME: Need to generalize this to any states container
            if (node.tagName.toUpperCase() != "BODY" && (statesAttributes.maqAppStates || statesAttributes.maqDeltas)) {
                var tempClass = this.maqStatesClassPrefix + this.maqStatesClassCount;
                node.className = node.className + ' ' + tempClass;
                this.maqStatesClassCount++;
                cache[tempClass] = {};
                if (statesAttributes.maqAppStates) {
                    cache[tempClass].maqAppStates = statesAttributes.maqAppStates;
                }
                if (statesAttributes.maqDeltas) {
                    cache[tempClass].maqDeltas = statesAttributes.maqDeltas;
                }
                if (node.style) {
                    cache[tempClass].style = node.style.cssText;
                } else {
                    // Shouldn't be here
                    console.error('Context._preserveStates: fail'); // FIXME: throw on error?
                }
            }
        },
        // restore states into widget
        _restoreStates: function () {
            //xmaqhack

            return;/*
            var cache = this._loadFileStatesCache;
            if (!cache) {
                console.error('Context._restoreStates: this._loadFileStatesCache missing');
                return;
            }
            var maqAppStatesString, maqDeltasString, maqAppStates, maqDeltas;
            for (var id in cache) {
                //FIXME: This logic depends on the user never add ID "body" to any of his widgets.
                //That's bad. We should find another way to achieve special case logic for BODY widget.
                // Carefully pick the correct root node for this widget
                var node = null;
                if (id == "body") {
                    node = this.getContainerNode();
                }
                if (!node) {
                    var doc = this.getDocument();
                    node = doc.querySelectorAll('.' + id)[0];
                    if (node) {
                        node.className = node.className.replace(' ' + id, '');
                    }
                }
                if (!node) {
                    console.error('Context.js _restoreStates node not found. id=' + id);
                    continue;
                }
                var widget = Widget.getWidget(node);
//FIXME: Need to generalize beyond just BODY
                var isBody = (node.tagName.toUpperCase() == 'BODY');
//FIXME: Temporary - doesn't yet take into account nested state containers
                var srcElement = widget._srcElement;
                maqAppStatesString = maqDeltasString = maqAppStates = maqDeltas = null;
                if (isBody) {
                    maqAppStatesString = cache[id];
                } else {
                    maqAppStatesString = cache[id].maqAppStates;
                    maqDeltasString = cache[id].maqDeltas;
                }
                var maqAppStates = maqDeltas = null;
                var visualChanged = false;
                if (maqAppStatesString) {
                    maqAppStates = davinci.states.deserialize(maqAppStatesString, {isBody: isBody});
//FIXME: If files get migrated, should set dirty bit
//FIXME: Logic doesn't completely deal with nesting yet.
                    // Migrate states attribute names in the model
                    var oldValue = srcElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE);
                    if (oldValue != maqAppStatesString) {
                        srcElement.setAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE, maqAppStatesString);
                        visualChanged = true;
                    }
                    // Remove any lingering old dvStates attribute from model
                    if (srcElement.hasAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6)) {
                        srcElement.removeAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
                        visualChanged = true;
                    }
                }
                if (maqDeltasString) {
                    maqDeltas = davinci.states.deserialize(maqDeltasString, {isBody: isBody});
//FIXME: If files get migrated, should set dirty bit
//FIXME: Logic doesn't completely deal with nesting yet.
                    // Migrate states attribute names in the model
                    var oldValue = srcElement.getAttribute(davinci.ve.states.DELTAS_ATTRIBUTE);
                    if (oldValue != maqDeltasString) {
                        srcElement.setAttribute(davinci.ve.states.DELTAS_ATTRIBUTE, maqDeltasString);
                        visualChanged = true;
                    }
                    // Remove any lingering old dvStates attribute from model
                    if (srcElement.hasAttribute(davinci.ve.states.DELTAS_ATTRIBUTE_P6)) {
                        srcElement.removeAttribute(davinci.ve.states.DELTAS_ATTRIBUTE_P6);
                        visualChanged = true;
                    }
                }
                if (visualChanged) {
                    // we are resoring, don't mark dirty
                    this.editor._visualChanged(true);
                }
                if (maqAppStates) {
                    if (maqAppStates.initial) {
                        // If user defined an initial state, then set current to that state
                        maqAppStates.current = maqAppStates.initial;
                    } else {
                        if (maqAppStates.focus) {
                            // Can't have focus on a state that isn't current
                            delete maqAppStates.focus;
                        }
                        // Otherwise, delete any current state so that we will be in Normal state by default
                        delete maqAppStates.current;
                    }
                }
                davinci.ve.states.store(widget.domNode, maqAppStates, maqDeltas);

//FIXME: Need to generalize beyond just BODY
                //FIXME: OLD LOGIC
                // if(node.tagName.toUpperCase() != 'BODY'){
                //
                if (maqDeltas) {
                    davinci.states.transferElementStyle(node, cache[id].style);
                }

            }
            // Remove any application states information that are defined on particular widgets
            // for all states that aren't in the master list of application states.
            // (This is to clean up after bugs found in older releases)
            davinci.ve.states.removeUnusedStates(this);

            // Call setState() on all of the state containers that have non-default
            // values for their current state (which was set to initial state earlier
            // in this routine).
            davinci.ve.states.getAllStateContainers(this.rootNode).forEach(function (stateContainer) {
                if (stateContainer._maqAppStates && typeof stateContainer._maqAppStates.current == 'string') {
                    var focus = stateContainer._maqAppStates.focus;
                    davinci.states.setState(stateContainer._maqAppStates.current, stateContainer, {
                        updateWhenCurrent: true,
                        focus: focus
                    });
                }
            });
            */
        },
        // Temporarily stuff a unique class onto element with each _preserveDojoTypes call.
        // Dojo will sometimes replace the widget's root node with a different root node
        // and transfer IDs and other properties to subnodes. However, Dojo doesn't mess
        // with classes.
        /**
         * Force a data-maq-appstates attribute on the BODY
         */
        _AppStatesActivateActions: function () {
            if (this.editor.declaredClass !== "davinci.ve.PageEditor") {
                return;
            }
            if (!this.rootNode._maqAppStates) {
                this.rootNode._maqAppStates = {};
                var bodyModelNode = this.rootWidget._srcElement;
                var o = States.serialize(this.rootNode);
                if (o.maqAppStates) {
                    bodyModelNode.setAttribute(States.APPSTATES_ATTRIBUTE, o.maqAppStates);
                } else {
                    bodyModelNode.removeAttribute(States.APPSTATES_ATTRIBUTE);
                }
                // no src changes to pass in true
                this.editor._visualChanged(true);
            }
            var statesFocus = States.getFocus(this.rootNode);
            if (!statesFocus) {
                var currentState = States.getState(this.rootNode);
                States.setState(currentState, this.rootNode, {updateWhenCurrent: true, silent: true, focus: true});
            }
        },
        getCommandStack: function () {
            return this._commandStack;
        }, getSelection: function () {
            return this._selection || [];
        },
        //FIXME: refactor.  Does not need to be in Context.js
        getPreference: function (name) {
            if (!name) {
                return undefined;
            }
            return davinci.ve._preferences[name];
        },
        getPreferences: function () {
            return lang.mixin({}, davinci.ve._preferences);
        },
        setPreference: function (name, value) {
            if (!name) {
                return;
            }
            davinci.ve._preferences[name] = value;

            if (this.isActive()) {
                // Previously, included logic to show a rectangular grid under the drawing canvas.
                // Now, nothing, but leaving empty IF statement in case we add things in future.
            }
        },
        setPreferences: function (preferences) {

            if (preferences) {
                for (var name in preferences) {
                    this.setPreference(name, preferences[name]);
                }
            }
        },
        /**
         * Parse the given model.
         * @param  {davinci/html/HTMLFile} source
         * @return {Object} a data structure containing information on parsed source
         */
        _parse: function (source) {

            var data = {metas: [], scripts: [], modules: [], styleSheets: []},
                htmlElement = source.getDocumentElement(),
                head = htmlElement.getChildElement("head"),
                bodyElement = htmlElement.getChildElement("body");

            this._uniqueIDs = {};

            if (bodyElement) {
                bodyElement.visit({
                    visit: dojo.hitch(this, function (element) {
                        if (element.elementType == "HTMLElement" && element != bodyElement) {
                            this.getUniqueID(element);
                        }
                    })
                });
                var classAttr = bodyElement.getAttribute("class");
                if (classAttr) {
                    data.bodyClasses = classAttr;
                }
                data.style = bodyElement.getAttribute("style");
                data.content = bodyElement.getElementText({includeNoPersist: true, excludeIgnoredContent: true});

                //FIXME: Need to generalize beyond just BODY
                var states = bodyElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE);
                if (!states) {
                    // Previous versions used different attribute name (ie, 'dvStates')
                    states = bodyElement.getAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
                    if (states) {
                        bodyElement.setAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE, states);
                    }
                }
                // Remove any lingering old dvStates attribute from model
                bodyElement.removeAttribute(davinci.ve.states.APPSTATES_ATTRIBUTE_P6);
                data.maqAppStates = states;
            }

            var titleElement = head.getChildElement("title");
            if (titleElement) {
                data.title = titleElement.getElementText();
            }

            var scriptTags = head.getChildElements("script");
            dojo.forEach(scriptTags, function (scriptTag) {
                var value = scriptTag.getAttribute("src");
                if (value) {
                    data.scripts.push(value);
                }
                var text = scriptTag.getElementText();
                if (text.length) {
                    // grab AMD-style dependencies
                    text.replace(/require\(\[["']([^'"]+)["']\]\)/g, function (match, module) {
                        data.modules.push(module);
                    });
                }
            }, this);

            var styleTags = head.getChildElements("style");

            dojo.forEach(styleTags, function (styleTag) {

                dojo.forEach(styleTag.children, function (styleRule){


                    if (styleRule.elementType === "CSSImport") {
                        data.styleSheets.push(styleRule.url);
                    }else if(styleRule.elementType === "CSSRule"){

                        if(!data.styles){
                            data.styles = [];
                        }
                        data.styles.push(styleRule.getText());
                    }
                });
            });

            if(data.styles){
                data.styles = data.styles.join('\n');
            }else{
                data.styles = "";
            }

            return data;
        },
        // FIXME: should consider renaming method.  Has side effect of actually setting the id.
        getUniqueID: function (node, idRoot) {
            var id = node.getAttribute("id");
            if (!id) {
                var userDoc = this.rootWidget ? this.rootWidget.domNode.ownerDocument : null,
                    root = idRoot || node.tag,
                    num;

                while (1) {
                    if (!this._uniqueIDs.hasOwnProperty(root)) {
                        num = this._uniqueIDs[root] = 0;
                    } else {
                        num = ++this._uniqueIDs[root];
                    }
                    id = root + "_" + num;
                    if (userDoc) {
                        // If this is called when user doc is available,
                        // make sure this ID is unique
                        if (!userDoc.getElementById(id)) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                var temp = !idRoot;
                node.addAttribute("id", id, temp);
            }
            return id;
        },
        registerSceneManager: function (sceneManager) {

            if (!sceneManager || !sceneManager.id) {
                return;
            }
            var id = sceneManager.id;
            if (!this.sceneManagers[id]) {
                this.sceneManagers[id] = sceneManager;
                connect.publish('/davinci/ui/context/registerSceneManager', [sceneManager]);
            }
        },
        visualEditorChanged:function(){
            //console.log('visual editor changed')
            _.each(this._allWidgets,function(widget){
                //widget && this.updateBackground(widget.domNode);
                var node = widget.domNode;
                if(node && node.onChanged){
                    node.onChanged();
                }
            },this);
        },
        updateBackground:function(widget){
            var style = $(widget).attr("style");
            var background = utils.getBackgroundUrl(style);
            if(background && background.indexOf('http')==-1){
                var $widget = $(widget);
                var parts = utils.parse_url(background);
                if(parts.host && parts.scheme) {
                    var url = this.ctx.getFileManager().getImageUrl({
                        path: parts.host + (parts.path || ''),
                        mount: parts.scheme
                    }, false);
                    //console.log('update background : ' + url,style);
                    $widget.css('background-image', "url('" + url + "')");
                }
            }
        },

        onCommandStackExecute: function (evt) {


            this.clearCachedWidgetBounds();
            if (this.editor && this.editor.editorContainer && this.editor.editorContainer.updateToolbars) {
                this.editor.editorContainer.updateToolbars();
            }
            //Update all of the highlights that show which widgets appear in a custom state
            // but which are actually visible on the base state and "shining through" to custom state
            States.updateHighlightsBaseStateWidgets(this);

            _.each(this._allWidgets,function(widget){
                widget && this.updateBackground(widget.domNode);
            },this);


             _.each(evt._commands,function(command){
                 var _id = command._id;
                 var widget = Widget.byId(_id);
                 widget && this.updateBackground(widget.domNode);
             },this);


        },
        /**
         * Reorder a list of widgets to preserve sibling order for widgets in the list
         */
        reorderPreserveSiblingOrder: function (origArray) {
            var newArray = [].concat(origArray); // shallow copy
            var j = 0;
            while (j < (newArray.length - 1)) {
                var refWidget = newArray[j];
                var refParent = refWidget.getParent();
                var k = j + 1;
                var adjacentSiblings = false;
                while (k < newArray.length) {
                    var parent = newArray[k].getParent();
                    if (parent == refParent) {
                        adjacentSiblings = true;
                        k++;
                    } else {
                        break;
                    }
                }
                if (adjacentSiblings) {
                    var children = refParent.getChildren();
                    for (var m = (k - 2); m >= j; m--) {
                        for (var n = j; n <= m; n++) {
                            var index1 = children.indexOf(newArray[n]);
                            var index2 = children.indexOf(newArray[n + 1]);
                            if (index1 > index2) {
                                var temp = newArray[n + 1];
                                newArray[n + 1] = newArray[n];
                                newArray[n] = temp;
                            }
                        }
                    }
                }
                j = k;
            }
            return newArray;
        },
        _updateWidgetHash: function () {
            this.widgetHash = {};
            this.getAllWidgets().forEach(function (widget) {
                var id = widget.id;
                if (id) {
                    this.widgetHash[id] = widget;
                }
            }, this);
        }
    });
});
