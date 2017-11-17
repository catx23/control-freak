/**
 * @module xideve/delite/_ContextJS
 */
define([
    "dojo/_base/declare",
    "dojo/_base/xhr",
    "dojo/Deferred",
    "dojo/promise/all",
    "xide/factory",
    "xide/types",
    "davinci/html/HTMLElement",
    "davinci/html/HTMLText",
    "dojox/html/_base"
], function (declare, xhr, Deferred, all, factory, types, HTMLElement, HTMLText) {
    var debug = false;
    /**
     *
     * @mixin module:xideve/delite/_ContextJS
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        _getAppJsRelativeFile: function () {
            //FIXME: consider inlining.  Is caching necessary?
            if (!this._appJsRelativeFile) {
                this._appJsRelativeFile = this.getRelativeFileString('app.js');
            }
            return this._appJsRelativeFile;
        },
        addJavaScriptSrc: function (url, doUpdateModel, baseSrcPath, skipDomUpdate) {

            debug && console.log('add js source ' + url);
            

            var isDojoJS = /\/dojo.js$/.test(url),
                promises = [];

            if (this._didDojo) {
                return;
            }
            // XXX HACK: Don't add dojo.js to the editor iframe, since it already has an instance.
            //	  Adding it again will overwrite the existing Dojo, breaking some things.
            //	  See bug 7585.
            if (!isDojoJS && !skipDomUpdate) {

                var context = this,
                    absoluteUrl = new dojo._Url(this.getDocument().baseURI, url).toString(); //FIXME: use require.toUrl
                // This xhrGet() used to include `handleAs: "javascript"`, surrounded
                // by a `dojo.withGlobal`.  However, `dojo.eval` regressed in Dojo 1.7,
                // such that it no longer evals using `dojo.global` -- instead evaling
                // into the global context. To work around that, we do our own `eval` call.
                promises.push(xhr.get({
                    url: absoluteUrl,
                    sync: true // XXX -> async, Defer rest of method
                }).then(function (data) {
                    context.getGlobal()['eval'](data);
                }));
            }

            var thiz = this;
            if (doUpdateModel) {
                // update the script if found
                var head = this.getDocumentElement().getChildElement('head'),
                    config = {
                        parseOnLoad: true,
                        async: true,
                        packages: this._getLoaderPackages()
                    },
                    found = head.getChildElements('script').some(function (element) {
                        var elementUrl = element.getAttribute("src");
                        if (elementUrl && elementUrl.indexOf(baseSrcPath) > -1) {
                            if (isDojoJS) {
                                var evtData = {
                                    dojoUrl: url
                                };
                                //import to tell everyone
                                factory.publish(types.EVENTS.ON_SET_DOJO_URL, {
                                    data: evtData,
                                    context: thiz,
                                    editor: thiz.editor
                                }, this);

                                var actualUrl = element.getAttribute('src');
                                if (/\/dojo.js$/.test(actualUrl)) {

                                } else {
                                    debug && console.log('add custom script, url=' + actualUrl);
                                    thiz.addHeaderScript(actualUrl);
                                }
                            } else {

                                var _doc = thiz.getGlobal().document;
                                var script = _doc.createElement('script');
                                script.type = 'text/javascript';
                                script.src = url;
                                head.appendChild(script);
                            }
                            return true;
                        } else {
                            thiz.addHeaderScript(elementUrl);
                        }
                    });

                // Make sure we include all custom widget packages in the data-dojo-config in the model
                config.packages = config.packages.concat(this._customWidgetPackages);

                if (found) {
                    if (isDojoJS) {
                        this._updateDojoConfig(config);
                    }
                } else {
                    if (isDojoJS) {
                        // special case for dojo.js to provide config attribute
                        // XXX TODO: Need to generalize in the metadata somehow.

                        var evtData = {
                            dojoUrl: url
                        };

                        //import to tell everyone
                        factory.publish(types.EVENTS.ON_SET_DOJO_URL, {
                            data: evtData,
                            context: this,
                            editor: this.editor
                        }, this);


                        this.addHeaderScript(url, {
                            "data-dojo-config": JSON.stringify(config).slice(1, -1).replace(/"/g, "'")
                        });

                        // TODO: these two dependencies should be part of widget or library metadata
                        /*promises.push(this.addJavaScriptModule("dijit/dijit", true, true));*/
                        promises.push(this.addJavaScriptModule("dojo/parser", true, true));
                        this._didDojo = true;
                    } else {
                        this.addHeaderScript(url);
                    }
                }
            } else {
                var doc = this.getDocument();
                dojo.withDoc(doc, function () {

                    var parent = thiz.editor.item.getParent();
                    url = thiz.ctx.getFileManager().getImageUrl({
                        path: parent.path + '/' + url,
                        mount: thiz.editor.item.mount
                    }, false);
                    var script = doc.createElement('script');
                    script.type = 'text/javascript';
                    script.src = url;
                    debug && console.log('add js : ', url);
                    //var head = this.getDocumentElement().getChildElement('head');
                    var headElem = doc.getElementsByTagName('head')[0];
                    headElem.appendChild(script);
                });

            }
            return all(promises);
        },
        addJavaScriptModule: function (mid, doUpdateModel, skipDomUpdate) {
            debug && console.log('add js module' + mid);
            
            var promise = new Deferred();
            if (!skipDomUpdate) {
                this.getGlobal().require([mid], function (module) {
                    promise.resolve(module);
                });
            } else {
                promise.resolve();
            }

            if ((mid.indexOf('deliteful') !== -1 || mid === 'xblox/RunScript' || mid === 'xblox/StyleState' || mid === 'xblox/CSSState') && doUpdateModel) {
             //   promise.resolve();
             //   return promise;
            }

            if (doUpdateModel) {
                if (!this._requireHtmlElem) {
                    // find a script element which has a 'require' call
                    var head = this.getDocumentElement().getChildElement('head'),
                        found;

                    found = head.getChildElements('script').some(function (child) {
                        var script = child.find({
                            elementType: 'HTMLText'
                        }, true);
                        if (script) {
                            if (this._reRequire.test(script.getText())) {
                                // found suitable `require` block
                                this._requireHtmlElem = child;
                                return true; // break 'some' loop
                            }
                        }
                    }, this);

                    if (!found) {
                        // no such element exists yet; create now
                        this._requireHtmlElem = this.addHeaderScriptText('require(["' + mid + '"]);\n');
                        return promise;
                    }
                }

                // insert new `mid` into array of existing `require`
                var scriptText = this._requireHtmlElem.find({
                        elementType: 'HTMLText'
                    }, true),
                    text = scriptText.getText(),
                    m = text.match(this._reRequire),
                    arr = m[1].match(this._reModuleId);
                // check for duplicate
                if (arr.indexOf(mid) === -1) {
                    if (mid !== 'xblox/RunScript') {
                        arr.push(mid);
                        text = text.replace(this._reRequire, 'require(' + JSON.stringify(arr, null, '  ') + ')');
                        scriptText.setText(text);
                        // XXX For some reason, <script> text is handled differently in the
                        //   Model than that of other elements.  I think I only need to call
                        //   setScript(), but the correct process should be to just update
                        //   HTMLText. See issue #1350.
                        scriptText.parent.setScript(text);
                    }
                }
            }

            return promise;
        },
        addJavaScriptText: function (text, doUpdateModel, skipDomUpdate) {
            /* run the requires if there is an iframe */
            debug && console.log('add js text' + text);
            if (!skipDomUpdate) {
                try {
                    this.getGlobal()['eval'](text);
                } catch (e) {
                    var len = text.length;
                    console.error("eval of \"" + text.substr(0, 20) + (len > 20 ? "..." : "") +
                        "\" failed");
                }
            }
            if (doUpdateModel) {
                this.addHeaderScriptText(text);
            }
        },
        addHeaderScript: function (url, attributes) {
            debug && console.log('add header script to context : ' + url, attributes);
            var script = new HTMLElement('script');
            script.addAttribute('type', 'text/javascript');
            script.addAttribute('src', url);
            if (attributes) {
                for (var name in attributes) {
                    script.addAttribute(name, attributes[name]);
                }
            }

            var head = this.getDocumentElement().getChildElement('head');
            head.addChild(script);
        },
        /**
         * Add inline JavaScript to <head>.
         *
         * This function looks for the last inline JS element in <head> which comes
         * after the last <script src='...'> element.  If a script URL exists after
         * the last inline JS element, or if no inline JS element exists, then we
         * create one.
         *
         * @param {string} text inline JS to add
         * @return {HTMLElement} the element which contains added script
         */
        addHeaderScriptText: function (text) {
            var head = this.getDocumentElement().getChildElement('head'),
                scriptText,
                children = head.children,
                i,
                node;

            debug && console.log('add js header text' + text);

            // reverse search; cannot use getChildElements, et al
            for (i = children.length - 1; i >= 0; i--) {
                node = children[i];
                if (node.elementType === 'HTMLElement' && node.tag === 'script') {
                    // Script element will either have inline script or a URL.
                    // If the latter, this breaks with 'inlineScript' equal to 'null'
                    // and a new inline script is created later.  This is done so
                    // that new inline script comes after the latest added JS file.
                    scriptText = node.find({
                        elementType: 'HTMLText'
                    }, true);
                    break;
                }
            }

            if (!scriptText) {
                // create a new script element
                var script = new HTMLElement('script');
                script.addAttribute('type', 'text/javascript');
                script.script = "";
                head.addChild(script);

                scriptText = new HTMLText();
                script.addChild(scriptText);
            }

            var oldText = scriptText.getText();
            if (oldText.indexOf(text) === -1) {
                scriptText.setText(oldText + '\n' + text);
                // XXX For some reason, <script> text is handled differently in the
                //   Model than that of other elements.  I think I only need to call
                //   setScript(), but the correct process should be to just update
                //   HTMLText. See issue #1350.
                scriptText.parent.setScript(oldText + '\n' + text);
            }
            return scriptText.parent;
        }
    });
});