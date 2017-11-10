/** @module decor/Invalidating */
define([
	"dcl/dcl",
	"./Stateful",
	"./Destroyable"
], function (dcl, Stateful, Destroyable) {
	/**
	 * Mixin class for widgets
	 * that want to calculate computed properties at once and/or to render UI at once upon multiple property changes.
	 * @class module:decor/Invalidating
	 */
	var Invalidating = dcl([Stateful, Destroyable], /** @lends module:decor/Invalidating# */ {
		// Call initializeInvalidating() right after class is constructed.  Note though that this code won't run for
		// custom elements, since they call createdCallback() rather than constructor().
		// Instead, delite/Widget calls initializeInvalidating() directly.
		constructor: dcl.after(function () {
			this.initializeInvalidating();
		}),

		/**
		 * Make initial calls to `computeProperties()`, `initializeRendering()`, and `refreshRendering()`,
		 * and setup observers so those methods are called whenever properties are modified in the future.
		 * Normally this method is called automatically by the constructor, and should not be called manually,
		 * but the method is exposed for custom elements since they do not call the `constructor()` method.
		 * @protected
		 */
		initializeInvalidating: function () {
			if (!this._hComputing && !this._hRendering) {
				// Make initial call to computeProperties() and setup listener for future calls to computeProperties().
				// Any call to computeProperties(), including the initial call, may trigger more immediate calls to
				// computeProperties().
				this.own(this._hComputing = this.observe(function (oldValues) {
					this.computeProperties(oldValues);
					this.deliverComputing();
				}));
				this.computeProperties(this, true);

				// Make initial call to initializeRendering() and refreshRendering(), and setup listener for future
				// calls.
				this.initializeRendering(this);
				this.refreshRendering(this, true);
				this.own(this._hRendering = this.observe(function (oldValues) {
					var shouldInitializeRendering = this.shouldInitializeRendering(oldValues);
					if (shouldInitializeRendering) {
						this.initializeRendering(oldValues);
						this.refreshRendering(this, true);
					} else {
						this.refreshRendering(oldValues);
					}
				}));
			}
		},

		/**
		 * Synchronously deliver change records for computed properties
		 * so that `computeProperties()` is called if there are pending change records.
		 */
		deliverComputing: function () {
			this._hComputing && this._hComputing.deliver();
			return this._hComputing;
		},

		/**
		 * Discard change records for computed properties.
		 */
		discardComputing: function () {
			this._hComputing && this._hComputing.discardChanges();
			return this._hComputing;
		},

		destroy: function () {
			this._hComputing = null;
			this._hRendering = null;
		},

		/**
		 * Function to return if rendering should be initialized.
		 * (Instead of making partial changes for post-initialization)
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterCreation True if this call is right after instantiation.
		 * @return {boolean} True if rendering should be initialized.
		 */
		shouldInitializeRendering: function () {},

		/**
		 * Callback function to calculate computed properties upon property changes.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterCreation True if this call is right after instantiation.
		 */
		computeProperties: function () {},

		/**
		 * Callback function to initialize rendering.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 */
		initializeRendering: function () {},

		/**
		 * Callback function to render UI upon property changes.
		 * @param {Object} oldValues The hash table of old property values, keyed by property names.
		 * @param {boolean} isAfterInitialRendering True if this call is right after `initializeRendering()`.
		 */
		refreshRendering: function () {}
	});

	dcl.chainAfter(Invalidating, "computeProperties");
	dcl.chainAfter(Invalidating, "refreshRendering");

	return Invalidating;
});
