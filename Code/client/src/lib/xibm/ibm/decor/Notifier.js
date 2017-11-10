/** @module decor/Notifier */
define([
	"dcl/dcl",
	"./schedule"
], function (
	dcl,
	schedule
) {
	// Keep track of order that callbacks were registered, we will call them in that order
	// regardless of the order the objects were updated.
	var seq = 0;

	// ChangeCollectors with pending change notifications (to be delivered at end of microtask).
	var hotChangeCollectors = {};

	// Handle to timer to deliver change notifications.
	var deliverHandle;

	// Deliver all pending change notifications in the order that the callbacks were registered.
	function deliverAllByTimeout() {
		for (var anyWorkDone = true; anyWorkDone;) {
			anyWorkDone = false;

			// Observation may stop during observer callback
			var callbacks = [];
			for (var s in hotChangeCollectors) {
				callbacks.push(hotChangeCollectors[s]);
			}
			hotChangeCollectors = {};

			callbacks = callbacks.sort(function (lhs, rhs) {
				return lhs._seq - rhs._seq;
			});

			for (var i = 0, l = callbacks.length; i < l; ++i) {
				callbacks[i].deliver();
				anyWorkDone = true;
			}
		}
		deliverHandle = null;
	}

	/**
	 * Object to be notified of changes to specified object, queue up those changes,
	 * and eventually call the specified callback with summary of those changes.
	 */
	var Notifier = function (callback) {
		this._seq = seq++;
		this.callback = callback;
	};

	Notifier.prototype = /** @lends module:decor/Notifier */ {
		/**
		 * Record that specified property has changed.
		 * It will be notified at the end of microtask, or when deliver() is called.
		 * @method module:decor/Notifier#notify
		 * @param {string} prop - name of property
		 * @param oldVal - old value of property
		 */
		notify: function (prop, oldVal) {
			if (!this.oldVals) {
				this.oldVals = {};
			}

			if (!(prop in this.oldVals)) {
				this.oldVals[prop] = oldVal;
				hotChangeCollectors[this._seq] = this;
			}

			// Setup timer to notify callbacks at the end of microtask.
			// Note: Notifications are published in the order that objects are modified, rather than
			// in the order that objects were watched.  asudoh said this was bad and decor/Observable
			// somehow does it the other way.
			if (!deliverHandle) {
				deliverHandle = schedule(deliverAllByTimeout);
			}
		},

		/**
		 * Call callback with set of properties that have changed, and their old values.
		 * @method module:decor/Notifier#deliver
		 */
		deliver: function () {
			if (this.oldVals) {
				var oldVals = this.oldVals;
				delete this.oldVals;
				delete hotChangeCollectors[this._seq];
				this.callback(oldVals);
			}
		},

		/**
		 * Discard all changes queued up by notify().
		 * @method module:decor/Notifier#discardChanges
		 */
		discardChanges: function () {
			delete this.oldVals;
			delete hotChangeCollectors[this._seq];
		}
	};

	return Notifier;
});
