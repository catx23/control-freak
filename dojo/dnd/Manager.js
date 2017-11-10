/** @module dojo/dnd/Manager **/
define([
    "../_base/array",
    "../_base/declare",
    "../_base/lang",
    "../_base/window",
    "../dom-class",
    "../Evented",
    "../has",
    "../keys",
    "../on",
    "../topic",
    "../touch",
    "./common",
    "./autoscroll",
    "./Avatar",
    "xide/mixins/EventedMixin",
    "xide/lodash",
    "xide/types/Types"
], function (array, declare, lang, win, domClass, Evented, has, keys, on, topic, touch, dnd, autoscroll, Avatar,EventedMixin,_,types) {
    
    var EVENTS = types.EVENTS;
    
    
    function stopEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * @class module:dojo/dnd/Manager
     * @extends module:dojo/Evented
     */
    var Manager = declare("dojo.dnd.Manager", [Evented,EventedMixin], {
        /**
         * @type {module:dojo/dnd/Avatar}
         */
        avatar:null,
        /**
         * @type {module:dojo/dnd/Source}
         */
        source:null,
        /**
         * @type {module:dojo/dnd/Target}
         */
        target:null,
        /**
         * @type {boolean}
         */
        copy:null,
        constructor: function () {
            this.avatar = null;
            this.source = null;
            this.nodes = [];
            this.copy = true;
            this.target = null;
            this.canDropFlag = false;
            this.events = [];
        },
        // avatar's offset from the mouse
        OFFSET_X: has("touch") ? 0 : 16,
        OFFSET_Y: has("touch") ? -64 : 16,
        /**
         * Called when a source detected a mouse-over condition.
         * @param source {module:dojo/dnd/Source} The reporter.
         */
        overSource: function (source) {
            if (this.avatar) {
                this.target = (source && source.targetState != "Disabled") ? source : null;
                this.canDropFlag = Boolean(this.target);
                this.avatar.update();
            }
            topic.publish(EVENTS.ON_DND_SOURCE_OVER, source);
        },
        /**
         * Called when a source detected a mouse-out condition.
         * @param source {module:dojo/dnd/Source} The reporter.
         */
        outSource: function (source) {
            if (this.avatar) {
                if (this.target == source) {
                    this.target = null;
                    this.canDropFlag = false;
                    this.avatar.update();
                    topic.publish(EVENTS.ON_DND_SOURCE_OVER, null);
                }
            } else {
                topic.publish(EVENTS.ON_DND_SOURCE_OVER, null);
            }
        },
        /**
         * Called to initiate the DnD operation
         * @param source {module:dojo/dnd/Source} The source which provides items.
         * @param nodes {HTMLElement[]} The list of transferred items.
         * @param copy {boolean} Copy items, if true, move items otherwise.
         */
        startDrag: function (source, nodes, copy) {
            // Tell autoscroll that a drag is starting
            autoscroll.autoScrollStart(win.doc);
            this.source = source;
            this.nodes = nodes;
            this.copy = Boolean(copy); // normalizing to true boolean
            this.avatar = this.makeAvatar();
            win.body().appendChild(this.avatar.node);
            topic.publish("/dnd/start", source, nodes, this.copy);
            
            this.events = [
                on(win.doc, touch.move, lang.hitch(this, "onMouseMove")),
                on(win.doc, touch.release, lang.hitch(this, "onMouseUp")),
                on(win.doc, "keydown", lang.hitch(this, "onKeyDown")),
                on(win.doc, "keyup", lang.hitch(this, "onKeyUp")),

                // cancel text selection and text dragging
                on(win.doc, "dragstart", stopEvent),
                on(win.body(), "selectstart", stopEvent)
            ];
            var c = "dojoDnd" + (copy ? "Copy" : "Move");
            domClass.add(win.body(), c);
        },
        /**
         * Called to notify if the current target can accept items.
         * @param flag {boolean}
         */
        canDrop: function (flag) {
            var canDropFlag = Boolean(this.target && flag);
            if (this.canDropFlag != canDropFlag) {
                this.canDropFlag = canDropFlag;
                this.avatar.update();
            }
        },
        /**
         * stop the DnD in progress
         */
        stopDrag: function () {
            domClass.remove(win.body(), ["dojoDndCopy", "dojoDndMove"]);
            _.invoke(this.events,"remove");
            this.events = [];
            this.avatar.destroy();
            this.avatar = null;
            this.source = this.target = null;
            this.nodes = [];
        },
        /**
         * Makes the avatar; it is separate to be overwritten dynamically, if needed.
         * @returns {module:dojo/dnd/Avatar}
         */
        makeAvatar: function () {
            return new Avatar(this);
        },
        /**
         * Updates the avatar; it is separate to be overwritten dynamically, if needed.
         */
        updateAvatar: function () {
            this.avatar.update();
        },
        /**
         * Event processor for onmousemove
         * @param e {MouseEvent}
         */
        onMouseMove: function (e) {
            var a = this.avatar;
            if (a) {
                autoscroll.autoScrollNodes(e);
                //autoscroll.autoScroll(e);
                var s = a.node.style;
                s.left = (e.pageX + this.OFFSET_X) + "px";
                s.top = (e.pageY + this.OFFSET_Y) + "px";
                var copy = Boolean(this.source.copyState(dnd.getCopyKeyState(e)));
                if (this.copy != copy) {
                    this._setCopyStatus(copy);
                }
            }
            if (has("touch")) {
                // Prevent page from scrolling so that user can drag instead.
                e.preventDefault();
            }
        },
        /**
         * Event processor for onmouseup
         * @param e {MouseEvent}
         */
        onMouseUp: function (e) {
            if (this.avatar) {
                if (this.target && this.canDropFlag) {
                    var copy = Boolean(this.source.copyState(dnd.getCopyKeyState(e)));
                    topic.publish(EVENTS.ON_DND_DROP_BEFORE, this.source, this.nodes, copy, this.target, e);
                    topic.publish(EVENTS.ON_DND_DROP, this.source, this.nodes, copy, this.target, e);
                } else {
                    topic.publish(EVENTS.ON_DND_CANCEL);
                }
                this.stopDrag();
            }
        },
        /**
         * Event processor for onkeydown watching for CTRL for copy/move status, watching for ESCAPE to cancel the drag
         * @param e {MouseEvent}
         */
        onKeyDown: function (e) {
            if (this.avatar) {
                switch (e.keyCode) {
                    case keys.CTRL:
                        var copy = Boolean(this.source.copyState(true));
                        if (this.copy != copy) {
                            this._setCopyStatus(copy);
                        }
                        break;
                    case keys.ESCAPE:
                        topic.publish(EVENTS.ON_DND_CANCEL);
                        this.stopDrag();
                        break;
                }
            }
        },
        /**
         * Event processor for onkeyup, watching for CTRL for copy/move status
         * @param e {KeyboardEvent} keyboard event
         */
        onKeyUp: function (e) {
            if (this.avatar && e.keyCode == keys.CTRL) {
                var copy = Boolean(this.source.copyState(false));
                if (this.copy != copy) {
                    this._setCopyStatus(copy);
                }
            }
        },
        /**
         * Changes the copy status
         * @param copy {boolean} The copy status
         * @private
         */
        _setCopyStatus: function (copy) {
            this.copy = copy;
            this.source._markDndStatus(this.copy);
            this.updateAvatar();
            domClass.replace(win.body(),
                "dojoDnd" + (this.copy ? "Copy" : "Move"),
                "dojoDnd" + (this.copy ? "Move" : "Copy"));
        }
    });

// dnd._manager:
//		The manager singleton variable. Can be overwritten if needed.
    dnd._manager = null;
    Manager.manager = dnd.manager = function () {
        // summary:
        //		Returns the current DnD manager.  Creates one if it is not created yet.
        if (!dnd._manager) {
            dnd._manager = new Manager();
        }
        return dnd._manager;	// Object
    };
    return Manager;
});
