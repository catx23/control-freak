/**
 * @module xideve/delite/_ContextMobile
 */
define([
    "require",
    "dojo/_base/declare",
    "davinci/Theme",
    "dojox/html/_base"
], function (require,declare,Theme) {

    var MOBILE_DEV_ATTR = 'data-maq-device',
        MOBILE_DEV_ATTR_P6 = 'data-maqetta-device',
        MOBILE_ORIENT_ATTR = 'data-maq-orientation',
        MOBILE_ORIENT_ATTR_P6 = 'data-maqetta-device-orientation';
    /**
     *
     * @mixin module:xideve/delite/_ContextMobile
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        /**
         * Retrieve mobile device from Model.
         * @returns {?string} mobile device name
         */
        getMobileDevice: function () {
            var bodyElement = this.getDocumentElement().getChildElement("body");
            if (!bodyElement) {
                return undefined;
            }
            var attvalue = bodyElement.getAttribute(MOBILE_DEV_ATTR);
            var attvalueP6 = bodyElement.getAttribute(MOBILE_DEV_ATTR_P6);
            if (!attvalue && attvalueP6) {
                // Migrate from old attribute name (data-maqetta-device) to new attribute name (data-maq-device)
                bodyElement.removeAttribute(MOBILE_DEV_ATTR_P6);
                bodyElement.setAttribute(MOBILE_DEV_ATTR, attvalueP6);
                attvalue = attvalueP6;
                this.editor._visualChanged();
            }
            return attvalue;
        },
        /**
         * Sets mobile device in Model.
         * @param device {?string} device name
         */
        setMobileDevice: function (device) {
            this.getGlobal()["require"]("dojo/_base/config").mblUserAgent =
                Silhouette.getMobileTheme(device + '.svg');
            var bodyElement = this.getDocumentElement().getChildElement("body");
            if (!device || device == 'none') {
                bodyElement.removeAttribute(MOBILE_DEV_ATTR, device);
            } else {
                bodyElement.addAttribute(MOBILE_DEV_ATTR, device);
            }
        },

        /**
         * Sets the correct CSS files for the given mobile device.
         * @param device {string} device identifier, in form of "iphone" or
         *              "android_340x480" (taken from SVG silhouette file name)
         * @param force {boolean} if true, forces setting of CSS files, even if
         *              'device' is the same as the current device
         */
        setMobileTheme: function (device) {
            var oldDevice = this.getMobileDevice() || 'none';
            if (oldDevice != device) {
                this.setMobileDevice(device);
            }
            this.close(); //// return any singletons for CSSFiles

            // Need this to be run even if the device is not changed,
            // when the page is loaded the device matches what is in the doc
            // but we need to get dojo in sync.
            try {
                var ua = Silhouette.getMobileTheme(device + '.svg') || "other";
                // dojox/mobile specific CSS file handling
                this._configDojoxMobile();
                //var deviceTheme = this.getGlobal()['require']('dojox/mobile/deviceTheme');
                //deviceTheme.loadDeviceTheme(ua);
            } catch (e) {
                // dojox/mobile/deviceTheme not loaded
            }
        },

        /**
         * Retrieves the mobile orientation.
         * @returns {?string} orientation
         */
        getMobileOrientation: function () {
            var bodyElement = this.getDocumentElement().getChildElement("body");
            var attvalue = bodyElement.getAttribute(MOBILE_ORIENT_ATTR);
            var attvalueP6 = bodyElement.getAttribute(MOBILE_ORIENT_ATTR_P6);
            if (!attvalue && attvalueP6) {
                // Migrate from old attribute name (data-maqetta-orientation) to new attribute name (data-maq-orientation)
                bodyElement.removeAttribute(MOBILE_ORIENT_ATTR_P6);
                bodyElement.setAttribute(MOBILE_ORIENT_ATTR, attvalueP6);
                attvalue = attvalueP6;
                this.editor._visualChanged();
            }
            return attvalue;
        },

        /**
         * Sets mobile orientation in Model.
         * @param orientation {?string} orientation
         */
        setMobileOrientation: function (orientation) {
            var bodyElement = this.getDocumentElement().getChildElement("body");
            if (orientation) {
                bodyElement.setAttribute(MOBILE_ORIENT_ATTR, orientation);
            } else {
                bodyElement.removeAttribute(MOBILE_ORIENT_ATTR);
            }
        },
        /**
         * @static
         */
        _mobileMetaElement: {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0, user-scalable=no'
        },
        setMobileMeta: function (deviceName) {
            if (deviceName === 'none') {
                this._removeHeadElement('meta', this._mobileMetaElement);
            } else {
                this._addHeadElement('meta', this._mobileMetaElement);
            }
        },
        _configDojoxMobile: function (loading) {
            
            // dojox.mobile.configDeviceTheme should run only the first time dojox.mobile.deviceTheme runs, to establish
            // monitoring of which stylesheets get loaded for a given theme
            try {
                var innerRequire = this.getGlobal()['require'],
                    dm = innerRequire('dojox/mobile'),
                    deviceTheme = innerRequire('dojox/mobile/deviceTheme'),
                    djConfig = this.getGlobal().dojo.config,  // TODO: use require
                    djConfigModel = this._getDojoJsElem().getAttribute('data-dojo-config'),
                    ua = djConfig.mblUserAgent || 'none',
                    themeMap,
                    themeFiles,
                    mblLoadCompatPattern;

                djConfigModel = djConfigModel ? require.eval("({ " + djConfigModel + " })", "data-dojo-config") : {};
                themeMap = djConfigModel.themeMap;
                themeFiles = djConfigModel.mblThemeFiles;
                mblLoadCompatPattern = djConfigModel.mblLoadCompatPattern;

                // clear dynamic CSS
                delete this.themeCssFiles;
                delete this.cssFiles;

                // load CSS files specified by `themeMap`
                if (!themeMap) {
                    // load defaults if not defined in file
                    themeMap = Theme.getDojoxMobileThemeMap(this, dojo.clone(Theme.dojoMobileDefault));
                    themeFiles = [];
                    // Add the theme path so dojo can locate the *-compat.css files, if any
                    //mblLoadCompatPattern=/\/themes\/.*\.css$/;
                    var themePath = Theme.getThemeLocation().toString().replace(/\//g, '\\/');
                    //var re = new RegExp('\/'+themePath+'\/.*\.css$');
                    var re = new RegExp(''); //*-compat files not used
                    mblLoadCompatPattern = re;
                }

                //this._addCssForDevice(ua, themeMap, this);//xmaqhack
                loading = false;
                if (!Theme.themeMapsEqual(deviceTheme.themeMap, themeMap)) {
                    loading = false;
                    deviceTheme.themeMap = themeMap;		// djConfig.themeMap = themeMap;
                }

                if (themeFiles) {
                    djConfig.mblThemeFiles = themeFiles;
                } else {
                    delete djConfig.mblThemeFiles;
                }
                if (mblLoadCompatPattern) {
                    djConfig.mblLoadCompatPattern = mblLoadCompatPattern;
                    dm.loadCompatPattern = mblLoadCompatPattern;
                } else {
                    delete djConfig.mblLoadCompatPattern;
                    // put the dojo defalut back
                    dm.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;
                }

                if (this._selection) {
                    // forces style palette to update cascade rules
                    this.onSelectionChange(this._selection);
                }
                if (!loading) {
                    // if we are loading the reqire of deviceTheme will have already done this
                    deviceTheme.loadDeviceTheme(ua);
                }
            } catch (e) {
                // dojox/mobile wasn't loaded
                debugger;
            }
        }
    });
});
