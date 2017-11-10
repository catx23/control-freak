/**
 * this module listen to prefixed "ms" pointer events generates corresponding pointer events.
 *
 * http://msdn.microsoft.com/en-us/library/windows/apps/hh441233.aspx
 */
define([
	"./utils"
], function (utils) {
	"use strict";

	var msPointerEvents = {
		MSPointerDown: "MSPointerDown",
		MSPointerMove: "MSPointerMove",
		MSPointerUp: "MSPointerUp",
		MSPointerOut: "MSPointerOut",
		MSPointerOver: "MSPointerOver",
		MSPointerCancel: "MSPointerCancel",
		MSGotPointerCapture: "MSGotPointerCapture",
		MSLostPointerCapture: "MSLostPointerCapture"
	};

	/**
	 * MSPointerDown event handler.
	 *
	 * @param e event
	 */
	function msPointerDown(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.DOWN, e, {}));
	}

	/**
	 * MSPointerMove event handler.
	 *
	 * @param e event
	 */
	function msPointerMove(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.MOVE, e, {}));
	}

	/**
	 * MSPointerUp event handler.
	 *
	 * @param e event
	 */
	function msPointerUp(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.UP, e, {}));
	}

	/**
	 * MSPointerOut event handler.
	 *
	 * @param e event
	 */
	function msPointerOut(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.OUT, e, {}));
		// generate  pointerleave events
		utils.dispatchLeaveEvents(e.target, e.relatedTarget, createPointer(utils.events.LEAVE, e));
	}

	/**
	 * MSPointerOver event handler.
	 *
	 * @param e event
	 */
	function msPointerOver(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.OVER, e, {}));
		// generate  pointerenter events
		utils.dispatchEnterEvents(e.target, e.relatedTarget, createPointer(utils.events.ENTER, e));
	}

	/**
	 * MSPointerCancel event handler.
	 *
	 * @param e event
	 */
	function msPointerCancel(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.CANCEL, e, {}));
	}

	/**
	 * MSGotPointerCapture event handler.
	 *
	 * @param e event
	 */
	function msGotPointerCapture(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.GOTCAPTURE, e, {}));
	}

	/**
	 * MSLostPointerCapture event handler.
	 *
	 * @param e event
	 */
	function msLostPointerCapture(e) {
		utils.dispatchEvent(e.target, createPointer(utils.events.LOSTCAPTURE, e, {}));
	}

	/**
	 * create a synthetic pointer from a MS Pointer Event.
	 *
	 * @param pointerType pointer event type name ("pointerdown", "pointerup"...)
	 * @param msPointerEvent the underlying ms pointer event which contributes to the creation of the pointer event.
	 * @param props event properties (optional)
	 * @returns {utils.Pointer}
	 */
	function createPointer(pointerType, msPointerEvent, props) {
		props = props || {};
		// Mouse events properties
		props.detail = msPointerEvent.detail;
		props.screenX = msPointerEvent.screenX;
		props.screenY = msPointerEvent.screenY;
		props.clientX = msPointerEvent.clientX;
		props.clientY = msPointerEvent.clientY;
		props.ctrlKey = msPointerEvent.ctrlKey;
		props.altKey = msPointerEvent.altKey;
		props.shiftKey = msPointerEvent.shiftKey;
		props.metaKey = msPointerEvent.metaKey;
		props.button = msPointerEvent.button;
		props.buttons = msPointerEvent.buttons;
		props.relatedTarget = msPointerEvent.relatedTarget;
		// Pointer Events properties
		props.pointerId = msPointerEvent.pointerId;
		props.width = msPointerEvent.width;
		props.height = msPointerEvent.height;
		props.pressure = msPointerEvent.pressure;
		props.tiltX = msPointerEvent.tiltX;
		props.tiltY = msPointerEvent.tiltY;
		props.pointerType = normalizePointerType(msPointerEvent.pointerType);
		props.hwTimestamp = msPointerEvent.hwTimestamp;
		props.isPrimary = msPointerEvent.isPrimary;
		// fix wrong button value on IE10 and IE11 preview
		if ((props.button === -1) && (props.pointerType === "touch")) {
			props.buttons = 1;
		}
		return new utils.Pointer(pointerType, msPointerEvent, props);
	}

	/**
	 * for IE10 and IE11 preview.
	 * http://msdn.microsoft.com/en-us/library/ie/dn304886%28v=vs.85%29.aspx
	 *
	 * @param pointerType
	 * @returns {*}
	 */
	function normalizePointerType(pointerType) {
		switch (pointerType) {
		case 2:
			return "touch";
		case 3:
			return "pen";
		case 4:
			return "mouse";
		default:
			return pointerType;
		}
	}

	return {
		/**
		 * register MS Pointer events handlers.
		 *
		 * @param targetElement target element for event listeners
		 */
		registerHandlers: function (targetElement) {
			targetElement = targetElement || window.document;
			utils.addEventListener(targetElement, msPointerEvents.MSPointerDown, msPointerDown, true);
			utils.addEventListener(targetElement, msPointerEvents.MSPointerMove, msPointerMove, true);
			utils.addEventListener(targetElement, msPointerEvents.MSPointerUp, msPointerUp, true);
			utils.addEventListener(targetElement, msPointerEvents.MSPointerOut, msPointerOut, true);
			utils.addEventListener(targetElement, msPointerEvents.MSPointerOver, msPointerOver, true);
			utils.addEventListener(targetElement, msPointerEvents.MSPointerCancel, msPointerCancel, true);
			utils.addEventListener(targetElement, msPointerEvents.MSGotPointerCapture, msGotPointerCapture, true);
			utils.addEventListener(targetElement, msPointerEvents.MSLostPointerCapture, msLostPointerCapture, true);
		},

		/**
		 * deregister MSPointer events handlers.
		 *
		 * @param targetElement target element for event listeners
		 */
		deregisterHandlers: function (targetElement) {
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerDown, msPointerDown, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerMove, msPointerMove, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerUp, msPointerUp, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerOut, msPointerOut, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerOver, msPointerOver, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSPointerCancel, msPointerCancel, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSGotPointerCapture, msGotPointerCapture, true);
			utils.removeEventListener(targetElement, msPointerEvents.MSLostPointerCapture, msLostPointerCapture, true);
		}
	};
});