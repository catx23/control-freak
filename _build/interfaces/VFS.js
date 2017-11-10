"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Node types
 *
 * @export
 * @enum {string}
 */
var ENodeType;
(function (ENodeType) {
    ENodeType[ENodeType["FILE"] = 'file'] = "FILE";
    ENodeType[ENodeType["DIR"] = 'dir'] = "DIR";
    ENodeType[ENodeType["SYMLINK"] = 'symlink'] = "SYMLINK";
    ENodeType[ENodeType["OTHER"] = 'other'] = "OTHER";
    ENodeType[ENodeType["BLOCK"] = 'block'] = "BLOCK";
})(ENodeType = exports.ENodeType || (exports.ENodeType = {}));
/**
 * General features of a VFS
 *
 * @export
 * @enum {number}
 */
var ECapabilties;
(function (ECapabilties) {
    ECapabilties[ECapabilties["VERSIONED"] = 0] = "VERSIONED";
    ECapabilties[ECapabilties["CHANGE_MESSAGE"] = 1] = "CHANGE_MESSAGE";
    ECapabilties[ECapabilties["META"] = 2] = "META";
    ECapabilties[ECapabilties["MIME"] = 3] = "MIME";
    ECapabilties[ECapabilties["AUTHORS"] = 4] = "AUTHORS";
    ECapabilties[ECapabilties["META_TREE"] = 5] = "META_TREE";
    ECapabilties[ECapabilties["ROOT"] = 6] = "ROOT";
    ECapabilties[ECapabilties["REMOTE_CONNECTION"] = 7] = "REMOTE_CONNECTION"; // VFS has a remote connection
})(ECapabilties = exports.ECapabilties || (exports.ECapabilties = {}));
/**
 * Supported file operations
 *
 * @export
 * @enum {number}
 */
var EOperations;
(function (EOperations) {
    EOperations[EOperations["LS"] = 0] = "LS";
    EOperations[EOperations["RENAME"] = 1] = "RENAME";
    EOperations[EOperations["COPY"] = 2] = "COPY";
    EOperations[EOperations["DELETE"] = 3] = "DELETE";
    EOperations[EOperations["MOVE"] = 4] = "MOVE";
    EOperations[EOperations["GET"] = 5] = "GET";
    EOperations[EOperations["SET"] = 6] = "SET";
})(EOperations = exports.EOperations || (exports.EOperations = {}));
/**
 *
 * These flags are used to build the result, adaptive.
 * @TODO: sync with dgrid#configureColumn
 * @export
 * @enum {number}
 */
var NODE_FIELDS;
(function (NODE_FIELDS) {
    NODE_FIELDS[NODE_FIELDS["SHOW_ISDIR"] = 1602] = "SHOW_ISDIR";
    NODE_FIELDS[NODE_FIELDS["SHOW_OWNER"] = 1604] = "SHOW_OWNER";
    NODE_FIELDS[NODE_FIELDS["SHOW_MIME"] = 1608] = "SHOW_MIME";
    NODE_FIELDS[NODE_FIELDS["SHOW_SIZE"] = 1616] = "SHOW_SIZE";
    NODE_FIELDS[NODE_FIELDS["SHOW_PERMISSIONS"] = 1632] = "SHOW_PERMISSIONS";
    NODE_FIELDS[NODE_FIELDS["SHOW_TIME"] = 1633] = "SHOW_TIME";
    // @TODO: re-impl. du -ahs/x for windows
    NODE_FIELDS[NODE_FIELDS["SHOW_FOLDER_SIZE"] = 1634] = "SHOW_FOLDER_SIZE";
    NODE_FIELDS[NODE_FIELDS["SHOW_FOLDER_HIDDEN"] = 1635] = "SHOW_FOLDER_HIDDEN";
    NODE_FIELDS[NODE_FIELDS["SHOW_TYPE"] = 1636] = "SHOW_TYPE";
    NODE_FIELDS[NODE_FIELDS["SHOW_MEDIA_INFO"] = 1637] = "SHOW_MEDIA_INFO";
})(NODE_FIELDS = exports.NODE_FIELDS || (exports.NODE_FIELDS = {}));
//# sourceMappingURL=VFS.js.map