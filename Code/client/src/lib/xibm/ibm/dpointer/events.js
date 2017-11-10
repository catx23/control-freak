/**
 * Pointer Events shim
 */
define([
	"./handlers/features",
	"./handlers/utils",
	"./handlers/touch",
	"./handlers/mouse",
	"./handlers/features!mspointer-events?./handlers/mspointer"
], function (has, utils, touch, mouse, mspointer) {
	"use strict";

	var pointerEvents = {_targetElement: null};

	/**
	 * Enable Pointer events. Register native event handlers. Importing this module automatically register native
	 * event handlers on window.document, unless you specify a target element.
	 *
	 * @param targetElement DOM element on which to attach handlers.
	 * @default window.document
	 */
	pointerEvents.enable = function (targetElement) {
		targetElement = targetElement || window.document;
		if (this._targetElement) {
			return;// already initialized
		}
		if (!has("pointer-events")) {
			if (has("mspointer-events")) {
				mspointer.registerHandlers(targetElement);
			} else {
				if (has("touch-events") && has("touch-device")) {
					touch.registerHandlers(targetElement);
				} else {
					mouse.registerHandlers(targetElement);
				}
			}
		}
		this._targetElement = targetElement;
	};

	/**
	 * Disable Pointer events. Unregister native event handlers.
	 */
	pointerEvents.disable = function () {
		if (this._targetElement) {
			touch.deregisterHandlers(this._targetElement);
			mouse.deregisterHandlers(this._targetElement);
			mspointer && mspointer.deregisterHandlers(this._targetElement);
		}
		this._targetElement = null;
	};

	/**
	 * Set the attribute touch-action on the target element.
	 * Supported touch-actions are "auto" (user agent handles touch actions
	 * default behaviors), "none" (disable user agent default behavior), pan-x and pan-y.
	 *
	 * @param targetElement a DOM element
	 * @param actionType touch action type: "auto", "none", "pan-x" or "pan-y"
	 */
	pointerEvents.setTouchAction = function (targetElement, actionType) {
		targetElement.setAttribute(utils.TouchAction.ATTR_NAME, actionType);
	};

	/**
	 * Set pointer capture on a DOM element.
	 *
	 * @param targetElement DOM element
	 * @param pointerId Pointer ID
	 */
	pointerEvents.setPointerCapture = function (targetElement, pointerId) {
		// todo: Internet Explorer automatically set pointer capture on form controls when touch-action is none
		// todo: manage a list of element type to apply pointer capture automatically when touch-action=none is set??
		if (!this._targetElement) {
			return false;// not initialized
		}
		if (has("pointer-events")) {
			return targetElement.setPointerCapture(pointerId);// use native Pointer Events method
		} else {
			if (has("mspointer-events")) {
				return targetElement.msSetPointerCapture(pointerId);// use native Pointer Events method
			} else {
				if (pointerId === 1) { // mouse always gets ID = 1
					return mouse.setPointerCapture(targetElement);
				} else {
					return touch.setPointerCapture(targetElement, pointerId);
				}
			}
		}
	};

	/**
	 * Unset pointer capture on a DOM element.
	 *
	 * @param targetElement DOM element
	 * @param pointerId Pointer ID
	 */
	pointerEvents.releasePointerCapture = function (targetElement, pointerId) {
		if (!this._targetElement) {
			return false;
		}
		if (has("pointer-events")) {
			return targetElement.releasePointerCapture(pointerId);
		} else {
			if (has("mspointer-events")) {
				return targetElement.msReleasePointerCapture(pointerId);
			} else {
				if (pointerId === 1) {
					return mouse.releasePointerCapture(targetElement);
				} else {
					return touch.releasePointerCapture(targetElement, pointerId);
				}
			}
		}
	};

	/**
	 * CSS rule to define touch-action or -ms-touch-action when touch-action attribute is set on Elements.
	 *
	 * @param styleName should be touch-action or -ms-touch-action
	 */
	function insertTouchActionCSSRule(styleName) {
		var styleElement = document.createElement("style"),
			attributeName = utils.TouchAction.ATTR_NAME;
		styleElement.textContent = "[" + attributeName + "='none']  { " + styleName + ": none; }" +
			"[" + attributeName + "='auto']  { " + styleName + ": auto; }" +
			"[" + attributeName + "='pan-x'] { " + styleName + ": pan-x; }" +
			"[" + attributeName + "='pan-y'] { " + styleName + ": pan-y; }" +
			"[" + attributeName + "='pan-x pan-y'],[" + styleName + "='pan-y pan-x'] " +
			"{ " + styleName + ": pan-x pan-y; }";
		document.head.insertBefore(styleElement, document.head.firstChild);
	}

	// CSS rule when user agent implements W3C Pointer Events or when a polyfill is in place.
	if (has("pointer-events")) {
		insertTouchActionCSSRule("touch-action");
	}

		// CSS rule for IE10 and IE11 preview
	if (has("mspointer-events")) {
		insertTouchActionCSSRule("-ms-touch-action");
	}
	// CSS rule to map CSS attribute in case user agent has native support for touch-action or -ms-touch-action
	// CSS property.
	if (has("css-touch-action")) {
		insertTouchActionCSSRule("touch-action");
	} else {
		// CSS rule for IE10 and IE11 preview
		if (has("css-ms-touch-action")) {
			insertTouchActionCSSRule("-ms-touch-action");
		}
	}

	// start listening to native events
	pointerEvents.enable();

	return pointerEvents;
});