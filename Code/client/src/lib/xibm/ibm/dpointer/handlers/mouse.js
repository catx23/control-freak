/**
 * This module listens to mouse events and generates corresponding pointer events.
 *
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
 */
define([
	"./utils"
], function (utils) {
	"use strict";

	var MouseEvents = {
			mousedown: "mousedown",
			mousemove: "mousemove",
			mouseout: "mouseout",
			mouseover: "mouseover",
			mouseup: "mouseup"
		},
		isScrolling = false; // indicates if the mouse is scrolling an element with CSS overflow=auto|scroll.

	/**
	 * mousedown event handler.
	 *
	 * @param e mouse event
	 */
	function mousedown(e) {
		MouseTracker.update(e);
		utils.dispatchEvent(e.target, createPointer(utils.events.DOWN, e, {}));
		// Firefox continues to send mouse event while dragging the scrollbar:
		// if overflow CSS style is set at target element, fire a PointerCancel,
		// then track and absorb subsequent mouse events until a mouseup occurs
		var overflow = (window.getComputedStyle(e.target).overflow);
		if (overflow && (overflow === "auto" || overflow === "scroll")) {
			isScrolling = true;
			utils.dispatchEvent(e.target, createPointer(utils.events.CANCEL, e, {}));
		}
	}

	/**
	 * mousemove event handler.
	 *
	 * @param e mouse event
	 */
	function mousemove(e) {
		if (isScrolling) {
			return;
		}
		utils.dispatchEvent(MouseTracker.identifyTarget(e.target), createPointer(utils.events.MOVE, e, {}));
		MouseTracker.update(e);
	}

	/**
	 * mouseout event handler.
	 *
	 * @param e mouse event
	 */
	function mouseout(e) {
		if (isScrolling || MouseTracker.hasCapture()) {
			return;
		}
		if (e.relatedTarget) {
			utils.dispatchEvent(e.target, createPointer(utils.events.OUT, e, {}));
			// generate pointerleave events
			utils.dispatchLeaveEvents(e.target, e.relatedTarget,
				createPointer(utils.events.LEAVE, e));
		}
		MouseTracker.update(e);
	}

	/**
	 * mouseover event handler.
	 *
	 * @param e mouse event
	 */
	function mouseover(e) {
		if (isScrolling || MouseTracker.hasCapture()) {
			return;
		}
		if (e.relatedTarget) {
			utils.dispatchEvent(e.target, createPointer(utils.events.OVER, e, {}));
			// generate pointerenter events
			utils.dispatchEnterEvents(e.target, e.relatedTarget,
				createPointer(utils.events.ENTER, e));
		}
		MouseTracker.update(e);
	}

	/**
	 * mouseup event handler.
	 *
	 * @param e mouse event
	 */
	function mouseup(e) {
		if (isScrolling) {
			isScrolling = false;
		} else {
			utils.dispatchEvent(MouseTracker.identifyTarget(e.target), createPointer(utils.events.UP, e, {}));
			MouseTracker.implicitReleaseCapture();
			MouseTracker.update(e);
		}
	}

	/**
	 * Create a synthetic pointer from a mouse event.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param mouseEvent the underlying mouse event which contributes to the creation of the pointer event.
	 * @param props event properties (optional)
	 * @returns {utils.Pointer}
	 */
	function createPointer(pointerType, mouseEvent, props) {
		props = props || {};
		// Mouse Events properties
		props.screenX = mouseEvent.screenX;
		props.screenY = mouseEvent.screenY;
		props.clientX = mouseEvent.clientX;
		props.clientY = mouseEvent.clientY;
		props.ctrlKey = mouseEvent.ctrlKey;
		props.altKey = mouseEvent.altKey;
		props.shiftKey = mouseEvent.shiftKey;
		props.metaKey = mouseEvent.metaKey;
		props.pageX = mouseEvent.pageX;
		props.pageY = mouseEvent.pageY;
		// normalize button/buttons values
		// http://www.w3.org/TR/pointerevents/#chorded-button-interactions
		var buttonValue = mouseEvent.button,
			buttonsValue = (mouseEvent.buttons !== undefined) ? mouseEvent.buttons :
				utils.which2buttons(mouseEvent.which);

		if (mouseEvent.type === "mousemove") {
			buttonValue = -1;
		}
		props.button = buttonValue;
		props.buttons = buttonsValue;
		props.which = buttonValue + 1;
		if (MouseTracker.hasCapture()) {  // Pointer events Spec §10.1: related target must be null on pointer capture
			props.relatedTarget = null;
		} else {
			props.relatedTarget = mouseEvent.relatedTarget;
		}
		// Pointer Events properties
		props.pointerId = 1;
		props.pointerType = "mouse";
		props.isPrimary = true;
		return new utils.Pointer(pointerType, mouseEvent, props);
	}

	var MouseTracker = {
		_lastNativeEvent: null,
		_captureTarget: null,
		register: function () {
		},
		update: function (mouseEvent) {
			this._lastNativeEvent = mouseEvent;
		},
		setCapture: function (targetElement) {
			// 1. check if pointerId is active, otw throw DOMException with the name InvalidPointerId.
			if (!this._lastNativeEvent) {
				throw "InvalidPointerId";
			}
			// 2. at least one button must be pressed
			if (this._lastNativeEvent.buttons === 0) {
				return false;
			}
			// 3. set PointerCapture=true
			this._captureTarget = targetElement;
			// 4. Fire a gotpointercapture event at the targetElement
			utils.dispatchEvent(this._lastNativeEvent.target,
				createPointer(utils.events.GOTCAPTURE, this._lastNativeEvent, {}));
			return true;
		},
		hasCapture: function () {
			return !!(this._captureTarget);
		},
		identifyTarget: function (nonCapturedElement) {
			return (this._captureTarget) || nonCapturedElement;
		},
		releaseCapture: function (targetElement, implicit) {
			// 1. check if pointerId is active, otw throw DOMException with the name InvalidPointerId.
			if (!this._lastNativeEvent) {
				throw "InvalidPointerId";
			}
			// 2. if pointer capture not set at targetElement, return
			if (!implicit && (this._captureTarget !== targetElement)) {
				return false;
			}
			// 3. release capture
			if (this._captureTarget) {
				// 4. Fire a lostpointercapture event at the targetElement
				utils.dispatchEvent(this._captureTarget,
					createPointer(utils.events.LOSTCAPTURE, this._lastNativeEvent, {}));
				this._captureTarget = null;
			}
			return true;
		},
		implicitReleaseCapture: function () {
			return this.releaseCapture(null, true);
		}
	};

	return {
		/**
		 * register mouse events handlers.
		 *
		 * @param targetElement target element for mouse event listeners
		 */
		registerHandlers: function (targetElement) {
			targetElement = targetElement || window.document;
			utils.addEventListener(targetElement, MouseEvents.mousedown, mousedown, true);
			utils.addEventListener(targetElement, MouseEvents.mousemove, mousemove, true);
			utils.addEventListener(targetElement, MouseEvents.mouseout, mouseout, true);
			utils.addEventListener(targetElement, MouseEvents.mouseover, mouseover, true);
			utils.addEventListener(targetElement, MouseEvents.mouseup, mouseup, true);
		},

		/**
		 * deregister mouse events handlers.
		 * @param targetElement target element for mouse event listeners
		 */
		deregisterHandlers: function (targetElement) {
			utils.removeEventListener(targetElement, MouseEvents.mousedown, mousedown, true);
			utils.removeEventListener(targetElement, MouseEvents.mousemove, mousemove, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseout, mouseout, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseover, mouseover, true);
			utils.removeEventListener(targetElement, MouseEvents.mouseup, mouseup, true);
		},

		/**
		 * set pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @returns true if pointer is captured.
		 */
		setPointerCapture: function (targetElement) {
			return MouseTracker.setCapture(targetElement);
		},

		/**
		 * release pointer capture.
		 *
		 * @param targetElement DOM element to be captured by the pointer
		 * @returns true is pointer is released.
		 */
		releasePointerCapture: function (targetElement) {
			return MouseTracker.releaseCapture(targetElement, false);
		}
	};
});