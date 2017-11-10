define([
	"intern!object",
	"intern/chai!assert",
	"dcl/dcl",
	"decor/Evented"
], function (registerSuite, assert, dcl, Evented) {
	registerSuite({
		name: "Evented",
		basic: function () {
			var MyClass = dcl(Evented, {});
			var myObject = new MyClass();

			// Make sure there's no exception if you emit an event that no one is listening to.
			myObject.emit("nobody listening", 1, 2, 3);

			// Test emitting events.  Make sure that parameters are passed to listeners.
			var order = [];
			var handle = myObject.on("custom", function (a, b, c) {
				order.push(a, b, c);
			});
			myObject.emit("custom", 1, 2, 3);
			assert.deepEqual(order, [1, 2, 3]);

			// Make sure that calling unadvise() (or destroy()) stops the listener from getting notifications.
			handle.unadvise();
			myObject.emit("custom", 4, 5, 6);
			assert.deepEqual(order, [1, 2, 3]);
		}
	});
});
