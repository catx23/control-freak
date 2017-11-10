define(["requirejs-dplugins/has"], function (has) {
	/* global Platform */
	has.add("console-api", typeof console !== "undefined");
	has.add("host-browser", typeof window !== "undefined");
	has.add("object-observe-api", typeof Object.observe === "function" && typeof Array.observe === "function");
	has.add("object-is-api", !!Object.is);
	has.add("setimmediate-api", typeof setImmediate === "function");
	has.add("mutation-observer-api",
		typeof MutationObserver !== "undefined"
			&& (/\[\s*native\s+code\s*\]/i.test(MutationObserver) // Avoid polyfill version of MutationObserver
				|| !/^\s*function/.test(MutationObserver)));
	has.add("polymer-platform", typeof Platform !== "undefined");
	return has;
});
