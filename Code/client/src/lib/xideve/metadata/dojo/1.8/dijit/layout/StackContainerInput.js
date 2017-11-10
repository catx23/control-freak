define([
	"dojo/_base/declare",
	"./ContainerInput",
	"../lang/dijit"
], function(
	declare,
	ContainerInput,
	dijitNls
) {

return declare(ContainerInput, {

	propertyName: "title",
	supportsHTML: "true",
	helpText: "",
	
	constructor : function() {
		this.helpText = dijitNls.stackContainerInputHelp;
	}
});

});