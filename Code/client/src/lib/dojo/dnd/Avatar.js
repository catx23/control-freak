/** module:dojo/dnd/Avatar **/
define([
    "../_base/declare",
    "../_base/window",
    "../dom",
    "../dom-attr",
    "../dom-class",
    "../dom-construct",
    "../hccss",
    "../query"
], function (declare, win, dom, domAttr, domClass, domConstruct, has, query) {
    /**
     * Object that represents transferred DnD items visually
     * @class module:dojo/dnd/Avatar
     */
    return declare("dojo.dnd.Avatar", null, {
        /**
         * @param manager {module:dojo/dnd/Manager}
         */
        constructor: function (manager) {
            this.manager = manager;
            this.construct();
        },
        /**
         * It is separate so it can be (dynamically) overwritten in case of need
         */
        construct: function () {
            var a = domConstruct.create("table", {
                    "class": "dojoDndAvatar",
                    style: {
                        position: "absolute",
                        zIndex: "1999",
                        margin: "0px"
                    }
                }),
                source = this.manager.source, node,
                b = domConstruct.create("tbody", null, a),
                tr = domConstruct.create("tr", null, b),
                td = domConstruct.create("td", null, tr),
                k = Math.min(5, this.manager.nodes.length), i = 0;

            domConstruct.create("span", {
                innerHTML: source.generateText ? this._generateText() : ""
            }, td);

            // we have to set the opacity on IE only after the node is live
            domAttr.set(tr, {
                "class": "dojoDndAvatarHeader",
                style: {opacity: 0.9}
            });
            for (; i < k; ++i) {
                if (source.creator) {
                    // create an avatar representation of the node
                    node = source._normalizedCreator(source.getItem(this.manager.nodes[i].id).data, "avatar").node;
                } else {
                    // or just clone the node and hope it works
                    node = this.manager.nodes[i].cloneNode(true);
                    if (node.tagName.toLowerCase() == "tr") {
                        // insert extra table nodes
                        var table = domConstruct.create("table"),
                            tbody = domConstruct.create("tbody", null, table);
                        tbody.appendChild(node);
                        node = table;
                    }
                }
                node.id = "";
                tr = domConstruct.create("tr", null, b);
                td = domConstruct.create("td", null, tr);
                td.appendChild(node);
                domAttr.set(tr, {
                    "class": "dojoDndAvatarItem",
                    style: {opacity: (9 - i) / 10}
                });
            }
            this.node = a;
        },
        /**
         *  Destructor for the avatar; called to remove all references so it can be garbage-collected
         */
        destroy: function () {
            domConstruct.destroy(this.node);
            this.node = false;
        },
        /**
         * updates the avatar to reflect the current DnD state
         */
        update: function () {
            domClass.toggle(this.node, "dojoDndAvatarCanDrop", this.manager.canDropFlag);
            // replace text
            query(("tr.dojoDndAvatarHeader td span" + (has("highcontrast") ? " span" : "")), this.node).forEach(
                function (node) {
                    node.innerHTML = this.manager.source.generateText ? this._generateText() : "";
                }, this);
        },
        /**
         * Generates a proper text to reflect copying or moving of items
         * @returns {string}
         * @private
         */
        _generateText: function () {
            return this.manager.nodes.length.toString();
        }
    });
});