/**
 * Utilities for unit tests
 */
define([], function () {
		// avoid failure on IE9: console is not be defined when dev tools is not opened
		if (!window.console) {
			window.console = {};
		}
		if (!window.console.log) {
			window.console.log = function () {
			};
		}
		return this;
	}
);