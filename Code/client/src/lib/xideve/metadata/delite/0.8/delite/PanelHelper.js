define([
    "dojo/_base/declare"
], function (declare) {
    return declare(null, {
        /**
         * Override helper function to ChooseParent.js:isAllowed() for deciding whether
         * this particular widget type can be a child of a particular parent type.
         * @param {object} args  - object with following properties
         * 		{string} childType - eg "dijit.form.Button"
         * 		{array} childClassList - list of valid children for parent, eg ["ANY"] or ["dojox.mobile.ListItem"]
         * 		{string} parentType - eg "html.body"
         * 		{array} parentClassList - list of valid parent for child, eg ["ANY"] or ["dojox.mobile.RoundRectList","dojox.mobile.EdgeToEdgeList"]
         * 		{boolean} absolute - whether current widget will be added with position:absolute
         * 		{boolean} isAllowedChild - whether Maqetta's default processing would allow this child for this parent
         * 		{boolean} isAllowedParent - whether Maqetta's default processing would allow this parent for this child
         * @returns {boolean}
         * Note: Maqetta's default processing returns (args.isAllowedChild && args.isAllowedParent)
         */
        isAllowed: function(args){
            console.log('isAllowed',args);
            if(args.parentType ==='delite/ViewStack' || args.parentType ==='delite/Accordion'){
                return true;
            }else if(args.parentType ==='delite/Panel'){
                return false;
            }
            else{
                return false;
            }
            
            if(args.absolute){
                // Don't allow View widgets to be positioned absolutely
                // Doesn't work with dojox.mobile because dojox.mobile will always force top:0px
                //return false;
            }else{
                return args.isAllowedChild && args.isAllowedParent;
            }
        },
        /**
         * Helper function called to establish widget size at initial creation time
         * @param {object} args  holds following values:
         *        parent - target parent widget for initial creation
         */
        initialSize: function (args) {
            var returnVal = null;

            //console.log('initial size2');
            
            

            // If widget is not being added at an absolute location (i.e., no value for args.position)
            // and if parent is BODY,  widget is only child, and user didn't drag out a size (ie no value for args.size),
            // then set initial size to 100%. In all other cases, we'll defer to the CreateTool.
            if (args && !args.position && !args.size) {
                returnVal = {
                    w: '100%',
                    h: '300px'
                };

                //Let's look at our parent
                var parentWidget = args.parent;
                var parentWidgetType = parentWidget.type;
                var parentChildren = parentWidget.getData().children;
                if (parentWidget.type) {
                    if (parentWidgetType == 'html.body') {
                        //Being added to BODY
                        if (!parentChildren || parentChildren.length) {
                            //Widget is first child, so fill body if fillBodyAsOnlyChild flag tells us to
                            returnVal = {
                                w: '100%',
                                h: this._fillBodyAsOnlyChild ? '100%' : "300px"
                            };
                        }
                    } else if (parentWidgetType == 'dijit/layout/ContentPane' ||
                        parentWidgetType == 'html.div' ||
                        parentWidgetType == 'html.form' ||
                        parentWidgetType == 'html.fieldset') {
                        //Being added to another well known container type
                        if (!parentChildren || !parentChildren.length) {
                            //Widget is first child, so fill container
                            returnVal = {
                                w: '100%',
                                h: '100%'
                            };
                        }
                    }
                }

            }
            if(args && args.position){
                returnVal = {

                }
            }

            return returnVal;
        }
    });
});