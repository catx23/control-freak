/**
 * @module dojo/Evented
 **/
define([
    "./aspect",
    "./on"
], function (aspect, on) {
    "use strict";
    var after = aspect.after;
    /**
     * A class that can be used as a mixin or base class,
     * to add on() and emit() methods to a class
     * for listening for events and emitting events:
     *
     * @class module:dojo/Evented
     * @example
     *
     * define(["dojo/Evented", "dojo/_base/declare", "dojo/Stateful"], function(Evented, declare, Stateful){
		var EventedStateful = declare([Evented, Stateful], {...});
		var instance = new EventedStateful();
		instance.on("open", function(event){
		//		... do something with event
		});
		instance.emit("open", {name:"some event", ...});
     */
    function Evented() {
        // summary:
        //		A class that can be used as a mixin or base class,
        //		to add on() and emit() methods to a class
        //		for listening for events and emitting events:
        // example:
        //		|
    }

    Evented.prototype = {
        on: function (type, listener) {
            return on.parse(this, type, listener, function (target, type) {
                return after(target, 'on' + type, listener, true);
            });
        },
        emit: function (type, event) {
            var args = [this];
            args.push.apply(args, arguments);
            return on.emit.apply(on, args);
        }
    };
    return Evented;
});
