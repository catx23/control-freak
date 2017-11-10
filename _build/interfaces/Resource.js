"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EResourceType;
(function (EResourceType) {
    EResourceType[EResourceType["JS_HEADER_INCLUDE"] = 'JS-HEADER-INCLUDE'] = "JS_HEADER_INCLUDE";
    EResourceType[EResourceType["JS_HEADER_SCRIPT_TAG"] = 'JS-HEADER-SCRIPT-TAG'] = "JS_HEADER_SCRIPT_TAG";
    EResourceType[EResourceType["CSS"] = 'CSS'] = "CSS";
    EResourceType[EResourceType["FILE_PROXY"] = 'FILE_PROXY'] = "FILE_PROXY";
})(EResourceType = exports.EResourceType || (exports.EResourceType = {}));
function DefaultDelimitter() {
    return {
        begin: '%',
        end: '%'
    };
}
exports.DefaultDelimitter = DefaultDelimitter;
//# sourceMappingURL=Resource.js.map