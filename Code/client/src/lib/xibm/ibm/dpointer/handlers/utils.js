/**
 * Pointer Events utilities
 */
define([

], function () {
	"use strict";

	var utils = {
		events: { // pointer events names
			DOWN: "pointerdown",
			UP: "pointerup",
			CANCEL: "pointercancel",
			MOVE: "pointermove",
			OVER: "pointerover",
			OUT: "pointerout",
			ENTER: "pointerenter",
			LEAVE: "pointerleave",
			GOTCAPTURE: "gotpointercapture",
			LOSTCAPTURE: "lostpointercapture"
		},
		TouchAction: { // touch action
			ATTR_NAME: "touch-action",
			AUTO: 0,  // 0000
			PAN_X: 1, // 0001
			PAN_Y: 2, // 0010
			NONE: 3   // 0011
		}
	};

	// Properties and their default value used to create synthetic "Pointer Events" 
	var eventPropDesc = {
		// MouseEvent interface properties
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		ctrlKey: null,
		shiftKey: null,
		altKey: null,
		metaKey: null,
		button: 0,
		relatedTarget: null,
		// MouseEvent non standard properties
		which: 0,
		pageX: 0,
		pageY: 0,
		buttons: 0,
		// PointerEvent interface properties
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tiltX: 0,
		tiltY: 0,
		pointerType: "",
		isPrimary: false
	};

	// Pointer Events properties depending on the event type
	var eventTypeDesc = {
		pointerover: {bubbles: true, cancelable: true},
		pointerenter: {bubbles: false, cancelable: false},
		pointerdown: {bubbles: true, cancelable: true},
		pointermove: {bubbles: true, cancelable: true},
		pointerup: {bubbles: true, cancelable: true},
		pointercancel: {bubbles: true, cancelable: false},
		pointerout: {bubbles: true, cancelable: true},
		pointerleave: {bubbles: false, cancelable: false},
		gotpointercapture: {bubbles: true, cancelable: false},
		lostpointercapture: {bubbles: true, cancelable: false}
	};

	// Check if all properties can be redefined using a UIEvent.
	// Synthetic Pointer Event are created from a UIEvent.
	// "MouseEvent" would be too restrictive when it comes to redefine properties. 
	// "Event" may be better for performance and lest restrictive to redefine properties, but it causes weird/unstable
	// behavior on some Samsung/Android 4.2.2 browsers (fast moving of a Slider cause event.target to be null at
	// some point...)
	var canRedefineUIEvent = (function () {
		try {
			defineEventProperties(document.createEvent("UIEvent"), {});
			return true;
		} catch (error) {
			eventPropDesc.view = null;
			eventPropDesc.detail = 0;
			return false;
		}
	})();

	/**
	 * Pointer Event constructor.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param nativeEvent underlying event which contributes to this pointer event.
	 * @param props event properties (optional). Note that "bubbles", "cancelable", "view" and "detail" are ignored. 
	 * @returns Event a  Pointer event
	 */
	utils.Pointer = function (pointerType, nativeEvent, props) {
		var event;
		// set bubbles and cancelable value according to pointer event type
		props.bubbles = eventTypeDesc[pointerType].bubbles;
		props.cancelable = eventTypeDesc[pointerType].cancelable;
		// create the base event
		if (canRedefineUIEvent) {
			event = document.createEvent("UIEvent");
			event.initUIEvent(
				pointerType, props.bubbles, props.cancelable, nativeEvent.view || null, nativeEvent.detail || 0
			);
		} else {
			// fallback (iOS 7 disallows to redefine property value/getter)
			event = document.createEvent("Event");
			event.initEvent(pointerType, props.bubbles, props.cancelable);
			// view and detail properties are not available in Event constructor 
			props.view = nativeEvent.view || null;
			props.detail = nativeEvent.detail || 0;
		}
		// redefine event properties
		defineEventProperties(event, props);
		// map functions
		mapNativeFunctions(event, nativeEvent);

		return event;
	};

	/**
	 * @param e event
	 * @param props event properties
	 * @returns Event
	 */
	function defineEventProperties(e, props) {
		props.pressure = props.pressure || (props.buttons ? 0.5 : 0);
		var propsDesc = {};
		Object.keys(eventPropDesc).forEach(function (name) {
			if (name in e) {
				this[name] = {
					get: function () {
						return props[name] || eventPropDesc[name];
					}
				};
			} else {
				this[name] = {
					value: props[name] || eventPropDesc[name]
				};
			}
		}, propsDesc);
		Object.defineProperties(e, propsDesc);
		return e;
	}

	/**
	 * creates a synthetic click event with properties based on another event.
	 *
	 * @param sourceEvent the underlying event which contributes to the creation of this event.
	 * @param dblClick set to true to generate a dblclick event, otherwise a click event is generated
	 * @returns {Event} the event (click or dblclick)
	 */
	utils.createSyntheticClick = function (sourceEvent, dblClick) {
		var e = document.createEvent("MouseEvents");
		if (e.isTrusted === undefined) { // Android 4.1.1 does not implement isTrusted
			Object.defineProperty(e, "isTrusted", {
				value: false,
				enumerable: true,
				writable: false,
				configurable: false
			});
		}
		e.initMouseEvent(dblClick ? "dblclick" : "click", true, // bubbles
			true, // cancelable
			sourceEvent.view,
			dblClick ? 2 : 1,
			sourceEvent.screenX,
			sourceEvent.screenY,
			sourceEvent.clientX,
			sourceEvent.clientY,
			sourceEvent.ctrlKey,
			sourceEvent.altKey,
			sourceEvent.shiftKey,
			sourceEvent.metaKey, 0, // button property (touch: always 0)
			null); // no related target
		return e;
	};

	/**
	 * returns true for a native click event, false for a synthetic click event.
	 *
	 * @param e an event
	 * @returns true if native event, false for synthetic event.
	 */
	utils.isNativeClickEvent = function (e) {
		return (e.isTrusted === undefined || e.isTrusted);
	};

	/**
	 * returns the value of MouseEvent.buttons from MouseEvent.which.
	 *
	 * @param whichValue value of a MouseEvent.which property
	 * @returns Number the value MouseEvent.buttons should have
	 */
	utils.which2buttons = function (whichValue) {
		switch (whichValue) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 4;
		case 3:
			return 2;
		default:
			return Math.pow(2, (whichValue - 1));
		}
	};

	/**
	 * Registers the event handler eventListener on target element targetElement
	 * for events of type eventName.
	 *
	 * @param targetElement DOM element to attach the event listener
	 * @param eventName the event type name ("mousedown", "touchstart"...)
	 * @param eventListener an event listener function
	 * @param useCapture set to true to set the handler at the event capture phase
	 */
	utils.addEventListener = function (targetElement, eventName, eventListener, useCapture) {
		targetElement.addEventListener(eventName, eventListener, useCapture);
	};

	/**
	 * Unregister an existing handler.
	 *
	 * @param targetElement DOM element where the event listener is attached
	 * @param eventName  the event type name ("mousedown", "touchstart"...)
	 * @param eventListener the event listener function to remove
	 * @param useCapture set to true if the handler is set at the event capture phase
	 */
	utils.removeEventListener = function (targetElement, eventName, eventListener, useCapture) {
		targetElement.removeEventListener(eventName, eventListener, useCapture);
	};

	/**
	 * Dispatch an event.
	 *
	 * @param targetElement DOM element
	 * @param event event
	 */
		// possible optimization:
		// Chrome: use getEventListeners() to dispatch event ONLY if there is a listener for the target event type
		// other: hook HTMLElement.prototype.addEventListener to keep a record of active [element|event type]
	utils.dispatchEvent = function (targetElement, event) {
		if (!targetElement) {
			// handle case when  moving a pointer outside the window (elementFromTouch return null)
			return false;
		}
		if (!(targetElement.dispatchEvent)) {
			throw new Error("dispatchEvent not supported on targetElement");
		}
		return targetElement.dispatchEvent(event);
	};

	/**
	 * Dispatch pointerleave events.
	 *
	 * @param target DOM element
	 * @param relatedTarget DOM element
	 * @param syntheticEvent the pointerleave event to dispatch
	 */
	utils.dispatchLeaveEvents = function (target, relatedTarget, syntheticEvent) {
		if (target != null &&
			relatedTarget != null &&
			target !== relatedTarget && !(target.compareDocumentPosition(relatedTarget) & 16)) {
			return this.dispatchEvent(target, syntheticEvent) &&
				this.dispatchLeaveEvents(target.parentNode, relatedTarget, syntheticEvent);
		}
		return true;
	};

	/**
	 * Dispatch pointerenter events.
	 *
	 * @param target DOM element
	 * @param relatedTarget DOM element
	 * @param syntheticEvent the pointerenter event to dispatch
	 */
	utils.dispatchEnterEvents = function (target, relatedTarget, syntheticEvent) {
		if (target != null &&
			relatedTarget != null &&
			target !== relatedTarget && !(target.compareDocumentPosition(relatedTarget) & 16)) {
			return this.dispatchEnterEvents(target.parentNode, relatedTarget, syntheticEvent) &&
				this.dispatchEvent(target, syntheticEvent);
		}
		return true;
	};

	/**
	 * @param e event
	 * @param nativeEvent underlying event which contributes to this pointer event.
	 */
	function mapNativeFunctions(e, nativeEvent) {
		if (e.type === utils.GOTCAPTURE || e.type === utils.LOSTCAPTURE) {
			return; //no default action on pointercapture events
		}
		if (e.bubbles) {
			var _stopPropagation = e.stopPropagation;
			e.stopPropagation = function () {
				nativeEvent.stopPropagation();
				_stopPropagation.apply(this);
			};
			if (e.stopImmediatePropagation) {
				var _stopImmediatePropagation = e.stopImmediatePropagation;
				e.stopImmediatePropagation = function () {
					nativeEvent.stopImmediatePropagation();
					_stopImmediatePropagation.apply(this);
				};
			}
		}
		if (eventTypeDesc[e.type].cancelable) {
			var _preventDefault = e.preventDefault;
			e.preventDefault = function () {
				nativeEvent.preventDefault();
				_preventDefault.apply(this);
			};
		}
	}

	return utils;
});