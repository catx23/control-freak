/** @module deliteful/Bar */
define([
    "dcl/dcl",
    "delite/register",
    "delite/Widget",
    "requirejs-dplugins/jquery!attributes/classes",
    "delite/theme!xdeliteful/Bar/themes/Bar.css"
], function (dcl, register, Widget, $) {
    /**
     * Bar is a container that lays out its children elements either horizontally or vertically. It can for example
     * be used as a menu bar.
     * @lends module:deliteful/Bar#
     * @example:
     * <d-bar>
     *     <d-button></d-button>
     *     <d-button></d-button>
     * </d-bar>
     * @class module:deliteful/Bar
     */
    return register("d-bar", [HTMLElement, Widget], {
        /**
         * The name of the CSS class of this widget.
         * @member {string}
         * @default "d-bar"
         */
        baseClass: "d-bar",

        /**
         * Whether the layout is vertical or not.
         * @member {boolean}
         * @default false
         */
        vertical: false,

        render: dcl.advise({
            before: function () {
                // Save original markup to put into this.containerNode.
                var srcDom = this._srcDom = this.ownerDocument.createDocumentFragment();
                while (this.firstChild) {
                    srcDom.appendChild(this.firstChild);
                }
            },

            after: function () {
                this._childArray = [];
                // Safari & IE are not supporting children on DocumentFragment
                var holder, children = this._srcDom.children || this._srcDom.querySelectorAll("*");
                // if Safari/IE the children array is not live, find a way to iterate common to both
                for (var i = children.length - 1; i >= 0; i--) {
                    holder = this._setupHolder(children[i]);
                    this.appendChild(holder);
                }
                $(this).addClass(this.vertical ? "d-bar-v" : "d-bar-h");
            }
        }),

        _setupHolder: function (child) {
            this._childArray = this._childArray || [];
            var holder = this.ownerDocument.createElement("div");
            this._childArray.push(child);
            holder.appendChild(child);
            return holder;
        },

        appendChild: dcl.superCall(function (sup) {
            return function (child) {
                if (this.created) {
                    var holder = this._setupHolder(child);
                    sup.call(this, holder);
                    return child;
                } else {
                    return sup.call(this, child);
                }
            };
        }),

        insertBefore: dcl.superCall(function (sup) {
            return function (newChild, refChild) {
                if (this.created) {
                    var index = this._childArray.indexOf(refChild);
                    var holderRef = this.children[index];
                    var holder = this._setupHolder(newChild);
                    sup.call(this, holder, holderRef);
                    this.onAddChild(newChild);
                    return newChild;
                } else {
                    return sup.call(this, newChild, refChild);
                }
            };
        }),

        refreshRendering: function (oldValues) {
            if ("vertical" in oldValues) {
                $(this).toggleClass("d-bar-v", this.vertical);
                $(this).toggleClass("d-bar-h", !this.vertical);
            }
        },

        /**
         * Callback whenever a child element is added to this widget via `appendChild()`, `insertBefore()`,
         * or a method like `addChild()` that internally calls `appendChild()` and/or `insertBefore()`.
         * @param {Element} node
         */
        onAddChild: function (node) {
            // If I've been started but the child widget hasn't been started,
            // start it now.  Make sure to do this after widget has been
            // inserted into the DOM tree, so it can see that it's being controlled by me,
            // so it doesn't try to size itself.
            if (this.attached && node.attachedCallback) {
                node.attachedCallback();
            }
        },

        /**
         * Inserts the specified Element at the specified index.
         * For example, `.addChild(node, 3)` sets this widget's fourth child to node.
         * @param {Element} node - Element to add as a child.
         * @param {number} [insertIndex] - Position the child as at the specified position relative to other children.
         */
        addChild: function (node, insertIndex) {
            // Note: insertBefore(node, null) equivalent to appendChild().  Null arg is needed (only) on IE.
            var nextSibling = this._childArray[insertIndex];
            this.insertBefore(node, nextSibling || null);
        },

        /**
         * Detaches the specified node instance from this widget but does
         * not destroy it.  You can also pass in an integer indicating
         * the index within the container to remove (ie, removeChild(5) removes the sixth node).
         * @param {Element|number} node
         */
        removeChild: function (node) {
            if (typeof node === "number") {
                node = this.getChildren()[node];
            }

            if(this.contains(node)) {
                //this.removeChild(node);
                HTMLElement.prototype.removeChild.call(this, node);
                if (node && node.parentNode && node.parentNode.parentNode) {

                    //HTMLElement.prototype.removeChild.call(node.parentNode.parentNode, node.parentNode);
                    //HTMLElement.prototype.removeChild.call(node.parentNode, node); // detach but don't destroy
                }
            }else{
                console.warn('no me');
            }
        },

        /**
         * Returns all direct children of this widget, i.e. all widgets or DOM nodes underneath
         * `this.containerNode`.  Note that it does not return all
         * descendants, but rather just direct children.
         *
         * The result intentionally excludes element outside off `this.containerNode`.  So, it is different than
         * accessing the `children` or `childNode` properties.
         *
         * @returns {Element[]}
         */
        getChildren: function () {
            return this._childArray;
        },

        /**
         * Returns true if widget has child nodes, i.e. if `this.containerNode` contains widgets.
         * @returns {boolean}
         */
        hasChildren: function () {
            return this.getChildren().length > 0;
        },

        /**
         * Returns the index of the child in this container or -1 if not found.
         * @param {Element} child
         * @returns {number}
         */
        getIndexOfChild: function (child) {
            return this.getChildren().indexOf(child);
        }
    });
});