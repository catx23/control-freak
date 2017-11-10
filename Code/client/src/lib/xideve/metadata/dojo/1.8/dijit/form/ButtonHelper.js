define(function() {

var ButtonHelper = function() {};
ButtonHelper.prototype = {

        _getChildren: function(widget, attach) {

            var dijitWidget = widget.dijitWidget;
            // First, get children from slider's containerNode.
            var children = [];//widget._getChildren(attach);

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
		getChildrenData: function(/*Widget*/ widget, /*Object*/ options){
			// summary:
			//		The child in the markup of a button tag is its text content, so return that.
			//
	
			if (widget && widget.getTagName() == "BUTTON") {
				return widget.dijitWidget.label;
			}
			
			return undefined;
		}
		
		// FIXME: Original code from dojoy days. Commented out because currently untested.
		// Need to review and decide whether to resurrect.	
		// 
		// this.getPropertyValue = function(/*Widget*/ widget, /*String*/ name){
		// 	// summary:
		// 	//		Mask label attribute if the button's tag is BUTTON.
		// 	//
		// 	if(!widget || !name){
		// 		return undefined;
		// 	}

		// 	var context = widget.getContext();

		// 	if (context && widget.getTagName() == "BUTTON" && name == "label") {
		// 		return undefined;
		// 	}

		// 	return widget._getPropertyValue(name);
		// };
	};

return ButtonHelper;

});