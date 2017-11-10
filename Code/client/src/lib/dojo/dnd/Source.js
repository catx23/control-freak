/** @module dojo/dnd/Source **/
define([
    "../_base/array",
    "../_base/declare",
    "../_base/kernel",
    "../_base/lang",
    "../dom-class",
    "../dom-geometry",
    "../mouse",
    "../ready",
    "../topic",
    "./common",
    "./Selector",
    "./Manager",
    "xide/mixins/EventedMixin",
    "xide/utils"
], function (array, declare, kernel, lang, domClass, domGeom, mouse, ready, topic,
             dnd, Selector, Manager,EventedMixin,utils) {
    /*
     Container property:
     "Horizontal"- if this is the horizontal container
     Source states:
     ""			- normal state
     MOVED		- this source is being moved
     COPIED	- this source is being copied
     Target states:
     ""			- normal state
     DISABLED	- the target cannot accept an avatar
     Target anchor state:
     ""			- item is not selected
     BEFORE	- insert point is before the anchor
     AFTER		- insert point is after the anchor
     */
    var DISABLED = 'Disabled',
        BEFORE = 'Before',
        AFTER = 'After',
        SOURCE = 'Source',
        TARGET = 'Target',
        COPIED = 'Copied',
        MOVED = 'Moved';

    /**
     * A dict of parameters for DnD Source configuration. Note that any property on Source elements may be configured,
     * but this is the short-list
     * @typedef {Object} {module:dojo/dnd/SourceArguments}
     * @property {boolean} isSource .Can be used as a DnD source. Defaults to true.
     * @property {string[]} isSource. List of accepted types (text strings) for a target; defaults to ["text"]
     * @property {boolean} autoSync. If true refreshes the node list on every operation; false by default.
     * @property {boolean} copyOnly. Copy items, if true, use a state of Ctrl key otherwise, see selfCopy and selfAccept for more details.
     * @property {number} delay. The move delay in pixels before detecting a drag; 0 by default.
     * @property {boolean} horizontal. A horizontal container, if true, vertical otherwise or when omitted.
     * @property {boolean} selfCopy. Copy items by default when dropping on itself, false by default, works only if copyOnly is true.
     * @property {boolean} selfAccept. Accept its own items when copyOnly is true, true by default, works only if copyOnly is true.
     * @property {boolean} withHandles. Allows dragging only by handles, false by default.
     * @property {boolean} generateText. Generate text node for drag and drop, true by default.
     */

    /**
     * A Source object, which can be used as a DnD source, or a DnD target
     * @class module:dojo/dnd/Source
     * @extends module:dojo/dnd/Selector
     */
    var Source = declare("dojo.dnd.Source", [Selector,EventedMixin], {
        isSource: true,
        horizontal: false,
        copyOnly: false,
        selfCopy: false,
        selfAccept: true,
        skipForm: false,
        withHandles: false,
        autoSync: false,
        delay: 0, // pixels
        accept: ["text"],
        generateText: true,
        //id:utils.createUUID(),
        isCenter:function(){},
        /**
         * A constructor of the Source
         * @param node {HTMLElement|String} Node or node's id to build the source on.
         * @param params {module:dojo/dnd/SourceArguments} Any property of this class may be configured via the params 
         * object which is mixed-in to the `dojo/dnd/Source` instance.
         */
        constructor: function (node,params) {
            lang.mixin(this, lang.mixin({}, params));
            var type = this.accept;
            if (type.length) {
                this.accept = {};
                for (var i = 0; i < type.length; ++i) {
                    this.accept[type[i]] = 1;
                }
            }
            // class-specific variables
            this.isDragging = false;
            this.mouseDown = false;
            this.targetAnchor = null;
            this.targetBox = null;
            this.before = true;
            this.center = false,
            this._lastX = 0;
            this._lastY = 0;
            this.sourceState = "";
            if (this.isSource) {
                domClass.add(this.node, "dojoDndSource");
            }
            this.targetState = "";
            if (this.accept) {
                domClass.add(this.node, "dojoDndTarget");
            }
            if (this.horizontal) {
                domClass.add(this.node, "dojoDndHorizontal");
            }
            this.subscribe("/dnd/source/over",this.onDndSourceOver);
            this.subscribe("/dnd/start",this.onDndStart);
            this.subscribe("/dnd/drop", this.onDndDrop);
            this.subscribe("/dnd/cancel",this.onDndCancel);
        },
        /**
         * Checks if the target can accept nodes from this source.
         * @param source {module:dojo/dnd/Source} The source which provides items.
         * @param nodes {HTMLElement[]=} the list of transferred items.
         * @returns {boolean}
         */
        checkAcceptance: function (source, nodes) {
            if (this == source) {
                return !this.copyOnly || this.selfAccept;
            }
            for (var i = 0; i < nodes.length; ++i) {
                var type = source.getItem(nodes[i].id).type;
                // type instanceof Array
                var flag = false;
                for (var j = 0; j < type.length; ++j) {
                    if (type[j] in this.accept) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    return false;
                }
            }
            return true;
        },
        /**
         * Returns true if we need to copy items, false to move. It is separated to be overwritten dynamically, if needed.
         * @param keyPressed {boolean} the "copy" key was pressed.
         * @param self {boolean=false} Optional flag that means that we are about to drop on itself.
         * @returns boolean
         */
        copyState: function (keyPressed, self) {
            if (keyPressed) {
                return true;
            }
            if (arguments.length < 2) {
                self = this == Manager.manager().target;
            }
            if (self) {
                if (this.copyOnly) {
                    return this.selfCopy;
                }
            } else {
                return this.copyOnly;
            }
            return false;
        },
        destroy: function () {
            Source.superclass.destroy.call(this);
            this.targetAnchor = null;
        },
        /**
         * Event processor for onmousemove.
         * @param e {MouseEvent}
         */
        onMouseMove: function (e) {
            if (this.isDragging && this.targetState == DISABLED) {
                return;
            }
            Source.superclass.onMouseMove.call(this, e);
            var m = Manager.manager();
            if (!this.isDragging) {
                if (this.mouseDown && this.isSource &&
                    (Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay)) {
                    var nodes = this.getSelectedNodes();
                    if (nodes.length) {
                        m.startDrag(this, nodes, this.copyState(dnd.getCopyKeyState(e), true));
                    }
                }
            }
            if (this.isDragging) {
                // calculate before/center/after
                var before = false;
                var center = false;
                if (this.current) {
                    if (!this.targetBox || this.targetAnchor != this.current) {
                        this.targetBox = domGeom.position(this.current, true);
                    }
                    if (this.horizontal) {
                        // In LTR mode, the left part of the object means "before", but in RTL mode it means "after".
                        before = (e.pageX - this.targetBox.x < this.targetBox.w / 2) == domGeom.isBodyLtr(this.current.ownerDocument);
                    } else {
                        before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
                    }
                }
                center = this.isCenter(e);
                if (this.current != this.targetAnchor || before != this.before || center != this.center) {
                    this._markTargetAnchor(before, center, e);
                    m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
                }
            }
        },
        onMouseDown: function (e) {
            // summary:
            //		event processor for onmousedown
            // e: Event
            //		mouse event
            if (!this.mouseDown && this._legalMouseDown(e) && (!this.skipForm || !dnd.isFormElement(e))) {
                this.mouseDown = true;
                this._lastX = e.pageX;
                this._lastY = e.pageY;
                Source.superclass.onMouseDown.call(this, e);
            }
        },
        onMouseUp: function (e) {
            // summary:
            //		event processor for onmouseup
            // e: Event
            //		mouse event
            if (this.mouseDown) {
                this.mouseDown = false;
                Source.superclass.onMouseUp.call(this, e);
            }
        },
        /**
         * Topic event processor for /dnd/source/over, called when detected a current source.
         * @param source {module:dojo/dnd/Source} The source which has the mouse over it.
         */
        onDndSourceOver: function (source) {
            if (this !== source) {
                this.mouseDown = false;
                if (this.targetAnchor) {
                    this._unmarkTargetAnchor();
                }
            } else if (this.isDragging) {
                var m = Manager.manager();
                m.canDrop(this.targetState != DISABLED && (!this.current || m.source != this || !(this.current.id in this.selection)));
            }
        },
        /**
         * topic event processor for /dnd/start, called to initiate the DnD operation
         * @param source {module:dojo/dnd/Source} the source which provides items
         * @param nodes {HTMLElement[]} the list of transferred items
         * @param copy {boolean} if true, move items otherwise
         */
        onDndStart: function (source, nodes, copy) {
            if (this.autoSync) {
                this.sync();
            }
            if (this.isSource) {
                this._changeState(SOURCE, this == source ? (copy ? COPIED : MOVED) : "");
            }
            var accepted = this.accept && this.checkAcceptance(source, nodes);
            this._changeState(TARGET, accepted ? "" : DISABLED);
            if (this == source) {
                Manager.manager().overSource(this);
            }
            this.isDragging = true;
        },
        /**
         * Topic event processor for /dnd/drop, called to finish the DnD operation
         * @param source {module:dojo/dnd/Source} The source which provides items.
         * @param nodes {HTMLElement[]} The list of transferred items.
         * @param copy {boolean} Copy items, if true, move items otherwise.
         * @param target {module:dojo/dnd/Target} The target which accepts items.
         */
        onDndDrop: function (source, nodes, copy, target) {
            if (this == target) {
                // this one is for us => move nodes!
                this.onDrop(source, nodes, copy);
            }
            this.onDndCancel();
        },
        /**
         * Topic event processor for /dnd/cancel, called to cancel the DnD operation
         */
        onDndCancel: function () {
            if (this.targetAnchor) {
                this._unmarkTargetAnchor();
                this.targetAnchor = null;
            }
            this.before = true;
            this.isDragging = false;
            this.mouseDown = false;
            this._changeState(SOURCE, "");
            this._changeState(TARGET, "");
        },
        /**
         * Called only on the current target, when drop is performed.
         * @param source {module:dojo/dnd/Source} The source which provides items.
         * @param nodes {HTMLElement[]} The list of transferred items. Copy items, if true, move items otherwise.
         * @param copy {boolean}
         */
        onDrop: function (source, nodes, copy) {
            if (this != source) {
                this.onDropExternal(source, nodes, copy);
            } else {
                this.onDropInternal(nodes, copy);
            }
        },
        /**
         * Called only on the current target, when drop is performed from an external source.
         * @param source {module:dojo/dnd/Source} The source which provides items.
         * @param nodes {HTMLElement[]} The list of transferred items.
         * @param copy {boolean} Copy items, if true, move items otherwise.
         */
        onDropExternal: function (source, nodes, copy) {
            var oldCreator = this._normalizedCreator;
            // transferring nodes from the source to the target
            if (this.creator) {
                // use defined creator
                this._normalizedCreator = function (node, hint) {
                    return oldCreator.call(this, source.getItem(node.id).data, hint);
                };
            } else {
                // we have no creator defined => move/clone nodes
                if (copy) {
                    // clone nodes
                    this._normalizedCreator = function (node) {
                        var t = source.getItem(node.id);
                        var n = node.cloneNode(true);
                        n.id = dnd.getUniqueId();
                        return {node: n, data: t.data, type: t.type};
                    };
                } else {
                    // move nodes
                    this._normalizedCreator = function (node) {
                        var t = source.getItem(node.id);
                        source.delItem(node.id);
                        return {node: node, data: t.data, type: t.type};
                    };
                }
            }
            this.selectNone();
            if (!copy && !this.creator) {
                source.selectNone();
            }
            this.insertNodes(true, nodes, this.before, this.current);
            if (!copy && this.creator) {
                source.deleteSelectedNodes();
            }
            this._normalizedCreator = oldCreator;
        },
        /**
         * Called only on the current target, when drop is performed from the same target/source.
         * @param nodes {HTMLElement[]} The list of transferred items.
         * @param copy {boolean} Copy items, if true, move items otherwise
         */
        onDropInternal: function (nodes, copy) {
            var oldCreator = this._normalizedCreator;
            // transferring nodes within the single source
            if (this.current && this.current.id in this.selection) {
                // do nothing
                return;
            }
            if (copy) {
                if (this.creator) {
                    // create new copies of data items
                    this._normalizedCreator = function (node, hint) {
                        return oldCreator.call(this, this.getItem(node.id).data, hint);
                    };
                } else {
                    // clone nodes
                    this._normalizedCreator = function (node) {
                        var t = this.getItem(node.id);
                        var n = node.cloneNode(true);
                        n.id = dnd.getUniqueId();
                        return {node: n, data: t.data, type: t.type};
                    };
                }
            } else {
                // move nodes
                if (!this.current) {
                    // do nothing
                    return;
                }
                this._normalizedCreator = function (node) {
                    var t = this.getItem(node.id);
                    return {node: node, data: t.data, type: t.type};
                };
            }
            this._removeSelection();
            this.insertNodes(true, nodes, this.before, this.current);
            this._normalizedCreator = oldCreator;
        },
        onDraggingOver: function () {
            // summary:
            //		called during the active DnD operation, when items
            //		are dragged over this target, and it is not disabled
        },
        onDraggingOut: function () {
            // summary:
            //		called during the active DnD operation, when items
            //		are dragged away from this target, and it is not disabled
        },

        // utilities
        onOverEvent: function () {
            // summary:
            //		this function is called once, when mouse is over our container
            Source.superclass.onOverEvent.call(this);
            Manager.manager().overSource(this);
            if (this.isDragging && this.targetState != DISABLED) {
                this.onDraggingOver();
            }
        },
        onOutEvent: function () {
            // summary:
            //		this function is called once, when mouse is out of our container
            Source.superclass.onOutEvent.call(this);
            Manager.manager().outSource(this);
            if (this.isDragging && this.targetState != DISABLED) {
                this.onDraggingOut();
            }
        },
        /**
         * Assigns a class to the current target anchor based on "before" status
         * @param before {boolean} insert before, if true, after otherwise
         * @param center {boolean}
         * @param canDrop {boolean}
         * @private
         */
        _markTargetAnchor: function (before, center,canDrop) {
            if (this.current == this.targetAnchor && this.before === before && this.center === center) {
                return;
            }

            if (this.targetAnchor) {
                this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
                this._removeItemClass(this.targetAnchor,"Disallow");
                this._removeItemClass(this.targetAnchor, "Center");
            }
            this.targetAnchor = this.current;
            this.targetBox = null;
            this.before = before;
            this.center = center;
            this._before = before;
            this._center = center;

            if (this.targetAnchor) {
                if (center) {
                    this._removeItemClass(this.targetAnchor, "Before");
                    this._removeItemClass(this.targetAnchor, "After");
                    this._addItemClass(this.targetAnchor, 'Center');
                }
                !center && this._addItemClass(this.targetAnchor, this.before ? "Before" : "After");
                center && canDrop===false && this._addItemClass(this.targetAnchor, "Disallow");
            }
        },
        _unmarkTargetAnchor: function () {
            // summary:
            //		removes a class of the current target anchor based on "before" status
            if (!this.targetAnchor) {
                return;
            }
            this._removeItemClass(this.targetAnchor, this.before ? BEFORE : AFTER);
            this._removeItemClass(this.targetAnchor, 'Center');
            this._removeItemClass(this.targetAnchor, 'Disallow');
            this.targetAnchor = null;
            this.targetBox = null;
            this.before = true;
            this.center = true;
        },
        _markDndStatus: function (copy) {
            // summary:
            //		changes source's state based on "copy" status
            this._changeState(SOURCE, copy ? COPIED : MOVED);
        },
        _legalMouseDown: function (e) {
            // summary:
            //		checks if user clicked on "approved" items
            // e: Event
            //		mouse event

            // accept only the left mouse button, or the left finger
            if (e.type != "touchstart" && !mouse.isLeft(e)) {
                return false;
            }

            if (!this.withHandles) {
                return true;
            }
            // check for handles
            for (var node = e.target; node && node !== this.node; node = node.parentNode) {
                if (domClass.contains(node, "dojoDndHandle")) {
                    return true;
                }
                if (domClass.contains(node, "dojoDndItem") || domClass.contains(node, "dojoDndIgnore")) {
                    break;
                }
            }
            return false;	// Boolean
        }
    });
    return Source;
});
