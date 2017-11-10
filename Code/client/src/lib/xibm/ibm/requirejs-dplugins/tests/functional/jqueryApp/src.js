// Mock application for testing jquery plugin.
// Simply returns a function that adds the class "foo" to the specified node.
define(["requirejs-dplugins/jquery!attributes/classes"], function ($) {
	return function (node) {
		$(node).addClass("foo");
	};
});
