define([
	"intern!object",
	"intern/chai!assert",
	"dpointer/handlers/utils",
	"../TestUtils"
], function (registerSuite, assert, utils) {

	registerSuite({
		name: "SyntheticPointer",
		// create a synthetic pointer and check that properties are well defined and equal to expected values.
		"check properties": function () {
			if ("onpointerdown" in document) {
				// current platform supports Pointer Events.
				console.log("==> Skipping tests because Pointer Events are supported natively");
				return;
			}

			var initProps = {
					bubbles: true,
					cancelable: true,
					view: window,
					detail: 2
				},
				eventProps = {
					screenX: 20,
					screenY: 21,
					clientX: 22,
					clientY: 23,
					ctrlKey: true,
					shiftKey: true,
					altKey: true,
					metaKey: true,
					button: 1,
					relatedTarget: document.body,
					which: 2,
					pageX: 24,
					pageY: 25,
					buttons: 1
				};

			console.log("create MouseEvent...");
			var nativeEvt = document.createEvent("MouseEvents");
			nativeEvt.initMouseEvent("mousedown",
				initProps.bubbles, initProps.cancelable, initProps.view, initProps.detail,
				(eventProps.screenX + 10), (eventProps.screenY + 10),
				(eventProps.clientX + 10), (eventProps.clientY + 10),
				(!eventProps.ctrlKey), (!eventProps.altKey), (!eventProps.shiftKey), (!eventProps.metaKey),
				(eventProps.button + 1), eventProps.relatedTarget
			);

			var event;
			try {
				console.log("create synthetic Pointer Event...");
				event = new utils.Pointer("pointerdown", nativeEvt, eventProps);
			} catch (error) {
				assert.fail(error, "success", error);
			}

			Object.keys(initProps).forEach(function (name) {
				console.log(name + " [" + initProps[name] + "] is [" + event[name] + "]");
				assert.strictEqual(initProps[name], event[name], name);
			});

			Object.keys(eventProps).forEach(function (name) {
				console.log(name + " [" + eventProps[name] + "] is [" + event[name] + "]");
				assert.strictEqual(eventProps[name], event[name], name);
			});
		}
	});
});