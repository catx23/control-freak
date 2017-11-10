/** @module dojo/dnd/Target **/
define([
    "../_base/declare",
    "../dom-class",
    "./Source"
], function(declare, domClass, Source){
    /**
     * A Target object, which can be used as a DnD target
     * @class module:dojo/dnd/Target
     * @extends module:dojo/dnd/Source
     */
    return declare("dojo.dnd.Target", Source, {
		constructor: function(/*===== node, params =====*/){
			// summary:
			//		a constructor of the Target --- see the `dojo/dnd/Source` constructor for details
			this.isSource = false;
			domClass.remove(this.node, "dojoDndSource");
		}
	});
});
