/**
 * @module xideve/delite/_ContextInterface
 */
define([
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/_base/connect",
    "dojo/topic",
    "davinci/Theme",
    "davinci/Workbench",
    "davinci/ve/Snap",
    "dojox/html/_base"
], function (declare, domStyle, connect, Topic, Theme, Workbench, Snap) {

    var PREF_LAYOUT_ATTR = 'data-maq-flow-layout',
        PREF_LAYOUT_ATTR_P6 = 'data-maqetta-flow-layout';

    /**
     *
     * @mixin module:xideve/delite/_ContextInterface
     * @lends module:xideve/delite/Context
     */
    return declare(null, {
        _designEvents: [],
        _designMode: true,
        isDesignMode: function () {
            return this._designMode;
        },
        getBlockSettings: function () {
            return {
                highlight: true
            }
        },
        _disableDesignMode: function () {
            this._designEvents.forEach(connect.disconnect);
            var containerNode = this.getContainerNode();
            this._designEvents = [
                connect.connect(containerNode, "onclick", this, "onMouseClick")
            ];

        },
        _enableDesignMode: function () {

            var containerNode = this.getContainerNode();
            this._designEvents.forEach(connect.disconnect);
            this._designEvents = [
                connect.connect(this.getDocument(), "onkeydown", this, "onKeyDown"),
                connect.connect(this.getDocument(), "onkeyup", this, "onKeyUp"),
                connect.connect(containerNode, "ondblclick", this, "onDblClick"),
                connect.connect(containerNode, "onmousedown", this, "onMouseDown"),
                connect.connect(containerNode, "onclick", this, "onMouseClick"),
                connect.connect(containerNode, "onmousemove", this, "onMouseMove"),
                connect.connect(containerNode, "contextmenu", this, "contextmenu"),
                connect.connect(containerNode, "onmouseup", this, "onMouseUp"),
                connect.connect(containerNode, "onmouseover", this, "onMouseOver"),
                connect.connect(containerNode, "onmouseout", this, "onMouseOut")
            ];

        },
        setDesignMode: function (design) {
            //turn off
            if (!design && this._designMode) {
                this._disableDesignMode();
            }
            if (design && !this._designMode) {
                this._enableDesignMode();
            }
            this._designMode = design;
        },
        getActiveDragDiv: function () {
            return this._activeDragDiv;
        },
        setActiveDragDiv: function (activeDragDiv) {
            this._activeDragDiv = activeDragDiv;
        },
        blockChange: function (shouldBlock) {
            this._blockChange = shouldBlock;
        },
        onMouseClick: function (e) {
            if (this.eventHandler && this.eventHandler['click']) {
                this.eventHandler['click'](e);
            }
            $('body').trigger('click', e);
        },
        onMouseDown: function (event) {
            if (this._activeTool && this._activeTool.onMouseDown && !this._blockChange) {
                this._activeTool.onMouseDown(event);
            }
            this.blockChange(false);
            $('body').trigger('mousedown', event);
        },
        onDblClick: function (event) {},
        onMouseMove: function (event) {
            if (this._activeTool && this._activeTool.onMouseMove && !this._blockChange) {
                this._activeTool.onMouseMove(event);
            }
        },
        onMouseUp: function (event) {
            if (this._activeTool && this._activeTool.onMouseUp) {
                this._activeTool.onMouseUp(event);
            }
            this.blockChange(false);
            Topic.publish("/davinci/ve/context/mouseup", event);
            $('body').trigger('mouseup', event);
        },
        onMouseOver: function (event) {
            if (this._activeTool && this._activeTool.onMouseOver) {
                this._activeTool.onMouseOver(event);
            }
            $('body').trigger('mouseover', event);
        },
        onMouseOut: function (event) {
            if (this._activeTool && this._activeTool.onMouseOut) {
                this._activeTool.onMouseOut(event);
            }
            $('body').trigger('mouseout', event);
        },
        contextmenu: function (event) {
            $('body').trigger('contextmenu', event);
        },
        /**
         * Perform any visual updates in response to mousemove event while performing a
         * drag operation on the visual canvas.
         * @param {object} params  object with following properties:
         *        [array{object}] widgets  Array of widgets being dragged (can be empty array)
         *      {object|array{object}} data  For widget being dragged, either {type:<widgettype>} or array of similar objects
         *      {object} eventTarget  Node (usually, Element) that is current event.target (ie, node under mouse)
         *      {object} position  x,y properties hold current mouse location
         *      {boolean} absolute  true if current widget will be positioned absolutely
         *      {object} currentParent  if provided, then current parent widget for thing being dragged
         *        {object} rect  l,t,w,h properties define rectangle being dragged around
         *        {boolean} doSnapLinesX  whether to show dynamic snap lines (x-axis)
         *        {boolean} doSnapLinesY  whether to show dynamic snap lines (y-axis)
         *        {boolean} doFindParentsXY  whether to show candidate parent widgets
         *        {boolean} doCursor  whether to show drop cursor (when dropping using flow layout)
         *        {string|undefined} beforeAfter  either 'before' or 'after' or undefined (which means default behavior)
         *        {string|array} widgetType  widget type (e.g., 'dijit.form.Button')
         */
        getScrollOffset: function () {
            if (this.rootNode) {
                return {
                    x: this.rootNode.parentNode.scrollLeft,
                    y: this.rootNode.parentNode.scrollTop
                }
            } else {
                return {
                    x: 0,
                    y: 0
                }
            }
        },
        dragMoveUpdate: function (params) {
            var context = this,
                cp = this._chooseParent,
                widgets = params.widgets,
                data = params.data,
                //			eventTarget = params.eventTarget,
                position = params.position,
                absolute = params.absolute,
                currentParent = params.currentParent,
                rect = params.rect,
                doSnapLinesX = params.doSnapLinesX,
                doSnapLinesY = params.doSnapLinesY,
                doFindParentsXY = params.doFindParentsXY,
                doCursor = params.doCursor,
                beforeAfter = params.beforeAfter,
                widgetType = dojo.isArray(data) ? data[0].type : data.type;

            doSnapLinesX = true;
            doSnapLinesY = true;
            var offset = context.getScrollOffset();
            position.x -= offset.x;
            position.y -= offset.y;
            // inner function that gets called recurively for each widget in document
            // The "this" object for this function is the Context object
            var _updateThisWidget = function (widget) {

                if (!widget) {
                    console.error('-error:_updateThisWidget:invalid widget', data);
                    return;
                }

                if (widgets && widgets.indexOf(widget) >= 0) {
                    // Drag operations shouldn't apply to any of the widget being dragged
                    return;
                }

                var innerStyle = this.getGlobal()['require']('dojo/dom-style');

                var computedStyle = innerStyle.get(widget.domNode);

                if (doSnapLinesX || doSnapLinesY) {
                    Snap.findSnapOpportunities(this, widget, computedStyle, doSnapLinesX, doSnapLinesY);
                }
                cp.findParentsXY({
                    data: data,
                    widget: widget,
                    absolute: absolute,
                    position: position,
                    doCursor: doCursor,
                    beforeAfter: beforeAfter
                });
                dojo.forEach(widget.getChildren(), function (w) {
                    _updateThisWidget.apply(context, [w]);
                });
            };

            if (doSnapLinesX || doSnapLinesY) {
                doSnapLines = Snap.updateSnapLinesBeforeTraversal(this, rect);
            }
            var differentXY = cp.findParentsXYBeforeTraversal(params);
            // Traverse all widgets, which will result in updates to snap lines and to
            // the visual popup showing possible parent widgets
            _updateThisWidget.apply(context, [this.rootWidget]);
            if (doSnapLinesX || doSnapLinesY) {
                Snap.updateSnapLinesAfterTraversal(this);
            }
            cp.findParentsXYAfterTraversal(params);
            if (differentXY) {
                if (currentParent) {
                    //console.log('current parent : ' + position.x + ' :  ' + position.y ,currentParent);
                }
                cp.dragUpdateCandidateParents({
                    widgetType: widgetType,
                    showCandidateParents: doFindParentsXY,
                    doCursor: doCursor,
                    beforeAfter: beforeAfter,
                    absolute: absolute,
                    currentParent: currentParent
                });
                cp.findParentsXYCleanup(params);
            }
        },
        /**
         * Cleanups after completing drag operations.
         */
        dragMoveCleanup: function () {
            Snap.clearSnapLines(this);
            this._chooseParent.cleanup(this);
        },
        onExtentChange: function (focus, oldBox, newBox, applyToWhichStates) {
            if (this._activeTool && this._activeTool.onExtentChange && !this._blockChange) {
                var index = dojo.indexOf(this._focuses, focus);
                if (index >= 0) {
                    this._activeTool.onExtentChange({
                        index: index,
                        oldBoxes: [oldBox],
                        newBox: newBox,
                        applyToWhichStates: applyToWhichStates
                    });
                }
            }
            this.blockChange(false);
        },
        onKeyDown: function (event) {
            //FIXME: Research task. This routine doesn't get fired when using CreateTool and drag/drop from widget palette.
            // Perhaps the drag operation created a DIV in application's DOM causes the application DOM
            // to be the keyboard focus?
            if (this._activeTool && this._activeTool.onKeyDown) {
                this._activeTool.onKeyDown(event);
            }
            $('body').trigger('keydown', event);
        },
        onKeyUp: function (event) {
            //FIXME: Research task. This routine doesn't get fired when using CreateTool and drag/drop from widget palette.
            // Perhaps the drag operation created a DIV in application's DOM causes the application DOM
            // to be the keyboard focus?
            if (this._activeTool && this._activeTool.onKeyUp) {
                this._activeTool.onKeyUp(event);
            }
            $('body').trigger('keyup', event);
        },
        onContentChange: function () {

            this._updateWidgetHash();

            this.deselectInvisible();

            // update focus
            dojo.forEach(this.getSelection(), function (w, i) {
                if (i === 0) {
                    this.select(w);
                } else {
                    this.select(w, true); // add
                }
            }, this);

            //FIXME: ALP->WBR: do we still need this? move to ThemeEditor's context?
            if (this.editor.editorID == 'davinci.themeEdit.ThemeEditor') {
                var helper = Theme.getHelper(this.visualEditor.theme);
                if (helper && helper.onContentChange) {
                    helper.onContentChange(this, this.visualEditor.theme);
                } else if (helper && helper.then) { // it might not be loaded yet so check for a deferred
                    helper.then(function (result) {
                        if (result.helper && result.helper.onContentChange) {
                            result.helper.onContentChange(this, this.visualEditor.theme);
                        }
                    }.bind(this));
                }
            }

            if (this._forceSelectionChange) {
                this.onSelectionChange(this.getSelection());
                delete this._forceSelectionChange;
            }

            setTimeout(function () {
                // Invoke autoSave, with "this" set to Workbench
                Workbench._autoSave.call(Workbench);
            }, 0);
        },
        onSelectionChange: function (selection) {
            this._cssCache = {};
            this.publish("/davinci/ui/widgetSelected", {
                selection: selection,
                context: this
            });
        },
        getActiveTool: function () {
            return this._activeTool;
        },
        setActiveTool: function (tool) {
            try {
                if (this._activeTool) {
                    this._activeTool.deactivate();
                }
                this._activeTool = tool;
                if (!this._activeTool) {
                    this._activeTool = this._defaultTool;
                }
                this._activeTool.activate(this);
                this.publish("/davinci/ve/activeToolChanged", [this, tool]);
            } catch (e) {
                logError(e, 'setActiveTool');
            }
        },
        // Returns true if inline edit is showing
        inlineEditActive: function () {
            return this.getSelection().some(function (item, i) {
                return this._focuses[i].inlineEditActive();
            }, this);
        },

        select: function (widget, add, inline) {
            if (!widget /*|| widget == this.rootWidget*/ ) {
                if (!add) {
                    this.deselect(); // deselect all
                }
                return;
            }

            var index, alreadySelected = false;
            if (this._selection) {
                alreadySelected = this._selection.some(function (w, idx) {
                    if (w === widget) {
                        index = idx;
                        return true;
                    }
                    return false;
                });
            }

            if (!alreadySelected) {
                var selection;
                if (add && this._selection) {
                    index = this._selection.length;
                    selection = this._selection;
                    selection.push(widget);
                } else {
                    selection = [widget];
                }

                var parent = widget.getParent();
                if (parent && parent.getParent) {
                    var parentHelper = parent.getHelper();
                    if (parentHelper && parentHelper.selectChild) {
                        parentHelper.selectChild(parent, widget);
                    } else {
                        parent.selectChild(widget);
                    }
                }

                if (!this._selection || this._selection.length > 1 || selection.length > 1 || this.getSelection() != widget) {
                    var oldSelection = this._selection;
                    this._selection = selection;
                    this.onSelectionChange(selection, add);
                    if (oldSelection) {
                        oldSelection.forEach(function (w) {
                            var h = w.getHelper();
                            if (h && h.onDeselect) {
                                h.onDeselect(w);
                            }
                        }, this);
                    }
                    var helper = widget.getHelper();
                    if (helper && helper.onSelect) {
                        helper.onSelect(widget);
                    }
                }
            }
            this.updateFocus(widget, index, inline);
        },
        deselect: function (widget) {
            if (!this._selection) {
                return;
            }

            var helper = null;
            if (widget) {
                helper = widget.getHelper();
            }
            if (widget && this._selection.length) { // undo of add got us here some how.
                if (this._selection.length === 1) {
                    if (this._selection[0] != widget) {
                        return;
                    }
                    this.focus(null, 0);
                    this._selection = undefined;
                } else {
                    var index = dojo.indexOf(this._selection, widget);
                    if (index < 0) {
                        return;
                    }
                    this.focus(null, index);
                    this._selection.splice(index, 1);
                }
                if (helper && helper.onDeselect) {
                    helper.onDeselect(widget);
                }
            } else { // deselect all
                if (this._selection) {
                    this._selection.forEach(function (w) {
                        var h = w.getHelper();
                        if (h && h.onDeselect) {
                            h.onDeselect(w);
                        }
                    }, this);
                }
                this.focus(null);
                this._selection = undefined;
            }

            this.onSelectionChange(this.getSelection());
        },
        deselectInvisible: function () {
            function isHidden(node) {
                if ((node.nodeType == 1 /*ELEMENT_NODE*/ ) && (domStyle.get(node, "display") == 'none')) {
                    return true;
                }
                if (node.parentNode) {
                    return isHidden(node.parentNode);
                }
                return false;
            }

            if (this._selection) {
                for (var i = this._selection.length - 1; i >= 0; i--) {
                    var widget = this._selection[i];
                    var domNode = widget.domNode;
                    // Check for display:none somewhere in ancestor DOM hierarchy
                    if (isHidden(domNode) && widget.type !== 'xblox/RunScript') {
                        this.deselect(widget);
                    } else {

                        while (domNode && domNode.tagName.toUpperCase() != 'BODY') {
                            // Sometimes browsers haven't set up defaultView yet,
                            // and domStyle.get will raise exception if defaultView isn't there yet
                            if (domNode && domNode.ownerDocument && domNode.ownerDocument.defaultView) {
                                var computedStyleDisplay = domStyle.get(domNode, 'display');
                                if (computedStyleDisplay == 'none' && widget.type !== 'xblox/RunScript') {
                                    this.deselect(widget);
                                    break;
                                }
                            }
                            domNode = domNode.parentNode;
                        }
                    }
                }
            }
        },
        getFlowLayout: function () {

            var bodyElement = this.getDocumentElement().getChildElement("body"),
                flowLayout = bodyElement && bodyElement.getAttribute(PREF_LAYOUT_ATTR),
                flowLayoutP6 = bodyElement && bodyElement.getAttribute(PREF_LAYOUT_ATTR_P6);
            if (!flowLayout && flowLayoutP6) {
                flowLayout = flowLayoutP6;
                this.editor._visualChanged();
            }
            if (!flowLayout) { // if flowLayout has not been set in the context check the edit prefs
                flowLayout = true;
                this.setFlowLayout(flowLayout);
            } else {
                flowLayout = (flowLayout === 'true') || (flowLayout === true);
            }
            return flowLayout;
        },
        setFlowLayout: function (flowLayout) {
            var bodyElement = this.getDocumentElement().getChildElement("body");
            if (bodyElement) {
                bodyElement.addAttribute(PREF_LAYOUT_ATTR, '' + flowLayout);
            }
            return flowLayout;
        }
    });
});