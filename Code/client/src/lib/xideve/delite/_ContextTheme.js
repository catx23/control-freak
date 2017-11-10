/**
 * @module xideve/delite/_ContextTheme
 */
define([
    "dojo/_base/declare",
    "davinci/Theme",
    "davinci/model/Path",
    "davinci/Workbench",
    "davinci/library",
    "davinci/ve/metadata",
    "dojox/html/_base"
], function (declare,Theme,Path,Workbench,Library,metadata) {
    /**
     *
     * @mixin module:xideve/delite/_ContextMobile
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        getTheme: function () {
            if (!this.theme) {
                var theme = metadata.loadThemeMeta(this._srcDocument);
                if (theme) { // wdr #1024
                    this._themeUrl = theme.themeUrl;
                    this._themeMetaCache = theme.themeMetaCache;
                    this.theme = theme.theme;
                    this.theme.helper = Theme.getHelper(this.theme);
                    if (this.theme.helper && this.theme.helper.then) { // it might not be loaded yet so check for a deferred
                        this.theme.helper.then(function (result) {
                            if (result.helper) {
                                this.theme.helper = result.helper;
                            }
                        }.bind(this));
                    }
                }
            }
            return this.theme;
        },
        getThemeMeta: function () {
            if (!this._themeMetaCache) {
                this.getTheme();
            }
            return this._themeMetaCache;
        },
        themeChanged: function () {
            var changed = true;
            // check for false alarms to avoid reloading theme
            var model = this.getModel();
            if (this._themeUrl) {
                var style = model.find({elementType: 'CSSImport', url: this._themeUrl}, true);
                if (style) {
                    changed = false;
                }
            }
            if (changed) {
                this.theme = null;
                this._themeMetaCache = null;
            }
        },
        /* ensures the file has a valid theme.  Adds the users default if its not there already */
        loadTheme: function (newHtmlParms) {
            /*
             * Ensure the model has a default theme.  Defaulting to Claro for now, should
             * should load from prefs
             *
             * */
            var model = this.getModel();

            var defaultThemeName = "claro";
            if (newHtmlParms && newHtmlParms.themeSet) {
                defaultThemeName = newHtmlParms.themeSet.desktopTheme;
            } else if (newHtmlParms && newHtmlParms.theme) {
                if (newHtmlParms.theme == 'deviceSpecific') {
                    defaultThemeName = "claro";
                } else {
                    defaultThemeName = newHtmlParms.theme;
                }
            }
            var imports = model.find({elementType: 'CSSImport'});

            /* remove the .theme file, and find themes in the given base location */
            var allThemes = Library.getThemes(Workbench.getProject()),
                themeHash = {},
                defaultTheme;

            allThemes.forEach(function (theme) {
                if (theme.name == defaultThemeName) {
                    defaultTheme = theme;
                }

                if (theme.files) { // #1024 some themes may not contain files, themeMaps
                    theme.files.forEach(function (file) {
                        themeHash[file] = theme;
                    });
                }
            });

            if (defaultTheme == null) {
                console.error('couldnt find default theme, abort!!');
                console.dir(newHtmlParms);
                return false;


            }

            if (defaultTheme.getFile == null) {
                console.error('default theme in invalid state, abort!!');
                console.dir(newHtmlParms);
                return false;


            }

            /* check the header file for a themes CSS.
             *
             * TODO: This is a first level check, a good second level check
             * would be to grep the body classes for the themes className. this would be a bit safer.
             */

            if (imports.some(function (imp) {
                    /* trim off any relative prefix */
                    for (var themeUrl in themeHash) {
                        if (imp.url.indexOf(themeUrl) > -1) {
                            // theme already exists
                            return true;
                        }
                    }
                })) {
                return true;
            }

            var body = model.find({elementType: 'HTMLElement', tag: 'body'}, true);
            body.setAttribute("class", defaultTheme.className);
            /* add the css */

            var tFile = defaultTheme.getFile();

            if (tFile == null || tFile.getPath == null) {
                console.error('default theme file in invalid state, abort!!');
                console.dir(newHtmlParms);
                return true;
            }
            var filePath = defaultTheme.getFile().getPath();
            defaultTheme.files.forEach(function (file) {
                var url = new Path(filePath).removeLastSegments(1).append(file).relativeTo(this.getPath(), true);
                this.addModeledStyleSheet(url.toString(), true);
            }, this);
        },
        _themeChange: function (e) {
            //FIXME: refactor with hotModifyCSSRule to another module and use in both PageEditor and ThemeEditor
            if (e && e.elementType === 'CSSRule') {
                this.editor.setDirty(true); // a rule change so the CSS files are dirty. we need to save on exit
                this.hotModifyCssRule(e);
            }
        }
    });
});
