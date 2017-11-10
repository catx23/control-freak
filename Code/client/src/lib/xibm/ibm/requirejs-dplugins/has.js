define(["module"], function (module) {
	var cache = (module.config && module.config()) || {};
	var tokensRE = /[\?:]|[^:\?]+/g;

	function resolve(resource, has, isBuild) {
		var tokens = resource.match(tokensRE);
		var i = 0;
		var get = function (skip) {
			var term = tokens[i++];
			if (term === ":") {
				// empty string module name; therefore, no dependency
				return "";
			} else {
				// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
				if (tokens[i++] === "?") {
					var hasResult = has(term);
					if (hasResult === undefined && isBuild) {
						return undefined;
					} else if (!skip && hasResult) {
						// matched the feature, get the first value from the options
						return get();
					} else {
						// did not match, get the second value, passing over the first
						get(true);
						return get(skip);
					}
				}
				// A module or empty string.
				// This allows to tell apart "undefined flag at build time" and "no module required" cases.
				return term || "";
			}
		};
		return get();
	}

	function forEachModule(tokens, callback) {
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i] !== ":" && tokens[i] !== "?" && tokens[i + 1] !== "?") {
				callback(tokens[i], i);
			}
		}
	}

	var has = function (name) {
		var global = (function () {
			return this;
		})();

		return typeof cache[name] === "function" ? (cache[name] = cache[name](global)) : cache[name]; // Boolean
	};

	has.cache = cache;

	has.add = function (name, test, now, force) {
		if (!has("builder")) {
			(typeof cache[name] === "undefined" || force) && (cache[name] = test);
			return now && has(name);
		}
	};

	has.normalize = function (resource, normalize) {
		var tokens = resource.match(tokensRE);

		forEachModule(tokens, function (module, index) {
			tokens[index] = normalize(module);
		});

		return tokens.join("");
	};

	has.load = function (resource, req, onLoad, config) {
		config = config || {};

		if (!resource) {
			onLoad();
			return;
		}

		var mid = resolve(resource, has, config.isBuild);

		if (mid) {
			req([mid], onLoad);
		} else {
			onLoad();
		}
	};

	has.addModules = function (pluginName, resource, addModules) {
		var modulesToInclude = [];

		var mid = resolve(resource, has, true);
		if (mid) {
			modulesToInclude.push(mid);
		} else if (typeof mid === "undefined") {
			// has expression cannot be resolved at build time so include all the modules just in case.
			var tokens = resource.match(tokensRE);
			forEachModule(tokens, function (module) {
				modulesToInclude.push(module);
			});
		}

		addModules(modulesToInclude);
	};

	return has;
});
