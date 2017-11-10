/** @module decor/Evented */
define(["dcl/dcl", "dcl/advise"], function (dcl, advise) {
	/**
	 * Base class to add `on()` and `emit()` methods to a class for listening for events and emitting events.
	 * @example
	 * var EventedSubClass = dcl(Evented, {...});
	 * var instance = new EventedSubClass();
	 * instance.on("open", function (event) {
	 *     ... do something with event
	 * });
	 * instance.emit("open", {name: "some event", ...});
	 * @mixin module:decor/Evented
	 */
	return dcl(null, /** @lends module:decor/Evented# */ {
		/**
		 * Setup listener to be called when specified event is fired.
		 * @param {string} type - Name of event.
		 * @param {Function} listener - Callback for when event occurs.
		 * @returns {Object} Handle with `destroy()` method to stop listening to event.
		 */
		on: function (type, listener) {
			return advise.before(this, "on" + type, listener);
		},

		/**
		 * Emit specified event.
		 * @param {string} type - Name of event.
		 * @param {...anything} var_args Parameters to pass to the listeners for this event.
		 */
		emit: function (type) {
			var func = "on" + type;
			if (this[func]) {
				var args = Array.prototype.slice.call(arguments, 1);
				this[func].apply(this, args);
			}
		}
	});
});
