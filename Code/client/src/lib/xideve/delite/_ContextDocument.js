/**
 * @module xideve/delite/_ContextDocument
 */
define([
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/_base/connect",
    "dojo/window",
    "xide/utils",
    "xide/factory",
    "xide/types",
    "davinci/model/Path",
    "davinci/Workbench",
	"davinci/ve/widget",
    "davinci/ve/metadata",
    "davinci/html/HTMLElement",
    "davinci/workbench/Preferences",
	"dojox/html/_base"	// for dojox.html.evalInGlobal

], function(
	declare,
	domClass,
	domConstruct,
	query,
	connect,
	windowUtils,
    utils,
    factory,
    types,
	Path,
	Workbench,
	Widget,
	metadata,
	HTMLElement,
	Preferences) {
    var MOBILE_DEV_ATTR = 'data-maq-device',
        PREF_LAYOUT_ATTR = 'data-maq-flow-layout',
        COMPTYPE_ATTR = 'data-maq-comptype';

    var removeEventAttributes = function(node) {
        var libraries = metadata.getLibrary();	// No argument => return all libraries
        if(node){
            dojo.filter(node.attributes, function(attribute) {
                return attribute.nodeName.substr(0,2).toLowerCase() == "on";
            }).forEach(function(attribute) {

                var requiredAttribute = false;

                for(var libId in libraries){
                    /*
                     * Loop through each library to check if the event attribute is required by that library
                     * in page designer
                     *
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
    var removeHrefAttribute = function(node) {
        if(node.tagName.toUpperCase() == "A" && node.hasAttribute("href")){
            node.removeAttribute("href");
        }
    };
    /**
     *
     * @mixin module:xideve/delite/_ContextDocument
     * @lends module:xideve/delite/Context
     */
    return declare(null,{
        hasDirtyResources: function(){
            if(this._htmlFileDirtyOnLoad){}
            var dirty = false;
            return false;
            var baseRes = systemResource.findResource(this.getDocumentLocation()); // theme editors don't have a base resouce.
            if (baseRes){
                dirty = baseRes.isDirty();
            }

            if(dirty) {
                return dirty;
            }
            var visitor = {
                visit: function(node){
                    if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){
                        dirty = true;
                    }
                    return dirty;
                }
            };

            this.getModel().visit(visitor);

            if (!dirty) {
                dirty = this.dirtyDynamicCssFiles(this.cssFiles);
            }

            return dirty;
        },
        getCompType: function(){
            return 'delite';
        },
        /**
         * Significant attributes for HTML elements; used for matching duplicates.
         * If an element isn't listed here, defaults to 'src'.
         *
         * @static
         */
        _significantAttrs: {
            link: 'href',
            meta: 'name'
        },
        getContainerNode: function(){
            //FIXME: accessor func is unnecessary?
            return this.rootNode;
        },
        getParentIframe: function(){
            if(!this._parentIframeElem){
                var userdoc = this.getDocument();
                var iframes = document.getElementsByTagName('iframe');
                for(var i=0; i < iframes.length; i++){
                    if(iframes[i].contentDocument === userdoc){
                        this._parentIframeElem = iframes[i];
                        break;
                    }
                }
            }
            return this._parentIframeElem;
        },
        //FIXME: accessor func is unnecessary?
        getModel: function(){
            return this._srcDocument;
        },
        setSource: function(source, callback, scope, initParams){
            dojo.withDoc(this.getDocument(), "_setSource", this, arguments);
            if(this.editor){
                this.editor._setDirty();
            }
        },
        getBase: function(){
            return '';            
        },
        getFullResourcePath: function() {
            if(!this._fullResourcePath){
                var filename = this.getModel().fileName;
                this._fullResourcePath = new Path(filename);
            }
            return this._fullResourcePath;
        },
        _getCurrentBasePath: function(){
            var base = new Path(Workbench.getProject()),
                prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs', base);

            if (prefs.webContentFolder!==null && prefs.webContentFolder!=="") {
                base = base.append(prefs.webContentFolder);
            }
            return base;
        },
        getRelativeFileString: function(filename){
            var currentHtmlFolderPath = this.getFullResourcePath().getParentPath(),
                filePath = this._getCurrentBasePath().append(filename);
            return filePath.relativeTo(currentHtmlFolderPath).toString();
        },
        //////////////////////////////////////////////////////////////////////////////////////////////
        _setSource: function(source, callback, scope, newHtmlParams){
            // clear cached values
            delete this._requireHtmlElem;
            delete this._dojoScriptElem;
            delete this.rootWidget;

            // clear dijit registry
            if (this.frameNode) {
                var doc = this.frameNode.contentDocument || (this.frameNode.contentWindow && this.frameNode.contentWindow.document);
                if (doc) {
                    try {

                        var _registry = windowUtils.get(doc).require("xide/registry")._destroyAll();
                        if(_registry) {

                            console.log('setting source!', _registry._hash);
                            _registry.forEach(function (w) { //FIXME: use require?
                                utils.destroy(w, true);
                            });
                            console.log('setting source-fin', _registry._hash);
                            _registry._hash = {};
                        }

                    } catch(e) {
                        logError(e,'error cleaning registry');
                        // registry not loaded yet. nothing to see here, move along.
                    }
                }
            }

            this._srcDocument=source;
            // css files need to be added to doc before body content
            // ensure the top level body deps are met (ie. maqetta.js, states.js and app.css)
            if(newHtmlParams){
                // theme editor does not pass newHtmlParms
                var modelBodyElement = source.getDocumentElement().getChildElement("body");
                modelBodyElement.setAttribute(MOBILE_DEV_ATTR, newHtmlParams.device);
                modelBodyElement.setAttribute(PREF_LAYOUT_ATTR, newHtmlParams.flowlayout);
                modelBodyElement.setAttribute(COMPTYPE_ATTR, newHtmlParams.comptype);
            }
            this.loadRequires(
                "html.dbody",
                true /*updateSrc*/,
                false /*doUpdateModelDojoRequires*/,
                true /*skipDomUpdate*/
            ).then(function(){
                    // make sure this file has a valid/good theme
                    if(newHtmlParams){
                        // theme editor loads themes in themeEditor/context
                        this.loadTheme(newHtmlParams);
                    }
                    this._setSourcePostLoadRequires(source, callback, scope, newHtmlParams);
                }.bind(this));


        },
        _setSourceData: function(data) {
            if(this.editor && this.editor.item){
                var path = this.editor.item.path;
                path = './' +path.replace('.dhtml','.css');
                path = './' +path.replace('.html','.css');
                path = path.replace('././','./');
                data.styleSheets.push(path);
            }
            //import to tell everyone
            factory.publish(types.EVENTS.ON_SET_SOURCE_DATA,{
                data:data,
                context:this,
                editor:this.editor
            },this);
            //console.log('_setSourceData',data);
            // cache the theme metadata
            this.themeChanged();
            var theme=null;
            if(theme && theme.usingSubstituteTheme){
                var oldThemeName = theme.usingSubstituteTheme.oldThemeName;
                var newThemeName = theme.usingSubstituteTheme.newThemeName;

                data.styleSheets = data.styleSheets.map(function(sheet){
                    return sheet.replace(new RegExp("/"+oldThemeName,"g"), "/"+newThemeName);
                });
                data.bodyClasses = data.bodyClasses.replace(new RegExp("\\b"+oldThemeName+"\\b","g"), newThemeName);

                if(this.editor && this.editor.visualEditor && this.editor.visualEditor._onloadMessages){
                    this.editor.visualEditor._onloadMessages.push(dojo.replace(
                        "Warning. File refers to CSS theme '{0}' which is not in your workspace. Using CSS theme '{1}' instead.", //FIXME: Needs to be globalized
                        [oldThemeName, newThemeName]));
                }
            }

            var _header = {
                title: data.title,
                scripts: data.scripts,
                modules: data.modules,
                styleSheets: data.styleSheets,
                //className: data.className,
                bodyClasses: data.bodyClasses,
                style: data.style
            };

            //import to tell everyone
            factory.publish(types.EVENTS.ON_BUILD_HEADER,{
                data:_header,
                context:this,
                editor:this.editor
            },this);

            this.setHeader(_header);

            var content = data.content || "";

            var active = this.isActive();
            if(active){
                this.select(null);
                this.getTopWidgets().forEach(this.detach, this);
            }
            var states = {},
                containerNode = this.getContainerNode();

            if (data.maqAppStates) {
                states.body = data.maqAppStates;
            }
            //FIXME: Temporary fix for #3030. Strip out any </br> elements
            //before stuffing the content into the document.
            content = content.replace(/<\s*\/\s*br\s*>/gi, "");

            // Set content
            //  Content may contain inline scripts. We use dojox.html.set() to pull
            // out those scripts and execute them later, after _processWidgets()
            // has loaded any required resources (i.e. <head> scripts)
            var scripts;
            // It is necessary to run the dojox.html.set utility from the context
            // of inner frame.  Might be a Dojo bug in _toDom().


            //dojo upgrade to 1.10.3: add missing html funcs and make _Tool happy
            var _global = this.getGlobal();
            var _require = _global.require;
            var _dojo = this.getDojo();
            
            _global['require'](['dojo/dom-construct','dojo/dom-style','dojo/dom-attr','dojo/_base/html'], function (_domConstruct,_domStyle,domAttr,_dojoHTML) {});
            // Remove "on*" event attributes from editor DOM.
            // They are already in the model. So, they will not be lost.
            removeEventAttributes(containerNode);
            query("*",containerNode).forEach(removeEventAttributes);

            // Convert all text nodes that only contain white space to empty strings
            containerNode.setAttribute('data-maq-ws','collapse');
            var modelBodyElement = this._srcDocument.getDocumentElement().getChildElement("body");
            if (modelBodyElement) {
                modelBodyElement.addAttribute('data-maq-ws', 'collapse');
            }

            // Set the mobile agaent if there is a device on the body
            // We need to ensure it is set before the require of deviceTheme is executed
            //var djConfig = this.getGlobal().dojo.config;  // TODO: use require
            var bodyElement = this.getDocumentElement().getChildElement("body");

            // Collapses all text nodes that only contain white space characters into empty string.
            // Skips certain nodes where whitespace does not impact layout and would cause unnecessary processing.
            // Similar to features that hopefully will appear in CSS3 via white-space-collapse.
            // Code is also injected into the page via workbench/davinci/davinci.js to do this at runtime.
            var skip = {SCRIPT:1, STYLE:1},
                collapse = function(element) {
                    dojo.forEach(element.childNodes, function(cn){
                        if (cn.nodeType == 3){	// Text node
                            //FIXME: exclusion for SCRIPT, CSS content?
                            cn.nodeValue = cn.data.replace(/^[\f\n\r\t\v\ ]+$/g,"");
                        }else if (cn.nodeType == 1 && !skip[cn.nodeName]){ // Element node
                            collapse(cn);
                        }
                    });
                };

            collapse(containerNode);
            this._loadFileStatesCache = states;
            this.global = this.getGlobal();
            return this._processWidgets(containerNode, active, this._loadFileStatesCache, data.scripts,content);

            //return dfd;
        },
        getSource: function(){
            return this._srcDocument.getText();
        },
        getDocumentElement: function(){
            return this._srcDocument.getDocumentElement();
        },
        getDocumentLocation: function(){
            return this._srcDocument.fileName;
        },
        getHeader: function(){
            return this._header || {};
        },
        setHeader: function(header){
            var oldStyleSheets = [],
                newStyleSheets,
                oldBodyClasses,
                newBodyClasses;


            if(this._header){
                oldStyleSheets = this._header.styleSheets || [];
                oldBodyClasses = this._header.bodyClasses;
            }
            if(header){
                newStyleSheets = header.styleSheets || [];
                newBodyClasses = header.bodyClasses;
                if(header.modules){
                    var innerRequire = this.getGlobal()["require"];
                    header.modules.map(function(module) {
                        return [module.replace(/\./g, "/")];
                    }).forEach(innerRequire);
                }

                if(header.className){
                    var classes = header.className.split(' ');
                    dojo.some(classes, function(clasz, index){
                        classes.splice(index, 1);
                        newBodyClasses = classes.join(' ');
                        return true;
                    });
                }
            }

            if(oldBodyClasses != newBodyClasses){
                var containerNode = this.getContainerNode();
                if(oldBodyClasses){
                    domClass.remove(containerNode, oldBodyClasses);
                }
                if(newBodyClasses){
                    domClass.add(containerNode, newBodyClasses);
                }
            }

            if(oldStyleSheets != newStyleSheets){
                oldStyleSheets = [].concat(oldStyleSheets); // copy array for splice() below
                dojo.forEach(newStyleSheets, function(s){
                    var index = dojo.indexOf(oldStyleSheets, s);
                    if(index < 0){
                        this.loadStyleSheet(s);
                    }else{
                        oldStyleSheets.splice(index, 1);
                    }
                }, this);
                dojo.forEach(oldStyleSheets, this.unloadStyleSheet, this);
            }

            this.setStyle(header ? header.style : undefined);

            this._header = header;
        },
        /**
         * Invoked when the page associated with this Context has finished its
         * initial loading.
         */
        onload: function() {
            // Don't actually get the composition type. Calling this routine
            // causes a maq-data-comptype attribute to be added to old documents
            // if it doesn't exist already.
            this.getCompType();

            // add the user activity monitoring to the document and add the connects to be
            // disconnected latter
            //this._connects = (this._connects || []).concat(UserActivityMonitor.addInActivityMonitor(this.getDocument()));
            //#xmaqHack: user activity no longer needed
            this._connects = (this._connects || []);
            /*
             * Need to let the widgets get parsed, and things finish loading async
             */
            window.setTimeout(function(){
                //#xmaqhack
                this.widgetAddedOrDeleted();
                connect.publish('/davinci/ui/context/loaded', [this]);
                if(this._markDirtyAtLoadTime){
                    // Hack to allow certain scenarios to force the document to appear
                    // as dirty at document load time
                    this.editor.setDirty(true);
                    delete this._markDirtyAtLoadTime;
                    this.editor.save(true);		// autosave
                }else{
                    this.editor.setDirty(this.hasDirtyResources());
                }
                //delite hack
                //this.addPseudoClassSelectors();
            }.bind(this), 500);
        },
        /**
         * If any widgets in the document have onLoad helpers, invoke those helpers.
         * We pass a parameter to tell the helper whether this is the first time
         * it has been called for this document.
         * FIXME: If we change helpers to using object-oriented approach inheriting from
         * helper base class, then helper class can probably keep track of already themselves.
         */
        _onLoadHelpers: function(){
            var onLoadHelpersSoFar={};
            query("> *", this.rootNode).map(Widget.getWidget).forEach(function(widget){
                var helper = widget.getHelper();
                if(helper && helper.onLoad){
                    var already = onLoadHelpersSoFar[widget.type];
                    onLoadHelpersSoFar[widget.type] = true;
                    helper.onLoad(widget,already);
                }
            }, this);
        },
        /**
         * Add element to <head> of document.  Modeled on domConstruct.create().
         */
        _addHeadElement: function(tag, attrs/*, refNode, pos*/, allowDup) {
            var head = this.getDocumentElement().getChildElement('head');
            if (!allowDup) {
                // Does <head> already have an element that matches the given
                // element?  Only match based on significant attribute.  For
                // example, a <script> element will match if its 'src' attr is the
                // same as the incoming attr.  Same goes for <meta> and its 'name'
                // attr.
                var sigAttr = this._significantAttrs[tag] || 'src';
                var found = head.getChildElements(tag).some(function(elem) {
                    return elem.getAttribute(sigAttr) === attrs[sigAttr];
                });
                if (found) {
                    return;
                }
            }

            // add to Model...
            var elem = new HTMLElement(tag);
            for (var name in attrs) if (attrs.hasOwnProperty(name)) {
                elem.addAttribute(name, attrs[name]);
            }
            head.addChild(elem);

            // add to DOM...
            dojo.withGlobal(this.getGlobal(), function() {
                domConstruct.create(tag, attrs, query('head')[0]);
            });
        },
        /**
         * Remove element from <head> that matches given tag and attributes.
         */
        _removeHeadElement: function(tag, attrs) {
            var head = this.getDocumentElement().getChildElement('head');

            // remove from Model...
            head.getChildElements(tag).some(function(elem) {
                var found = true;
                for (var name in attrs) if (attrs.hasOwnProperty(name)) {
                    if (elem.getAttribute(name) !== attrs[name]) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    head.removeChild(elem);
                    return true;	// break some() iteration
                }
            });

            // remove from DOM...
            dojo.withGlobal(this.getGlobal(), function() {
                var queryStr = tag;
                for (var name in attrs) {
                    if (attrs.hasOwnProperty(name)) {
                        queryStr += '[' + name + '="' + attrs[name] + '"]';
                    }
                }
                query(queryStr).orphan();
            });
        },
        getDocument: function(){
            var container = this.getContainerNode();
            return container && container.ownerDocument;
        },
        getGlobal: function(){
            var doc = this.getDocument();
            return doc ? windowUtils.get(doc) : null;
        }
    });
});
