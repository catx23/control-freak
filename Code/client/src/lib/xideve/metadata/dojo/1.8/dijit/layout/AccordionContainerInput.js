define([
	"dojo/_base/declare",
	"./StackContainerInput",
	"../lang/dijit"
], function(
	declare,
	StackContainerInput,
	dijitNls
) {

return declare(StackContainerInput, {
	multiLine: "true",
	format: "rows",
	supportsHTML: "true",
    helpText:  "",
    
    constructor : function() {
		this.helpText = dijitNls.accordionContainerInputHelp;
	}
});

});