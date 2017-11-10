// Mock application for testing css plugin.
// Simply require the styles/styles.css file.
define(["requirejs-dplugins/css!styles/styles.css"], function () {
	return function noop() {};
});
