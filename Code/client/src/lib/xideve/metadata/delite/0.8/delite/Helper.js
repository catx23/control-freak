define(function () {
    var ButtonHelper = function () {};
    ButtonHelper.prototype = {
        _isAllowed: function (args) {
            if (args.parentType === 'delite/ViewStack' || args.parentType === 'delite/Accordion') {
                return true;
            } else if (args.parentType === 'delite/Panel') {
                return false;
            } else {
                return false;
            }

            if (args.absolute) {
                // Don't allow View widgets to be positioned absolutely
                // Doesn't work with dojox.mobile because dojox.mobile will always force top:0px
                //return false;
            } else {
                return args.isAllowedChild && args.isAllowedParent;
            }
        },
        updateWidget: function () {
            console.error('updateWidget', arguments);
        },
        _getWidgetClassText: function (id, className) {
            return "";
            var text = "<span class='propertiesTitleClassName'>";
            //text += node.tagName;
            if (id) {
                text += "#" + id;
            }
            if (className) {
                text += "." + className.replace(/\s+/g, ".");
            }
            text += "</span> ";
            return text;
        },
        _remove_prefix: function (str) {
            var returnstr = str;
            var prefixes_to_remove = [
                'dijit/form/',
                'dijit/layout/',
                'dijit/',
                'dojox/mobile/',
                'html.',
                'html/',
                'OpenAjax.',
                'OpenAjax/'
            ];
            for (var i = 0; i < prefixes_to_remove.length; i++) {
                if (str.indexOf(prefixes_to_remove[i]) == 0) { // use ===?
                    returnstr = str.substr(prefixes_to_remove[i].length);
                    //FIXME: Another hack. Need a better approach for this.
                    //Special case logic for HTML widgets
                    if (prefixes_to_remove[i] == 'html.') {
                        returnstr = '&lt;' + returnstr + '&gt;';
                    }
                    break;
                }
            }
            return returnstr;
        },
        getWidgetNameText: function (widget) {

            if (widget.domNode && widget.domNode.label) {
                var text = "<span class='propertiesTitleWidgetName'>";
                text += "</span> ";
                return ""
            }

            var text = "<span class='propertiesTitleWidgetName'>";
            text += this._remove_prefix(widget.type);
            text += "</span> ";
            return text;
        },
        getWidgetText: function (widget) {
            if (widget.domNode) {
                var _label = null;
                if (widget.domNode.get) {
                    _label = widget.domNode.get('label');
                } else {
                    _label = widget.domNode.label;
                }
                return _label;
            }
            return widget.type;
        },
        __getData: function ( /*Widget*/ widget, /*Object*/ options) {
            if (!widget) {
                return undefined;
            }

            var data = widget._getData(options);
            var _uniqueId = dijit.getUniqueId(widget.type.replace(/\./g, "_"));
            _uniqueId = _uniqueId.replace('delite/', 'd-').toLowerCase();
            if (widget.id === 'no_id') {
                widget.id = _uniqueId;
                data.properties['id'] = _uniqueId;
                data.properties.id = _uniqueId;
            }
            return data;
        },
        create: function (widget) {
            widget._srcElement.setAttribute('id', widget.id);
        },
        onAdded: function (target, src) {
            if (src.type === 'xblox/RunScript') {
                return target;
            } else {
                return src;
            }
        },
        _getChildren: function (widget, attach) {
            var dijitWidget = widget.dijitWidget;
            // First, get children from slider's containerNode.
            var children = []; //widget._getChildren(attach);
            return children;

            function getWidget(node) {
                if (attach) {
                    return davinci.ve.widget.getWidget(node);
                } else {
                    var widget = node._dvWidget;
                    if (widget) {
                        return widget;
                    }
                }
            }

            dojo.forEach(dijitWidget.domNode.children, function (node) {
                var childWidget = getWidget(node);
                if (childWidget) {
                    if (childWidget.type == 'xblox/RunScript') {
                        debugger;
                        console.log('enum ', childWidget);
                        children.push(childWidget);
                    }

                }
            });
            return children;

        },
        ___getChildrenData: function ( /*Widget*/ widget, /*Object*/ options) {
            // summary:
            //		The child in the markup of a button tag is its text content, so return that.
            //

            return undefined;
            if (widget && widget.getTagName() == "BUTTON") {
                return widget.dijitWidget.label;
            }

            return undefined;
        }
    };

    return ButtonHelper;

});