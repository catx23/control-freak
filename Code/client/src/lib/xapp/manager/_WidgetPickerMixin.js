define([
    "dcl/dcl",
    'dojo/_base/declare',
    "dojo/dom-class",
    "dojo/dom-construct",
    'xide/utils',
    'xide/registry'
],function(dcl,declare,domClass,domConstruct,utils,registry){

        var outlineVisible = false;
        var boxModelVisible = false;
        var outlineElements = {};
        var isIE =false;
        var isIEStantandMode=false;
        var offlineFragment = null;
        var boxModel, boxModelStyle,
            boxMargin, boxMarginStyle,
            boxBorder, boxBorderStyle,
            boxPadding, boxPaddingStyle,
            boxContent, boxContentStyle;

        var outline = {
            "fbOutlineT": "fbHorizontalLine",
            "fbOutlineL": "fbVerticalLine",
            "fbOutlineB": "fbHorizontalLine",
            "fbOutlineR": "fbVerticalLine"
        };

        var outlineStyle = {
            fbHorizontalLine: "background: #00d706;height: 2px;",
            fbVerticalLine: "background: #00d706;width: 2px;"
        };

        var resetStyle = "margin:0; padding:0; border:0; position:absolute; overflow:hidden; display:block;";
        var offscreenStyle = resetStyle + "top:-1234px; left:-1234px;";

        var inspectStyle = resetStyle + "z-index: 2147483500;";
        var inspectModelOpacity = isIE ? "filter:alpha(opacity=80);" : "opacity:0.8;";
        var inspectModelStyle = inspectStyle + inspectModelOpacity;
        var inspectMarginStyle = inspectStyle + "background: #EDFF64; height:100%; width:100%;";
        var inspectBorderStyle = inspectStyle + "background: #666;";
        var inspectPaddingStyle = inspectStyle + "background: SlateBlue;";
        var inspectContentStyle = inspectStyle + "background: SkyBlue;";

        var createBoxModelInspector = function createBoxModelInspector(){
            boxModel = domConstruct.create("div");
            boxModel.id = "fbBoxModel";
            boxModel.firebugIgnore = true;
            boxModelStyle = boxModel.style;
            boxModelStyle.cssText = inspectModelStyle;

            boxMargin = domConstruct.create("div");
            boxMargin.id = "fbBoxMargin";
            boxMarginStyle = boxMargin.style;
            boxMarginStyle.cssText = inspectMarginStyle;
            boxModel.appendChild(boxMargin);

            boxBorder = domConstruct.create("div");
            boxBorder.id = "fbBoxBorder";
            boxBorderStyle = boxBorder.style;
            boxBorderStyle.cssText = inspectBorderStyle;
            boxModel.appendChild(boxBorder);

            boxPadding = domConstruct.create("div");
            boxPadding.id = "fbBoxPadding";
            boxPaddingStyle = boxPadding.style;
            boxPaddingStyle.cssText = inspectPaddingStyle;
            boxModel.appendChild(boxPadding);

            boxContent = domConstruct.create("div");
            boxContent.id = "fbBoxContent";
            boxContentStyle = boxContent.style;
            boxContentStyle.cssText = inspectContentStyle;
            boxModel.appendChild(boxContent);

            offlineFragment.appendChild(boxModel);
        };
        var createOutlineInspector = function createOutlineInspector()
        {
            for (var name in outline)
            {
                var el = outlineElements[name] = domConstruct.create("div");
                el.id = name;
                el.firebugIgnore = true;
                el.style.cssText = inspectStyle + outlineStyle[outline[name]];
                offlineFragment.appendChild(el);
            }
        };
        var destroyBoxModelInspector = function destroyBoxModelInspector()
        {
            boxModel.parentNode.removeChild(boxModel);
        };

        var destroyOutlineInspector = function destroyOutlineInspector()
        {
            for (var name in outline)
            {
                var el = outlineElements[name];
                el.parentNode.removeChild(el);
            }
        };


        return dcl(null,{
            declaredClass:"xide.widgets._WidgetPickerMixin",
            _inspectFrame:null,
            _isInspecting:false,
            _lastInspecting:0,
            inspectorMask:{
            },
            shouldShowOutline:function(el){
            },
            getWindowSize: function()
            {
                var width=0, height=0, el;

                if (typeof this.window.innerWidth == "number")
                {
                    width = this.window.innerWidth;
                    height = this.window.innerHeight;
                }
                else if ((el=this.document.documentElement) && (el.clientHeight || el.clientWidth))
                {
                    width = el.clientWidth;
                    height = el.clientHeight;
                }
                else if ((el=this.document.body) && (el.clientHeight || el.clientWidth))
                {
                    width = el.clientWidth;
                    height = el.clientHeight;
                }

                return {width: width, height: height};
            },
            addEvent:function(object, name, handler, useCapture)
            {
                if (object.addEventListener)
                    object.addEventListener(name, handler, useCapture);
                else
                    object.attachEvent("on"+name, handler);
            },
            removeEvent : function(object, name, handler, useCapture)
            {
                try
                {
                    if (object.removeEventListener)
                        object.removeEventListener(name, handler, useCapture);
                    else
                        object.detachEvent("on"+name, handler);
                }
                catch(e)
                {

                }
            },
            getWindowScrollSize: function()
            {
                var width=0, height=0, el,isIEQuiksMode =false;

                // first try the document.documentElement scroll size
                if (!isIEQuiksMode && (el=this.document.documentElement) &&
                    (el.scrollHeight || el.scrollWidth))
                {
                    width = el.scrollWidth;
                    height = el.scrollHeight;
                }

                // then we need to check if document.body has a bigger scroll size value
                // because sometimes depending on the browser and the page, the document.body
                // scroll size returns a smaller (and wrong) measure
                if ((el=this.document.body) && (el.scrollHeight || el.scrollWidth) &&
                    (el.scrollWidth > width || el.scrollHeight > height))
                {
                    width = el.scrollWidth;
                    height = el.scrollHeight;
                }

                return {width: width, height: height};
            },
            getElementFromPoint: function(x, y)
            {
                var shouldFixElementFromPoint=false;
                if (shouldFixElementFromPoint)
                {
                    var scroll = this.getWindowScrollPosition();
                    return this.document.elementFromPoint(x + scroll.left, y + scroll.top);
                }
                else
                    return this.document.elementFromPoint(x, y);
            },
            getWindowScrollPosition: function()
            {
                var top=0, left=0, el;

                if(typeof this.window.pageYOffset == "number")
                {
                    top = this.window.pageYOffset;
                    left = this.window.pageXOffset;
                }
                else if((el=this.document.body) && (el.scrollTop || el.scrollLeft))
                {
                    top = el.scrollTop;
                    left = el.scrollLeft;
                }
                else if((el=this.document.documentElement) && (el.scrollTop || el.scrollLeft))
                {
                    top = el.scrollTop;
                    left = el.scrollLeft;
                }

                return {top:top, left:left};
            },
            getElementPosition: function(el)
            {
                var left = 0;
                var top = 0;

                do
                {
                    left += el.offsetLeft;
                    top += el.offsetTop;
                }
                while (el = el.offsetParent);

                return {left:left, top:top};
            },
            getElementBox: function(el)
            {
                var result = {};

                if (el.getBoundingClientRect)
                {
                    var rect = el.getBoundingClientRect();

                    // fix IE problem with offset when not in fullscreen mode
                    var offset = 0;//BrowserDetection.IE ?  this.document.body.clientTop || this.document.documentElement.clientTop: 0;

                    var scroll = this.getWindowScrollPosition();

                    result.top = Math.round(rect.top - offset + scroll.top);
                    result.left = Math.round(rect.left - offset + scroll.left);
                    result.height = Math.round(rect.bottom - rect.top);
                    result.width = Math.round(rect.right - rect.left);
                }
                else
                {
                    var position = this.getElementPosition(el);

                    result.top = position.top;
                    result.left = position.left;
                    result.height = el.offsetHeight;
                    result.width = el.offsetWidth;
                }

                return result;
            },
            hideBoxModel: function()
            {
                if (!boxModelVisible) return;

                offlineFragment.appendChild(boxModel);
                boxModelVisible = false;
            },
            hideOutline: function(){
                if (!outlineVisible) return;

                for (var name in outline)
                    offlineFragment.appendChild(outlineElements[name]);

                outlineVisible = false;
            },
            showOutline: function(){

                if (outlineVisible) return;

                if (boxModelVisible) this.hideBoxModel();

                for (var name in outline) {
                    this.document.getElementsByTagName("body")[0].appendChild(outlineElements[name]);
                }

                outlineVisible = true;
            },
            getCSSAutoMarginBox: function(el)
            {
                if (isIE && " meta title input script link a ".indexOf(" "+el.nodeName.toLowerCase()+" ") != -1)
                    return {top:0, left:0, bottom:0, right:0};
                /**/

                if (isIE && " h1 h2 h3 h4 h5 h6 h7 ul p ".indexOf(" "+el.nodeName.toLowerCase()+" ") == -1)
                    return {top:0, left:0, bottom:0, right:0};
                /**/

                var offsetTop = 0;
                if (false && isIEStantandMode)
                {
                    var scrollSize = this.getWindowScrollSize();
                    offsetTop = scrollSize.height;
                }

                var box = this.document.createElement("div");
                //box.style.cssText = "margin:0; padding:1px; border: 0; position:static; overflow:hidden; visibility: hidden;";
                box.style.cssText = "margin:0; padding:1px; border: 0; visibility: hidden;";

                var clone = el.cloneNode(false);
                var text = this.document.createTextNode("&nbsp;");
                clone.appendChild(text);

                box.appendChild(clone);

                this.document.body.appendChild(box);

                var marginTop = clone.offsetTop - box.offsetTop - 1;
                var marginBottom = box.offsetHeight - clone.offsetHeight - 2 - marginTop;

                var marginLeft = clone.offsetLeft - box.offsetLeft - 1;
                var marginRight = box.offsetWidth - clone.offsetWidth - 2 - marginLeft;

                this.document.body.removeChild(box);

                return {top:marginTop+offsetTop, left:marginLeft, bottom:marginBottom-offsetTop, right:marginRight};
            },
            getMeasurementInPixels: function(el, name)
            {
                if (!el) return null;

                var m = this.getMeasurement(el, name);
                var value = m.value;
                var unit = m.unit;

                if (unit == "px")
                    return value;

                else if (unit == "pt")
                    return this.pointsToPixels(name, value);

                else if (unit == "em")
                    return this.emToPixels(el, value);

                else if (unit == "%")
                    return this.percentToPixels(el, value);

                else if (unit == "ex")
                    return this.exToPixels(el, value);

                // TODO: add other units. Maybe create a better general way
                // to calculate measurements in different units.
            },
            getMeasurementBox: function(el, name)
            {
                var result = [];
                var sufixes = name == "border" ?
                    ["TopWidth", "LeftWidth", "BottomWidth", "RightWidth"] :
                    ["Top", "Left", "Bottom", "Right"];

                if (isIE)
                {
                    var propName, cssValue;
                    var autoMargin = null;

                    for(var i=0, sufix; sufix=sufixes[i]; i++)
                    {
                        propName = name + sufix;

                        cssValue = el.currentStyle[propName] || el.style[propName];

                        if (cssValue == "auto")
                        {
                            if (!autoMargin)
                                autoMargin = this.getCSSAutoMarginBox(el);

                            result[i] = autoMargin[sufix.toLowerCase()];
                        }
                        else
                            result[i] = this.getMeasurementInPixels(el, propName);

                    }

                }
                else
                {
                    for(var i=0, sufix; sufix=sufixes[i]; i++)
                        result[i] = this.getMeasurementInPixels(el, name + sufix);
                }

                return {top:result[0], left:result[1], bottom:result[2], right:result[3]};
            },
            drawBoxModel: function(el)
            {
                console.log('-draw');
                // avoid error when the element is not attached a document
                if (!el || !el.parentNode)
                    return;

                var box = this.getElementBox(el);

                var windowSize = this.getWindowSize();
                var scrollPosition = this.getWindowScrollPosition();

                // element may be occluded by the chrome, when in frame mode
                var offsetHeight = 0;//Firebug.chrome.type == "frame" ? Firebug.context.persistedState.height : 0;

                // if element box is not inside the viewport, don't draw the box model
                if (box.top > scrollPosition.top + windowSize.height - offsetHeight ||
                    box.left > scrollPosition.left + windowSize.width ||
                    scrollPosition.top > box.top + box.height ||
                    scrollPosition.left > box.left + box.width )
                    return;

                var top = box.top;
                var left = box.left;
                var height = box.height;
                var width = box.width;

                var margin = Firebug.browser.getMeasurementBox(el, "margin");
                var padding = Firebug.browser.getMeasurementBox(el, "padding");
                var border = Firebug.browser.getMeasurementBox(el, "border");

                boxModelStyle.top = top - margin.top + "px";
                boxModelStyle.left = left - margin.left + "px";
                boxModelStyle.height = height + margin.top + margin.bottom + "px";
                boxModelStyle.width = width + margin.left + margin.right + "px";

                boxBorderStyle.top = margin.top + "px";
                boxBorderStyle.left = margin.left + "px";
                boxBorderStyle.height = height + "px";
                boxBorderStyle.width = width + "px";

                boxPaddingStyle.top = margin.top + border.top + "px";
                boxPaddingStyle.left = margin.left + border.left + "px";
                boxPaddingStyle.height = height - border.top - border.bottom + "px";
                boxPaddingStyle.width = width - border.left - border.right + "px";

                boxContentStyle.top = margin.top + border.top + padding.top + "px";
                boxContentStyle.left = margin.left + border.left + padding.left + "px";
                boxContentStyle.height = height - border.top - padding.top - padding.bottom - border.bottom + "px";
                boxContentStyle.width = width - border.left - padding.left - padding.right - border.right + "px";

                if (!boxModelVisible) this.showBoxModel();
            },
            drawOutline: function(el)
            {
                console.log('-draw outline');
                var border = 2;
                var scrollbarSize = 17;

                var windowSize = this.getWindowSize();
                var scrollSize = this.getWindowScrollSize();
                var scrollPosition = this.getWindowScrollPosition();

                var box = this.getElementBox(el);

                var top = box.top;
                var left = box.left;
                var height = box.height;
                var width = box.width;
                var isIE = false;


                //console.dir(outlineElements);
                var freeHorizontalSpace = scrollPosition.left + windowSize.width - left - width -
                    (!isIE && scrollSize.height > windowSize.height ? // is *vertical* scrollbar visible
                        scrollbarSize : 0);

                var freeVerticalSpace = scrollPosition.top + windowSize.height - top - height -
                    (!isIE && scrollSize.width > windowSize.width ? // is *horizontal* scrollbar visible
                        scrollbarSize : 0);

                var numVerticalBorders = freeVerticalSpace > 0 ? 2 : 1;

                var o = outlineElements;
                var style;

                style = o.fbOutlineT.style;
                style.top = top-border + "px";
                style.left = left + "px";
                style.height = border + "px";  // TODO: on initialize()
                style.width = width + "px";

                style = o.fbOutlineL.style;
                style.top = top-border + "px";
                style.left = left-border + "px";
                style.height = height+ numVerticalBorders*border + "px";
                style.width = border + "px";  // TODO: on initialize()

                style = o.fbOutlineB.style;
                if (freeVerticalSpace > 0)
                {
                    style.top = top+height + "px";
                    style.left = left + "px";
                    style.width = width + "px";
                    //style.height = border + "px"; // TODO: on initialize() or worst case?
                }
                else
                {
                    style.top = -2*border + "px";
                    style.left = -2*border + "px";
                    style.width = border + "px";
                    //style.height = border + "px";
                }

                style = o.fbOutlineR.style;
                if (freeHorizontalSpace > 0)
                {
                    style.top = top-border + "px";
                    style.left = left+width + "px";
                    style.height = height + numVerticalBorders*border + "px";
                    style.width = (freeHorizontalSpace < border ? freeHorizontalSpace : border) + "px";
                }
                else
                {
                    style.top = -2*border + "px";
                    style.left = -2*border + "px";
                    style.height = border + "px";
                    style.width = border + "px";
                }

                if (!outlineVisible) this.showOutline();
            },
            onInspecting: function(e) {

                if (new Date().getTime() - this._lastInspecting > 30) {

                    this._inspectFrame.style.display = "none";
                    var targ = this.getElementFromPoint(e.clientX, e.clientY);

                    this._inspectFrame.style.display = "block";

                    // Avoid inspecting the outline, and the FirebugUI
                    var id = targ.id;
                    if (id && /^fbOutline\w$/.test(id)) return;
                    if (id == "FirebugUI") return;

                    // Avoid looking at text nodes in Opera
                    while (targ.nodeType != 1) targ = targ.parentNode;

                    if (targ.nodeName.toLowerCase() == "body") return;


                    //decided by sub class
                    if(this.isPickable){

                        if(this.isPickable(targ)){
                            this.drawOutline(targ);
                        }else{
                            //console.log('skip !');
                            return;
                        }
                    }else {
                        this.drawOutline(targ);
                    }

/*
                    if (ElementCache(targ)) {
                        var target = "" + ElementCache.key(targ);
                        var lazySelect = function () {
                            inspectorTS = new Date().getTime();

                            if (Firebug.HTML)
                                Firebug.HTML.selectTreeNode("" + ElementCache.key(targ));
                        };

                        if (inspectorTimer) {
                            clearTimeout(inspectorTimer);
                            inspectorTimer = null;
                        }

                        if (new Date().getTime() - inspectorTS > 200)
                            setTimeout(lazySelect, 0);
                        else
                            inspectorTimer = setTimeout(lazySelect, 300);
                    }
*/
                    this._lastInspecting = new Date().getTime();
                }
            },
            destroyInspectorFrame:function (){
                if (this._inspectFrame)
                {
                    this.document.getElementsByTagName("body")[0].removeChild(this._inspectFrame);
                    this._inspectFrame = null;
                }
            },
            stopInspecting: function()
            {
                this._isInspecting= false;

                if (outlineVisible) this.hideOutline();

                this.removeEvent(this._inspectFrame, "mousemove", this.onInspecting);
                this.removeEvent(this._inspectFrame, "mousedown", this.onInspectingClick);
                this.destroyInspectorFrame();
                //Firebug.chrome.inspectButton.restore();
            },
            onInspectingClick: function(e)
            {
                this._inspectFrame.style.display = "none";
                var targ = this.getElementFromPoint(e.clientX, e.clientY);
                this._inspectFrame.style.display = "block";

                // Avoid inspecting the outline, and the FirebugUI
                var id = targ.id;
                if (id && /^fbOutline\w$/.test(id)) return;
                if (id == "FirebugUI") return;

                // Avoid looking at text nodes in Opera
                while (targ.nodeType != 1) targ = targ.parentNode;
                //console.log(targ);
                if(this.onNodePicked){
                    this.onNodePicked(targ);
                }
                this.stopInspecting();
                this._destroy();
            },
            _destroy: function()
            {
                destroyBoxModelInspector();
                destroyOutlineInspector();

                offlineFragment = null;
            },
            _createInspectorFrame:function()
            {
                var resetStyle = "margin:0; padding:0; border:0; position:absolute; overflow:hidden; display:block;";

                //var inspectFrameStyle = resetStyle + "z-index: 2147483550; top:0; left:0; background:url(" +"pixel_transparent.gif);";
                var inspectFrameStyle = resetStyle + "z-index: 2147483550; top:0; left:0;";

                this._inspectFrame= domConstruct.create('div',{

                });

                this._inspectFrame.style.cssText = inspectFrameStyle;
                this.document.getElementsByTagName("body")[0].appendChild(this._inspectFrame);

                var size = this.getWindowScrollSize();
                var thiz = this;

                this._inspectFrame.style.width = size.width + "px";
                this._inspectFrame.style.height = size.height + "px";

                this.addEvent(this._inspectFrame, "mousemove", function(e){
                    thiz.onInspecting(e);
                });
                this.addEvent(this._inspectFrame, "mousedown", function(e){
                    thiz.onInspectingClick(e);
                });

            },
            initInspector : function(){
                offlineFragment = document.createDocumentFragment();
                createBoxModelInspector();
                createOutlineInspector();
            },
            isPickable: function (node) {

                if (this.allowWidgets) {
                    var widget = registry.getEnclosingWidget(node);
                    if (widget) {
                        if (this.skipWidgetClasses.indexOf(widget.declaredClass) > -1) {
                            return false;
                        }
                        if (node.id && node.id == widget.id) {
                            return true;
                        } else {
                        }
                    } else {
                        return false;
                    }

                } else if (this.allowHTMLNodes) {
                    return true;
                }

                return false;

            },
            startInspecting: function()
            {
                this._isInspecting = true;
                var data = this.userData;

                this.window=window;
                this.document=/*data.document || */document;
                this.initInspector();
                this._createInspectorFrame();
            },
            _pick:function(){
                try {
                    this.startInspecting();
                }catch(e){
                    console.error('inspector crash!');
                }
            }

        });
    });