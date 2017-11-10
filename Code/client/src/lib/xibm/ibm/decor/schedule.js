/** @module decor/schedule */
define(["./features"], function (has) {
	"use strict";

	/**
	 * Calls a function at the end of microtask.
	 * @function module:decor/schedule
	 * @param {Function} callback The function to call at the end of microtask.
	 */

	/* global setImmediate */
	var inFlight,
		SCHEDULEID_PREFIX = "_schedule",
		seq = 0,
		uniqueId = Math.random() + "",
		callbacks = {},
		pseudoDiv = has("mutation-observer-api") && document.createElement("div");
	function runCallbacks() {
		for (var anyWorkDone = true; anyWorkDone;) {
			anyWorkDone = false;
			for (var id in callbacks) {
				var callback = callbacks[id];
				delete callbacks[id];
				callback();
				anyWorkDone = true;
			}
		}
		inFlight = false;
	}
	if (has("mutation-observer-api")) {
		pseudoDiv.id = 0;
		new MutationObserver(runCallbacks).observe(pseudoDiv, {attributes: true});
	} else if (!has("setimmediate-api") && has("host-browser")) {
		window.addEventListener("message", function (event) {
			if (event.data === uniqueId) {
				runCallbacks();
			}
		});
	}
	return function (callback) {
		var id = SCHEDULEID_PREFIX + seq++;
		callbacks[id] = callback;
		if (!inFlight) {
			has("mutation-observer-api") ? ++pseudoDiv.id :
				has("setimmediate-api") ? setImmediate(runCallbacks) :
				window.postMessage(uniqueId, "*");
			inFlight = true;
		}
		return {
			remove: function () {
				delete callbacks[id];
			}
		};
	};
});
