/**
 * @module xideve/delite/_ContextCSS
 */
define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/_base/connect",
    'system/resource',
    "davinci/model/Path",
    "davinci/Workbench",
    "davinci/ve/widget",
    "davinci/ve/States",
    "davinci/ve/utils/pseudoClass",
    "dojox/html/_base"
], function (declare, domConstruct, query, connect, systemResource, Path, Workbench, Widget, States, pseudoClass) {

    var debugResources = false;
    /**
     *
     * @mixin module:xideve/delite/_ContextCSS
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        getStyleAttributeValues: function (widget) {
            //FIXME: This totally seems to have missed the array logic
            var vArray = widget ? widget.getStyleValues() : [];
            var stateContainers = States.getStateContainersForNode(widget.domNode);
            var isNormalState = true;
            for (var sc = 0; sc < stateContainers.length; sc++) {
                var stateContainer = stateContainers[sc];
                var state = States.getState(stateContainer);
                if (state && state != States.NORMAL) {
                    isNormalState = false;
                    break;
                }
            }
            if (!isNormalState) {
                var currentStatesList = davinci.ve.states.getStatesListCurrent(widget.domNode);
                var stateStyleValuesArray = davinci.ve.states.getStyle(widget.domNode, currentStatesList);
                if (stateStyleValuesArray) {
                    // Remove entries from vArray that are in stateStyleValuesArray
                    for (var i = 0; i < stateStyleValuesArray.length; i++) {
                        var sItem = stateStyleValuesArray[i];
                        for (var sProp in sItem) {	// should be only object in each array item
                            for (var j = vArray.length - 1; j >= 0; j--) {
                                var vItem = vArray[j];
                                for (var vProp in vItem) {	// should be only object in each array item
                                    if (sProp == vProp) {
                                        vArray.splice(j, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    // Concat entries from stateStyleValuesArray to end of vArray
                    vArray = vArray.concat(stateStyleValuesArray);
                }
            }
            return vArray;
        },
        addPseudoClassSelectors: function (selectors) {

            var updateSheet = function (sheet) {
                if (sheet) {
                    var rules = sheet.cssRules;
                    var r = 0;
                    for (r = 0; r < rules.length; r++) {
                        // NOTE: For some reason the instanceof check does not work on Safari..
                        // So we are testing the constructor instead, but we have to test it as a string...
                        var y = rules[r];
                        if (y.type && y.type === CSSRule.IMPORT_RULE) {
                            updateSheet(rules[r].styleSheet);
                        } else if (rules[r].type == CSSRule.STYLE_RULE) {
                            var selectorText = rules[r].selectorText;
                            if (selectorText.indexOf(":") > -1) {
                                selectorText = pseudoClass.replace(selectorText);
                                /*
                                 * For now we will just replace the selector text,
                                 * if this does not work well we can just append
                                 */
                                y.selectorText = selectorText;
                                /* delete the rule if it exists */
                                sheet.deleteRule(r);
                                sheet.insertRule(y.cssText, r);
                                break;
                            }
                        }
                    }
                    return true;
                }
                return false;
            };

            dojo.some(this.getDocument().styleSheets, updateSheet);
        },
        //FIXME: candidate to move to a separate module
        hotModifyCssRule: function (r) {

            function updateSheet(sheet, rule) {
                var url = systemResource.findResource(rule.parent.url).getURL(); // FIXME: can we skip findResource?
                var fileName = encodeURI(url); // FIXME: corresponding rule we compare this to is url encoded, but probably shouldn't be?
                var selectorText = rule.getSelectorText();
                if (selectorText.indexOf(":") > -1) {
                    selectorText = pseudoClass.replace(selectorText);
                }
                //console.log("------------  Hot Modify looking  " + fileName + " ----------------:=\n" + selectorText + "\n");
                selectorText = selectorText.replace(/^\s+|\s+$/g, ""); // trim white space
                //var rules = sheet.cssRules;
                var foundSheet = findSheet(sheet, fileName);
                if (foundSheet) {
                    var rules = foundSheet.cssRules;
                    for (var r = 0; r < rules.length; r++) {
                        if (rules[r].type && rules[r].type == CSSRule.STYLE_RULE) {
                            if (rules[r].selectorText == selectorText) {
                                /* delete the rule if it exists */
                                foundSheet.deleteRule(r);
//							console.log("------------  Hot Modify delete " + foundSheet.href + "index " +r+" ----------------:=\n" + selectorText + "\n");

                                break;
                            }
                        }
                    }
                    if (rule.properties.length) { // only insert rule if it has properties
                        var text = rule.getText({noComments: true});
                        if (text.indexOf(":") > -1) {
                            text = pseudoClass.replace(text);
                        }
//					console.log("------------  Hot Modify Insert " + foundSheet.href +  "index " +r+" ----------------:=\n" + text + "\n");
                        foundSheet.insertRule(text, r);
                    }
                    return true;
                }
                return false;
            }

            function findSheet(sheet, sheetName) {
                if (sheet.href == sheetName) {
//				console.log("------------  Hot foundsheet " +  sheetName + "\n");
                    return sheet;
                }
                var foundSheet;
                var rules = sheet.cssRules;
                for (var r = 0; r < rules.length; r++) {
                    var x = '' + rules[r].constructor;
                    if (rules[r].type && rules[r].type === CSSRule.IMPORT_RULE) {
                        var n = rules[r].href;
                        if (rules[r].href == sheetName) {
                            foundSheet = rules[r].styleSheet;
                            //break;
                        } else { // it might have imports
                            foundSheet = findSheet(rules[r].styleSheet, sheetName);
                        }
                        if (foundSheet) {
                            break;
                        }
                    }
                }
                return foundSheet;
            }

            dojo.some(this.getDocument().styleSheets, function (sheet) {
                return updateSheet(sheet, r);
            });
        },
        /**
         * Remove style sheet from page's DOM.
         * @param url {string}
         */
        unloadStyleSheet: function (url) {
            var userWin = this.getGlobal();
            if (userWin && userWin["require"]) {
                var query = userWin["require"]("dojo/query");
                query('link').filter(function (node) {
                    return node.getAttribute('href') == url;
                }).forEach(domConstruct.destroy);
            }
        },

        addModeledStyleSheet: function (url, skipDomUpdate) {
            if (!skipDomUpdate) {
                debugResources && console.log('addModeledStyleSheet ' + url);
                this.loadStyleSheet(url);
            }

            if (!this.model.hasStyleSheet(url)) {
                debugResources && console.log('dont have this stylesheet yet ' + url);
                // Make sure app.css is the last CSS file within the list of @import statements
                // FIXME: Shouldn't hardcode this sort of thing
                var isAppCss = url.indexOf('app.css') > -1;
                var appCssImport;
                var styleElem = this.model.find({elementType: "HTMLElement", tag: 'style'}, true);
                if (styleElem) {
                    var kids = styleElem.children;
                    for (var i = 0; i < kids.length; i++) {
                        if (kids[i].url.indexOf('app.css') > -1) {
                            appCssImport = kids[i];
                        }
                    }
                }
                var beforeChild = isAppCss ? undefined : appCssImport;
                this.model.addStyleSheet(url, undefined, undefined, beforeChild);

                for (var css in this.model._loadedCSS) {
                    this._loadedCSSConnects.push(
                        connect.connect(this.model._loadedCSS[css], 'onChange', this, '_themeChange'));
                }
            }
        },
        /**
         * Load the style sheet into the page's DOM.
         * @param url {string}
         */
        loadStyleSheet: function (url) {

            debugResources && console.log('load stylesheet ' +url);

            //@TODO : stylesheets in _ContextDocument wrong
            url = url.replace('././','./');

            var doc = this.getDocument(),
                query = this.getGlobal()["require"]("dojo/query"),
                links = query('link'),
                editorItem = this.getVisualEditor().item;

            if (links.some(function (val) {
                    return val.getAttribute('href') === url;
                })) {
                // don't add if stylesheet is already loaded in the page
                return;
            }
            var thiz = this;
            if(!this._extraSheets){
                this._extraSheets = {};
            }

            dojo.withDoc(doc, function () {

                // Make sure app.css is the after library CSS files, and content.css is after app.css
                // FIXME: Shouldn't hardcode this sort of thing
                var headElem = doc.getElementsByTagName('head')[0],
                    isAppCss = url.indexOf('app.css') > -1,
                    isContentCss = url.indexOf('content.css') > -1,
                    isClaro = url.indexOf('claro.css') > -1,
                    isDocumentCss = url.indexOf('claro/document.css') > -1,
                    isCustom = isAppCss==false && isContentCss==false,
                    appCssLink, contentCssLink;


                var customItem = null;

                if (isCustom) {
                    //resolve url via xfile
                    var ctx = Workbench.ctx;
                    var defaultWorkSpace = editorItem.mount || 'workspace_user';

                    var item = {
                        path: url,
                        mount: defaultWorkSpace
                    };
                    var newUrl = ctx.getFileManager().getImageUrl(item);
                    customItem = {
                        resolvedUrl : newUrl,
                        mount:defaultWorkSpace,
                        path:'' + url
                    };
                    thiz._extraSheets[url]=customItem;
                    url = newUrl;

                }

                var newLink = domConstruct.create('link', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: url,
                    id: customItem ? customItem.path : ''
                });

                if(customItem){
                    customItem.link = newLink;
                }

                links.forEach(function (link) {
                    if (link.href.indexOf('app.css') > -1) {
                        appCssLink = link;
                    } else if (link.href.indexOf('content.css') > -1) {
                        /*contentCssLink = link;*/
                    }
                });

                var beforeChild;
                if (!isContentCss) {
                    if (isAppCss && contentCssLink) {
                        beforeChild = contentCssLink;
                    } else {
                        beforeChild = appCssLink;
                    }
                }


                if (!isCustom) {

                    if (beforeChild) {
                        headElem.insertBefore(newLink, beforeChild);
                    } else {
                        headElem.appendChild(newLink);
                    }
                } else {
                    headElem.appendChild(newLink);
                }
            });
        },
        getStyle: function () {
            return this._header ? this._header.style : undefined;
        },

        setStyle: function (style) {
            var values = (Widget.parseStyleValues(style));
            if (this._header) {
                var oldValues = Widget.parseStyleValues(this._header.style);
                if (oldValues) {
                    for (var name in oldValues) {
                        if (!values[name]) {
                            values[name] = undefined; // to remove
                        }
                    }
                }
                this._header.style = style;
            } else {
                this._header = {style: style};
            }
            /* TODO: implement Context::setStyle */
            //Widget.setStyleValues(this.container, values); //TODO
        },
        //FIXME: consider inlining.  Is caching necessary?
        getAppCssRelativeFile: function () {
            if (!this._appCssRelativeFile) {
                this._appCssRelativeFile = this.getRelativeFileString('app.css');
            }
            return this._appCssRelativeFile;
        },
        _addCssForDevice: function (localDevice, themeMap, context) {
            for (var i = 0, len = themeMap.length; i < len; i++) {
                var item = themeMap[i];
                if (item[0] === localDevice || item[0] === '.*') {
                    if (!this.themeCssFiles) {
                        this.themeCssFiles = [];
                    }
                    var cssFiles = item[2];
                    this.themeCssFiles = this.themeCssFiles.concat(cssFiles);

                    this._themePath = new Path(this.visualEditor.fileName);
                    // Connect to the css files, so we can update the canvas when
                    // the model changes.
                    this._getCssFiles().forEach(function (file) {
                        this._loadedCSSConnects.push(connect.connect(file, 'onChange', this, '_themeChange'));
                    }, this);

                    break;
                }
            }
        }
    });
});
