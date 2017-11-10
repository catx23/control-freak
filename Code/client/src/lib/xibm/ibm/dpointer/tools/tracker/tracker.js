/**
 *
 * @param tableLogElement
 * @param trackingAreaElement
 * @constructor
 */
var EventTracker = function (tableLogElement, trackingAreaElement) {
	this.tableLogElement = tableLogElement;
	this.trackingAreaElement = trackingAreaElement;

	var events = [
		// mouse events
		"mousedown", "mouseup", "mouseover", "mousemove", "mouseout", "mouseenter", "mouseleave",
		"click", "dblclick", "contextmenu",
		// touch events
		"touchstart", "touchmove", "touchend", "touchcancel",
		// MS pointer events
		"MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerOut", "MSPointerOver", "MSPointerCancel",
		"MSGotPointerCapture", "MSLostPointerCapture", "MSPointerEnter", "MSPointerLeave",
		// pointer events
		"pointerdown", "pointermove", "pointerup", "pointerout", "pointerover", "pointercancel",
		"gotpointercapture", "lostpointercapture", "pointerenter", "pointerleave"
	];
	var preventDefaultElements = []; // [ [elementId, status], [elementId, status], ... ]
	var lastEventTS = 0;
	var maxRow = 40;
	var minCell2Display = 10;

	var eventLogColumns = ["eventType", "targetElt", "bubble", "pointerInfo", "clientCoord", "buttonButtonsWhich",
		"currentTarget", "relatedTarget"];

	// jshint maxcomplexity: 16
	var EventLogEntry = function (event, touch) {
		this.eventType = event.type;
		if (event.type === "click" || event.type === "dblclick") {
			// trusted = T , untrusted = U , undefined = ?
			this.eventType = this.eventType +
				((event.isTrusted === undefined) ? " (?)" : ((event.isTrusted) ? " (T)" : " (U)"));
		}
		this.targetElt = event.target.id;
		this.bubble = event.bubbles;
		this.pointerId = (event.pointerId || (touch ? touch.identifier : ""));
		if (event.pointerType) {
			this.pointerInfo = event.pointerType;
			if (event.isPrimary) {
				this.pointerInfo = this.pointerInfo + "(primary)";
			}
			this.pointerInfo = this.pointerInfo + ":" + this.pointerId;
		} else {
			this.pointerInfo = "N/A";
		}
		if (event.clientX) {
			this.clientCoord = event.clientX + "," + event.clientY;
		} else {
			if (touch && touch.clientX) {
				this.clientCoord = touch.clientX + "," + touch.clientY;
			} else {
				this.clientCoord = "N/A";
			}
		}
		this.buttonButtonsWhich = (event.button === undefined ? "?" : event.button) + "|" +
			((event.buttons !== undefined) ? event.buttons : "?") + "|" +
			((event.which !== undefined) ? event.which : "?");
		this.currentTarget = ((event.currentTarget && event.currentTarget.id) || "");
		this.relatedTarget = ((event.relatedTarget && event.relatedTarget.id) || "");
	};

	var PointerColor = {
		index: -1,
		// yellow, blue, red, green, white
		colors: ["#FFFF00", "#0000FF", "#FF0000", "#00FF00", "#FFFFFF"],
		get: function (pointerId) {
			return ((this[pointerId]) || ((this[pointerId]) = this.next()));
		},
		next: function () {
			this.index = ((this.colors.length - this.index) === 1) ? 0 : (this.index + 1);
			return (this.colors[this.index]);
		}
	};

	// private
	function eventListener(event) {
		var type = event.type;
		var touch, l, i;
		if (!EventTracker.displayMouseEvents && type.match("^mouse")) {
			return true;
		}
		if (!EventTracker.displayPointerEvents && type.match("^(pointer|got|lost)")) {
			return true;
		}
		if (!EventTracker.displayMSPointerEvents && type.match("^MS")) {
			return true;
		}
		switch (type) {
		case "touchstart":
			/*falls through*/
		case "touchmove":
			if (preventDefaultElements[event.target.id]) {
				event.preventDefault();
			}
			/*falls through*/
		case "touchend":
			/*falls through*/
		case "touchcancel":
			if (EventTracker.displayTouchEvents) {
				for (l = event.changedTouches.length, i = 0; i < l; i++) {
					touch = event.changedTouches.item(i);
					logEvent(new EventLogEntry(event, touch));
				}
			}
			break;
		default:
			logEvent(new EventLogEntry(event));
			break;
		}
		return true;
	}

	function logEvent(eventlogEntry) {
		// limit the number of row to save resources, otherwise some browser cancel events at some point.
		if (tableLogElement.rows.length === maxRow) {
			tableLogElement.deleteRow(maxRow - 1);
		}
		var row, i, cell, arg;
		// add a new row at the beginning
		row = tableLogElement.insertRow(0);
		// assign/get pointer color
		var pid = eventlogEntry.pointerId;
		if (pid && (pid !== "") && (eventlogEntry.pointerType !== "")) {
			row.style.color = PointerColor.get(pid);
			row.style.backgroundColor = "#888888";
		}
		// first cell contains time since last event log
		cell = row.insertCell(0);
		cell.innerHTML = String(getDelay()) + "ms";
		cell.style["text-align"] = "right";
		for (i = eventLogColumns.length - 1; i >= 0; i--) {
			arg = eventLogColumns[i];
			if ((arg === "eventType") &&
				(eventlogEntry[arg].indexOf("click") === 0 || eventlogEntry[arg].indexOf("dblclick") === 0)) {
				row.style.color = "#FF0000";
				cell = row.insertCell(1).innerHTML = "<i>" + eventlogEntry[arg] + "</i>";
			} else {
				cell = row.insertCell(1).innerHTML = eventlogEntry[arg];
			}
		}
		// fill up to 10 cells (_minCell2Display default)
		for (i = (eventLogColumns.length + 1); i < minCell2Display; i++) {
			(cell = row.insertCell(i)).innerHTML = "";
		}
		eventlogEntry = null;
	}

	function logInfo(info, desc) {
		var row = tableLogElement.insertRow(0);
		row.insertCell(0).innerHTML = info;
		row.insertCell(1).innerHTML = desc;
	}

	function getDelay() {
		var time = 0;
		if (lastEventTS !== 0) {
			time = ((new Date()).getTime()) - lastEventTS;
		}
		lastEventTS = (new Date()).getTime();
		return time;
	}

	// public
	this.start = function () {
		events.forEach(function (eventType) {
			trackingAreaElement.addEventListener(eventType, eventListener, true);
		});
	};

	this.clearLogTable = function () {
		for (var l = this.tableLogElement.rows.length; l > 0; l--) {
			this.tableLogElement.deleteRow(0);
		}
		lastEventTS = 0;
	};

	this.log = function (msg) {
		var row = tableLogElement.insertRow(0);
		row.insertCell(0).innerHTML = "==> ";
		row.insertCell(1).innerHTML = msg;
	};

	this.displayInfo = function () {
		this.clearLogTable();
		var eventInfo = document.createEvent("MouseEvents");
		try {
			logInfo("HTMLElement.setAttribute", ("setAttribute" in document.body));
			logInfo("HTMLElement.onmouseleave", ("onmouseleave" in document.body));
			logInfo("MouseEvents.defaultPrevented", eventInfo.defaultPrevented !== undefined);
			logInfo("MouseEvents.isTrusted", eventInfo.isTrusted !== undefined);
			logInfo("MouseEvents.buttons", eventInfo.buttons !== undefined);
			logInfo("MouseEvents.stopImmediatePropagation", Boolean(eventInfo.stopImmediatePropagation));
			logInfo("Function.bind", Boolean(Function.bind));
			logInfo("window.WebKitMutationObserver", Boolean(window.WebKitMutationObserver));
			logInfo("window.MutationObserver", Boolean(window.MutationObserver));
			logInfo("hasTouchEvents", ("ontouchstart" in document));
			logInfo("window.navigator.msPointerEnabled", Boolean(window.navigator.msPointerEnabled));
			logInfo("window.navigator.pointerEnabled", Boolean(window.navigator.pointerEnabled));
			logInfo("window.navigator.msMaxTouchPoints", Boolean(window.navigator.msMaxTouchPoints));
			logInfo("window.navigator.maxTouchPoints", Boolean(window.navigator.maxTouchPoints));
			logInfo("style.touchAction", ("touchAction" in document.body.style));
			logInfo("navigator.userAgent", navigator.userAgent);
		} catch (error) {
			logInfo("Error", error);
		}
	};

	this.overflowOnElement = function (elementId, enableIt) {
		logInfo("=> Set overflow", elementId, enableIt);
		var htmlElt = document.getElementById(elementId);
		if (!htmlElt) {
			alert("Unable to find element named [" + elementId + "]");
		}
		var saveDisplay = htmlElt.style.display; // trick to force overflow refresh
		htmlElt.style.display = "none";
		htmlElt.style.overflow = (enableIt ? "auto" : "hidden");
		htmlElt.style.display = saveDisplay;
	};

	this.preventDefaultOnElement = function (elementId, enableIt) {
		var htmlElt = document.getElementById(elementId);
		if (!htmlElt) {
			alert("Unable to find element named [" + elementId + "]");
		}
		preventDefaultElements[elementId] = enableIt;
	};
};

EventTracker.displayPointerEvents = true;
EventTracker.displayMouseEvents = false;
EventTracker.displayTouchEvents = false;
EventTracker.displayMSPointerEvents = false;