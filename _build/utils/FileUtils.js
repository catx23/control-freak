"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EPATH_PARTS;
(function (EPATH_PARTS) {
    EPATH_PARTS[EPATH_PARTS["DIRNAME"] = 1] = "DIRNAME";
    EPATH_PARTS[EPATH_PARTS["BASENAME"] = 2] = "BASENAME";
    EPATH_PARTS[EPATH_PARTS["EXTENSION"] = 4] = "EXTENSION";
    EPATH_PARTS[EPATH_PARTS["FILENAME"] = 8] = "FILENAME";
    EPATH_PARTS[EPATH_PARTS["PATHINFO_ALL"] = 0] = "PATHINFO_ALL";
})(EPATH_PARTS = exports.EPATH_PARTS || (exports.EPATH_PARTS = {}));
/*
     * PHP.js version of basename
     * @param path {string}
     * @param suffix {string}
     * @example
     //   example 1: basename('/www/site/home.htm', '.htm');
     //   returns 1: 'home'
     //   example 2: basename('ecra.php?p=1');
     //   returns 2: 'ecra.php?p=1'
     //   example 3: basename('/some/path/');
     //   returns 3: 'path'
     //   example 4: basename('/some/path_ext.ext/','.ext');
     //   returns 4: 'path_ext'
     * @returns {*}
     * @memberOf module:xide/utils/StringUtils
     * @link http://phpjs.org/functions/basename/
     */
function basename(path, suffix) {
    let b = path;
    const lastChar = b.charAt(b.length - 1);
    if (lastChar === '/' || lastChar === '\\') {
        b = b.slice(0, -1);
    }
    b = b.replace(/^.*[\/\\]/g, '');
    if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
        b = b.substr(0, b.length - suffix.length);
    }
    return b;
}
exports.basename = basename;
function pathinfo(path, options) {
    //  discuss at:
    // original by: Nate
    //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // improved by: Dmitry Gorelenkov
    //    input by: Timo
    //        note: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
    //        note: The way the bitwise arguments are handled allows for greater flexibility
    //        note: & compatability. We might even standardize this code and use a similar approach for
    //        note: other bitwise PHP functions
    //        note: php.js tries very hard to stay away from a core.js file with global dependencies, because we like
    //        note: that you can just take a couple of functions and be on your way.
    //        note: But by way we implemented this function, if you want you can still declare the PATHINFO_*
    //        note: yourself, and then you can use: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
    //        note: which makes it fully compliant with PHP syntax.
    //  depends on: basename
    var opt = '', real_opt = '', optName = '', optTemp = 0, tmp_arr = {}, cnt = 0, i = 0;
    let have_basename = false, have_extension = false, have_filename = false;
    // Input defaulting & sanitation
    if (!path) {
        return false;
    }
    if (!options) {
        options = EPATH_PARTS.PATHINFO_ALL;
    }
    // Initialize binary arguments. Both the string & integer (constant) input is
    // allowed
    var OPTS = {
        'PATHINFO_DIRNAME': 1,
        'PATHINFO_BASENAME': 2,
        'PATHINFO_EXTENSION': 4,
        'PATHINFO_FILENAME': 8,
        'PATHINFO_ALL': 0
    };
    // PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
    for (optName in OPTS) {
        if (OPTS.hasOwnProperty(optName)) {
            OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName];
        }
    }
    if (typeof options !== 'number') {
        // Allow for a single string or an array of string flags
        options = [].concat(options);
        for (i = 0; i < options.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[options[i]]) {
                optTemp = optTemp | OPTS[options[i]];
            }
        }
        options = optTemp;
    }
    // Internal Functions
    function __getExt(path) {
        var str = path + '';
        var dotP = str.lastIndexOf('.') + 1;
        return !dotP ? false : dotP !== str.length ? str.substr(dotP) : '';
    }
    ;
    // Gather path infos
    //noinspection JSBitwiseOperatorUsage,JSBitwiseOperatorUsage
    if (options & OPTS.PATHINFO_DIRNAME) {
        var dirName = path.replace(/\\/g, '/')
            .replace(/\/[^\/]*\/?$/, ''); // dirname
        tmp_arr.dirname = dirName === path ? '.' : dirName;
    }
    //noinspection JSBitwiseOperatorUsage,JSBitwiseOperatorUsage
    if (options & OPTS.PATHINFO_BASENAME) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        tmp_arr.basename = have_basename;
    }
    //noinspection JSBitwiseOperatorUsage,JSBitwiseOperatorUsage
    if (options & OPTS.PATHINFO_EXTENSION) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        if (false !== have_extension) {
            tmp_arr.extension = have_extension;
        }
    }
    //noinspection JSBitwiseOperatorUsage,JSBitwiseOperatorUsage
    if (options & OPTS.PATHINFO_FILENAME) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        if (false === have_filename) {
            have_filename = have_basename.slice(0, have_basename.length - (have_extension ? have_extension.length + 1 :
                have_extension === false ? 0 : 1));
        }
        tmp_arr.filename = have_filename;
    }
    // If array contains only 1 element: return string
    cnt = 0;
    for (opt in tmp_arr) {
        if (tmp_arr.hasOwnProperty(opt)) {
            cnt++;
            real_opt = opt;
        }
    }
    if (cnt === 1) {
        return tmp_arr[real_opt];
    }
    // Return full-blown array
    return tmp_arr;
}
exports.pathinfo = pathinfo;
//# sourceMappingURL=FileUtils.js.map