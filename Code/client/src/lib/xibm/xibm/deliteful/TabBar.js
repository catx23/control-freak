/** @module deliteful/TabBar */
define([
    "dcl/dcl",
    "delite/register",
    "./Bar",
    "deliteful/ToggleButton",
    "deliteful/Button",
    "requirejs-dplugins/jquery!attributes/classes"
], function (dcl, register, Bar, ToggleButton, Button, $) {
    /**
     * TabBar is a widget that controls the visibility of views in a ViewStack through a set of toggle buttons.
     * The buttons are automatically created from the views available in the ViewStack. One can replace the created
     * buttons by its own custom element Widget using the button property.
     * @lends module:deliteful/TabBar#
     * @example:
     * <d-tab-bar viewStack="vs">
     * </d-tab-bar>
     * <d-view-stack id="vs">
     *     <div id="childA">...</div>
     *     <div id="childB">...</div>
     *     <div id="childC">...</div>
     * </d-view-stack>
     * @class module:deliteful/TabBar
     */
    return register("d-tab-bar", [HTMLElement, Bar], {
        /**
         * The name of the CSS class of this widget. Note that this element also use the d-bar class to leverage
         *`deliteful/Bar` styles.
         * @member {string}
         * @default "d-tab-bar"
         */
        baseClass: "d-tab-bar",

        /**
         * The `deliteful/ViewStack` this TabBar is connected to.
         * @member {deliteful/ViewStack}
         * @default null
         */
        viewStack: null,

        /**
         * The toggle element class this TabBar is using to fill out the bar.
         * @member {deliteful/Toggle}
         * @default deliteful/ToggleButton
         */
        toggle: ToggleButton,

        preRender: function () {
            // we want to inherit from Bar
            $(this).addClass(Bar._ctor.prototype.baseClass);
        },

        refreshRendering: function (oldValues) {
            if(!this.viewStack){
                this.viewStack = $('#' + $(this).attr('viewStack'))[0];
            }else if(_.isString(this.viewStack)){
                var viewStack = $('#' + $(this).attr('viewStack'))[0];
                if(viewStack){
                    this.viewStack = viewStack;
                }
            }
            if (this.viewStack && this.viewStack.children && "viewStack" in oldValues) {
                // take all existing views and fill the bar with corresponding buttons
                for (var i = 0; i < this.viewStack.children.length; i++) {
                    var element = this.viewStack.children[i];
                    this.renderTabButton(element);
                }
                /*
                this.viewStack.children.forEach(function (element) {

                }.bind(this));
                */
                // if new views are added later we must add more buttons

                this.viewStack.on("delite-add-child", function (event) {
                    console.error('add child');
                    // FIXME: issue with the index this should not always be added to the end of the list
                    this.renderTabButton(event.child);
                }.bind(this));

                // we must also listen to possible changes on selected view to replicate it

                this.viewStack.on("delite-after-show", function () {
                    this.getChildren().forEach(function (item) {
                        item._update();
                    });
                }.bind(this));

            }
        },
        /**
         * Creates the tab bar button corresponding to the given view. The default implementation is using the
         * `toggle` property to create the button and pass the view `title` as `label` and when provided the
         * view `iconClass` attribute for the button `iconClass`.
         * @param {HTMLElement} view - The view the button must be created for.
         * @returns {deliteful/Toggle} An element representing the tab bar button for the given view.
         */
        createTabButton: function (view) {
            return new this.toggle({label: view.label, iconClass: view.getAttribute("iconClass")});
        },

        /**
         * Renders the tab bar button corresponding to the given view.
         * @param {HTMLElement} view - The view the button must be rendered for.
         */
        renderTabButton: function (view) {
            var button = this.createTabButton(view);
            var self = this;
            button._update = function () {
                this.checked = self.viewStack._visibleChild === view;
            };
            button._update();
            button.on("click", function () {
                console.log('show');
                self.viewStack.show(view);
            });
            this.appendChild(button);
        }
    });
});

