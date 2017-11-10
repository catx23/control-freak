/** @module decor/Destroyable */
define([
	"dcl/advise",
	"dcl/dcl"
], function (advise, dcl) {
	/**
	 * Mixin to track handles and release them when instance is destroyed.
	 *
	 * Call `this.own(...)` on list of handles (returned from dcl/advise, dojo/on,
	 * decor/Stateful#observe, or any class (including widgets) with a destroy() or remove() method.
	 * Then call `destroy()` later to destroy this instance and release the resources.
	 * @mixin module:decor/Destroyable
	 */
	var Destroyable = dcl(null, /** @lends module:decor/Destroyable# */ {
		/**
		 * Destroy this class, releasing any resources registered via `own()`.
		 * @method
		 */
		destroy: dcl.advise({
			before: function () {
				this._beingDestroyed = true;
				if (this._releaseHandles) {
					this._releaseHandles();
					delete this._releaseHandles;
				}
			},
			after: function () {
				this._destroyed = true;
			}
		}),

		/**
		 * Track specified handles and remove/destroy them when this instance is destroyed, unless they were
		 * already removed/destroyed manually.
		 *
		 * Each object passed to `own()` must either be a Promise (i.e. a thenable),
		 * or have either a `destroy()`, `remove()`, or `cancel()` method.  If an object has more
		 * than one of those methods, only the first matching one in the above list is used.
		 *
		 * @returns {Object[]} The array of specified handles, so you can do for example:
		 * `var handle = this.own(on(...))[0];`
		 * @protected
		 */
		own: function () {
			var cleanupMethods = [
				"destroy",
				"remove",
				"cancel"
			];

			// Convert arguments to array.
			var ary = Array.prototype.slice.call(arguments);

			// Track each argument.
			ary.forEach(function (handle) {
				// Figure out name of method to destroy handle.
				var destroyMethodName;
				for (var i = 0; i < cleanupMethods.length; i++) {
					if (cleanupMethods[i] in handle) {
						destroyMethodName = cleanupMethods[i];
						break;
					}
				}
				if (!destroyMethodName) {
					throw new TypeError("own() called with handle without destroy method");
				}

				// Register handle to be destroyed/released when this.destroy() is called.
				var odh = advise.after(this, "_releaseHandles", function () {
					handle[destroyMethodName]();
				});

				// Setup listeners for manual destroy of handle.
				if (handle.then) {
					// Special path for Promises.  Detect when Promise is settled and remove listener.
					handle.then(odh.destroy.bind(odh), odh.destroy.bind(odh));
				} else {
					// Path for non-promises.  Use AOP to detect when handle is manually destroyed.
					var hdh = advise.after(handle, destroyMethodName, function () {
						odh.destroy();
						hdh.destroy();
					});
				}
			}, this);

			return ary;
		},

		/**
		 * Wrapper to setTimeout to avoid deferred functions executing
		 * after the originating widget has been destroyed.
		 * @param {Function} fcn - Function to be executed after specified delay (or 0ms if no delay specified).
		 * @param {number} delay - Delay in ms, defaults to 0.
		 * @returns {Object} Handle with a remove method that deschedules the callback from being called.
		 * @protected
		 */
		defer: function (fcn, delay) {
			// TODO: if delay unspecified, use schedule?
			var timer = setTimeout(
				function () {
					if (!timer) {
						return;
					}
					timer = null;
					if (!this._destroyed) {
						fcn.call(this);
					}
				}.bind(this),
					delay || 0
			);
			return {
				remove: function () {
					if (timer) {
						clearTimeout(timer);
						timer = null;
					}
					return null; // so this works well: handle = handle.remove();
				}
			};
		}
	});

	dcl.chainBefore(Destroyable, "destroy");

	return Destroyable;
});
