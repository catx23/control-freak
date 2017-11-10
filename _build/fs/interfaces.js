"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/////////////////////////////////////////////////////////
//
//  Enums
//
var ENodeType;
(function (ENodeType) {
    ENodeType[ENodeType["FILE"] = 'file'] = "FILE";
    ENodeType[ENodeType["DIR"] = 'dir'] = "DIR";
    ENodeType[ENodeType["SYMLINK"] = 'symlink'] = "SYMLINK";
    ENodeType[ENodeType["OTHER"] = 'other'] = "OTHER";
    ENodeType[ENodeType["BLOCK"] = 'block'] = "BLOCK";
})(ENodeType = exports.ENodeType || (exports.ENodeType = {}));
/**
 * Native errors.
 * @todo : replace with errno.
 */
exports.EError = {
    NONE: 'None',
    EXISTS: 'EEXIST',
    PERMISSION: 'EACCES',
    NOEXISTS: 'ENOENT',
    CROSS_DEVICE: 'EXDEV'
};
/**
 * An extented version of Error to make typescript happy. This has been copied from
 * the official Node typings.
 *
 * @export
 * @class ErrnoException
 * @extends {Error}
 */
class ErrnoException extends Error {
}
exports.ErrnoException = ErrnoException;
/**
 * Basic flags during a file operation.
 *
 * @export
 * @enum {number}
 */
var EBaseFlags;
(function (EBaseFlags) {
    /**
     * When copying, don't copy symlinks but resolve them instead.
     */
    EBaseFlags[EBaseFlags["FOLLOW_SYMLINKS"] = 8] = "FOLLOW_SYMLINKS";
})(EBaseFlags = exports.EBaseFlags || (exports.EBaseFlags = {}));
/**
 * Flags to determine certain properties during inspection.
 *
 * @export
 * @enum {number}
 */
var EInspectFlags;
(function (EInspectFlags) {
    EInspectFlags[EInspectFlags["MODE"] = 2] = "MODE";
    EInspectFlags[EInspectFlags["TIMES"] = 4] = "TIMES";
    EInspectFlags[EInspectFlags["SYMLINKS"] = 8] = "SYMLINKS";
    EInspectFlags[EInspectFlags["FILE_SIZE"] = 16] = "FILE_SIZE";
    EInspectFlags[EInspectFlags["DIRECTORY_SIZE"] = 32] = "DIRECTORY_SIZE";
    EInspectFlags[EInspectFlags["CHECKSUM"] = 64] = "CHECKSUM";
    EInspectFlags[EInspectFlags["MIME"] = 128] = "MIME";
})(EInspectFlags = exports.EInspectFlags || (exports.EInspectFlags = {}));
/**
 * Status of a node operation.
 *
 * @export
 * @enum {number}
 */
var ENodeOperationStatus;
(function (ENodeOperationStatus) {
    // Node has been collected
    ENodeOperationStatus[ENodeOperationStatus["COLLECTED"] = 0] = "COLLECTED";
    // Node has been checked for existance
    ENodeOperationStatus[ENodeOperationStatus["CHECKED"] = 1] = "CHECKED";
    // Node is in progress, before copy
    ENodeOperationStatus[ENodeOperationStatus["PROCESSING"] = 2] = "PROCESSING";
    // Node is in process
    ENodeOperationStatus[ENodeOperationStatus["PROCESS"] = 3] = "PROCESS";
    // Node is in conflict, and user is being asked what to do
    ENodeOperationStatus[ENodeOperationStatus["ASKING"] = 4] = "ASKING";
    // Node conflict has been resolved by user
    ENodeOperationStatus[ENodeOperationStatus["ANSWERED"] = 5] = "ANSWERED";
    // Node has been copied
    ENodeOperationStatus[ENodeOperationStatus["DONE"] = 6] = "DONE";
})(ENodeOperationStatus = exports.ENodeOperationStatus || (exports.ENodeOperationStatus = {}));
/**
 * The possible modes to resolve a conflict during copy and move.
 *
 * @export
 * @enum {number}
 */
var EResolveMode;
(function (EResolveMode) {
    EResolveMode[EResolveMode["SKIP"] = 0] = "SKIP";
    EResolveMode[EResolveMode["OVERWRITE"] = 1] = "OVERWRITE";
    EResolveMode[EResolveMode["IF_NEWER"] = 2] = "IF_NEWER";
    EResolveMode[EResolveMode["IF_SIZE_DIFFERS"] = 3] = "IF_SIZE_DIFFERS";
    EResolveMode[EResolveMode["APPEND"] = 4] = "APPEND";
    EResolveMode[EResolveMode["THROW"] = 5] = "THROW";
    EResolveMode[EResolveMode["RETRY"] = 6] = "RETRY";
    EResolveMode[EResolveMode["ABORT"] = 7] = "ABORT";
})(EResolveMode = exports.EResolveMode || (exports.EResolveMode = {}));
/**
 * Additional flags for copy
 *
 * @export
 * @enum {number}
 */
var ECopyFlags;
(function (ECopyFlags) {
    /**
     * Transfer atime and mtime of source to target
     */
    ECopyFlags[ECopyFlags["PRESERVE_TIMES"] = 2] = "PRESERVE_TIMES";
    /**
     * Empty the target folder
     */
    ECopyFlags[ECopyFlags["EMPTY"] = 4] = "EMPTY";
    /**
     * When copying, don't copy symlinks but resolve them instead.
     */
    ECopyFlags[ECopyFlags["FOLLOW_SYMLINKS"] = 8] = "FOLLOW_SYMLINKS";
    /**
     * Collect errors & success
     */
    ECopyFlags[ECopyFlags["REPORT"] = 16] = "REPORT";
})(ECopyFlags = exports.ECopyFlags || (exports.ECopyFlags = {}));
/**
 * An enumeration to narrow a conflict resolve to a single item or for all following conflicts.
 *
 * @export
 * @enum {number}
 */
var EResolve;
(function (EResolve) {
    /**
     * Always will use the chose conflict settings for all following conflicts.
     */
    EResolve[EResolve["ALWAYS"] = 0] = "ALWAYS";
    /**
     * 'This' will use the conflict settings for a single conflict so the conflict callback will be triggered again for the next conflict.
     */
    EResolve[EResolve["THIS"] = 1] = "THIS";
})(EResolve = exports.EResolve || (exports.EResolve = {}));
/**
 * Additional flags for delete
 *
 * @export
 * @enum {number}
 */
var EDeleteFlags;
(function (EDeleteFlags) {
    EDeleteFlags[EDeleteFlags["REPORT"] = 16] = "REPORT";
})(EDeleteFlags = exports.EDeleteFlags || (exports.EDeleteFlags = {}));
//# sourceMappingURL=interfaces.js.map