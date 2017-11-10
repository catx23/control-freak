define(function() {

    var BlockHelper = function() {};
    BlockHelper.prototype = {
        updateWidget: function(){
            // console.error('updateWidget',arguments);
        },
        _getWidgetClassText: function(id, className){
            return "";
            var text = "<span class='propertiesTitleClassName'>";
            //text += node.tagName;
            if (id) {
                text += "#" + id;
            }
            if (className) {
                text += "." + className.replace(/\s+/g,".");
            }
            text += "</span> ";
            return text;
        },
        _remove_prefix: function(str){
            var returnstr = str;
            var prefixes_to_remove=[
                'dijit/form/',
                'dijit/layout/',
                'dijit/',
                'dojox/mobile/',
                'html.',
                'html/',
                'OpenAjax.',
                'OpenAjax/'];
            for(var i=0; i<prefixes_to_remove.length; i++){
                if(str.indexOf(prefixes_to_remove[i])==0){ // use ===?
                    returnstr=str.substr(prefixes_to_remove[i].length);
                    //FIXME: Another hack. Need a better approach for this.
                    //Special case logic for HTML widgets
                    if(prefixes_to_remove[i]=='html.'){
                        returnstr='&lt;'+returnstr+'&gt;';
                    }
                    break;
                }
            }
            return returnstr;
        },
        __getWidgetNameText:function(widget){
            if(widget.domNode && widget.domNode.label){
                var text = "<span class='propertiesTitleWidgetName'>";
                text+="</span> ";
                return ""
            }

            var text = "<span class='propertiesTitleWidgetName'>";
            text+=this._remove_prefix(widget.type);
            text+="</span> ";
            return text;
        },
        __getWidgetText:function(widget){
            if(widget.domNode){
                var _label = null;
                if(widget.domNode.get){
                    _label = widget.domNode.get('label');
                }else{
                    _label = widget.domNode.label;
                }
                return _label;
            }
            return widget.type;
        },
        getData: function(/*Widget*/ widget, /*Object*/ options) {
            if(!widget){
                return undefined;
            }
            var data = widget._getData(options);
            var _uniqueId = dijit.getUniqueId(widget.type.replace(/\./g,"_"));            
            return data;
        },
        __create: function(widget) {
            widget._srcElement.setAttribute('id',widget.id);
        },
        __getChildren: function(widget, attach) {
            var dijitWidget = widget.dijitWidget;
            // First, get children from slider's containerNode.
            var children = [];//widget._getChildren(attach);

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
                if(childWidget){
                    if(childWidget.type=='xblox/RunScript'){
                        console.log('enum ' , childWidget);
                        children.push(childWidget);
                    }

                }
            });

            return children;

        },
        __getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
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
    return BlockHelper;

});