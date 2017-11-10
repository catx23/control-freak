define(["./parentLocale"], function (parentLocale) {

	// regexp for reconstructing the master bundle name from parts of the regexp match
	// "foo/bar/baz/nls/en-ca/foo".match(nlsRegExp) gives:
	// ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "en-ca", "foo"]
	// nlsRegExp.exec("foo/bar/baz/nls/foo") gives:
	// ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "foo", ""]
	// so, if match[3] is blank, it means this is the top bundle definition.
	var nlsRegExp = /(^.*(?:^|\/)nls\/)([^\/]*)\/?([^\/]*)$/;

	return {
		eachProp: function (obj, func) {
			var prop;
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					func(prop, obj[prop]);
				}
			}
		},

		getLocale: function (locale) {
			if (!locale) {
				locale = typeof navigator === "undefined" ? "root" :
					(navigator.language ||
					// IE <= 10
					navigator.userLanguage ||
					"root");
			}
			// just to be extra-sure
			return locale.toLowerCase();
		},

		getParentLocale: function (loc) {
			if (!loc || loc === "root") {
				return undefined;
			}
			if (parentLocale[loc]) {
				return parentLocale[loc];
			}

			var parts = loc.split("-");
			parts.pop();
			return (parts.length > 0) ? parts.join("-") : "root";
		},


		// Simple function to mix in properties from source into target,
		// but only if target does not already have a property of the same name.
		// This is not robust in IE for transferring methods that match
		// Object.prototype names, but the uses of mixin here seem unlikely to
		// trigger a problem related to that.
		mixin: function mixin(target, source, force) {
			var prop;
			for (prop in source) {
				if (source.hasOwnProperty(prop) && (!target.hasOwnProperty(prop) || force)) {
					target[prop] = source[prop];
				} else if (typeof source[prop] === 'object') {
					if (!target[prop] && source[prop]) {
						target[prop] = {};
					}
					mixin(target[prop], source[prop], force);
				}
			}
		},

		// Parse the resource mid and return a usable object.	
		parseName: function (name) {
			var match = name.match(nlsRegExp);

			// If match[3] is blank, it means this is the top bundle definition,
			// hence suffix is match[2] and locale is null.
			return {
				prefix: match[1],
				masterLocale: "root",
				requestedLocale: match[3] ? match[2] : null,
				suffix: match[3] || match[2]
			};
		},


		getMasterMid: function (name) {
			return name.masterLocale === "root" ? name.prefix + name.suffix :
				name.prefix + name.masterLocale + "/" + name.suffix;
		}
	};
});
