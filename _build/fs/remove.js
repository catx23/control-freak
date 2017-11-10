"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("./utils/validate");
const inspect_1 = require("./inspect");
const list_1 = require("./list");
const pathUtil = require("path");
const fs_1 = require("fs");
const errors_1 = require("./errors");
const interfaces_1 = require("./interfaces");
const matcher_1 = require("./utils/matcher");
const interfaces_2 = require("./interfaces");
const inspect_2 = require("./inspect");
const iterator_1 = require("./iterator");
const errors_2 = require("./errors");
const trash = require('trash');
/*
function twiddle(mode, mask) {
    return !!(mask & parseInt((mode & parseInt("777", 8)).toString(8)[0]));
}
function write(path) {
    return twiddle(statSync(path).mode, 2);
}
*/
function validateInput(methodName, path) {
    const methodSignature = methodName + '([path])';
    validate_1.validateArgument(methodSignature, 'path', path, ['string', 'undefined']);
}
exports.validateInput = validateInput;
;
const parseOptions = (options, path) => {
    const opts = options || {};
    const parsedOptions = {};
    parsedOptions.progress = opts.progress;
    parsedOptions.conflictCallback = opts.conflictCallback;
    parsedOptions.conflictSettings = opts.conflictSettings;
    parsedOptions.debug = opts.debug;
    parsedOptions.trash = opts.trash;
    parsedOptions.matching = opts.matching;
    if (!opts.filter) {
        if (opts.matching) {
            parsedOptions.filter = matcher_1.create(path, opts.matching);
        }
        else {
            parsedOptions.filter = () => { return true; };
        }
    }
    return parsedOptions;
};
// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------
function sync(path, options) {
    const inspectedFile = inspect_1.sync(path, { symlinks: true });
    if (inspectedFile === undefined) {
        // The path already doesn't exits. Nothing to do here.
    }
    else if (inspectedFile.type === 'dir') {
        list_1.sync(path).forEach((filename) => {
            sync(pathUtil.join(path, filename));
        });
        fs_1.rmdirSync(path);
    }
    else if (inspectedFile.type === 'file' || inspectedFile.type === 'symlink') {
        fs_1.unlinkSync(path);
    }
    else {
        throw errors_1.ErrNoFileOrDir(path);
    }
}
exports.sync = sync;
;
const rmTrash = (path) => {
    return trash([path]);
};
// ---------------------------------------------------------
// Async
// ---------------------------------------------------------
const rmASync = (path, options) => {
    return options.trash ? rmTrash(path) : new Promise((resolve, reject) => {
        fs_1.unlink(path, (err) => {
            if (!err) {
                resolve();
            }
            else {
                reject(err);
            }
        });
    });
};
function isDone(nodes) {
    let done = true;
    nodes.forEach((element) => {
        if (element.status !== interfaces_2.ENodeOperationStatus.DONE) {
            done = false;
        }
    });
    return done;
}
function next(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].status === interfaces_2.ENodeOperationStatus.COLLECTED) {
            return nodes[i];
        }
    }
    return null;
}
// handle user side setting "THROW" and non enum values (null)
const onConflict = (from, options, settings) => {
    switch (settings.overwrite) {
        case interfaces_2.EResolveMode.THROW: {
            throw errors_2.ErrCantDelete(from);
        }
        case interfaces_2.EResolveMode.OVERWRITE:
        case interfaces_2.EResolveMode.APPEND:
        case interfaces_2.EResolveMode.IF_NEWER:
        case interfaces_2.EResolveMode.ABORT:
        case interfaces_2.EResolveMode.IF_SIZE_DIFFERS:
        case interfaces_2.EResolveMode.SKIP: {
            return settings.overwrite;
        }
    }
    return undefined;
};
function resolveConflict(path, resolveMode) {
    if (resolveMode === undefined) {
        return true;
    }
    if (resolveMode === interfaces_2.EResolveMode.SKIP) {
        return false;
    }
    else if (resolveMode === interfaces_2.EResolveMode.ABORT) {
        return false;
    }
    else if (resolveMode === interfaces_2.EResolveMode.RETRY) {
        return true;
    }
    return false;
}
exports.resolveConflict = resolveConflict;
;
function visitor(path, vars, item) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = vars.options;
        if (!item) {
            return;
        }
        item.status = interfaces_2.ENodeOperationStatus.PROCESSING;
        const done = () => {
            item.status = interfaces_2.ENodeOperationStatus.DONE;
            if (isDone(vars.nodes)) {
                return vars.resolve(vars.result);
            }
            else {
                if (vars.nodes.length) {
                    const item = next(vars.nodes);
                    if (item) {
                        visitor(item.path, vars, item);
                    }
                    else {
                        vars.resolve(vars.result);
                    }
                }
            }
        };
        if (isDone(vars.nodes)) {
            return vars.resolve(vars.result);
        }
        vars.filesInProgress += 1;
        rmASync(path, options)
            .then((res) => {
            done();
        })
            .catch((err) => {
            if (err.code === 'EACCES' || err.code === 'EPERM' || err.code === 'EISDIR' || err.code === 'ENOTEMPTY') {
                const resolved = (settings) => {
                    settings.error = err.code;
                    // feature : report
                    if (settings && options && options.flags && options.flags & interfaces_2.EDeleteFlags.REPORT) {
                        vars.result.push({
                            error: settings.error,
                            node: item,
                            resolved: settings
                        });
                    }
                    if (settings) {
                        // if the first resolve callback returned an individual resolve settings "THIS",
                        // ask the user again with the same item
                        let always = settings.mode === interfaces_2.EResolve.ALWAYS;
                        if (always) {
                            options.conflictSettings = settings;
                        }
                        let how = settings.overwrite;
                        how = onConflict(item.path, options, settings);
                        if (how === interfaces_2.EResolveMode.ABORT) {
                            vars.abort = true;
                        }
                        if (vars.abort) {
                            done();
                            return;
                        }
                        if (!resolveConflict(item.path, how)) {
                            done();
                            return;
                        }
                        item.status = interfaces_2.ENodeOperationStatus.PROCESS;
                        if (settings.overwrite === interfaces_2.EResolveMode.RETRY) {
                            item.status = interfaces_2.ENodeOperationStatus.COLLECTED;
                            visitor(path, vars, item);
                        }
                    }
                };
                if (!options.conflictSettings) {
                    const promise = options.conflictCallback(path, inspect_2.createItem(path), err.code);
                    promise.then(resolved);
                }
                else {
                    resolved(options.conflictSettings);
                }
            }
        });
    });
}
function collect(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let all = [];
            iterator_1.async(path, {
                filter: options.filter
            }).then((it) => {
                let node = null;
                while (node = it.next()) {
                    all.push({
                        path: node.path,
                        item: node.item,
                        status: interfaces_2.ENodeOperationStatus.COLLECTED
                    });
                }
                resolve(all);
            }).catch((err) => {
                console.error('read error', err);
            });
        });
    });
}
function async(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = parseOptions(options, path);
        const onError = (err, resolve, reject, nodes) => {
            if (err.code === 'EPERM' || err.code === 'EISDIR' || err.code === 'ENOTEMPTY') {
                const proceed = () => {
                    // It's not a file, it's a directory.
                    // Must delete everything inside first.
                    list_1.async(path).then((filenamesInsideDir) => {
                        let promises = filenamesInsideDir.map((filename) => {
                            return async(pathUtil.join(path, filename));
                        });
                        return Promise.all(promises);
                    })
                        .then(() => {
                        // Everything inside directory has been removed,
                        // it's safe now to go for the directory itself.
                        return fs_1.rmdir(path, (err) => {
                            if (err) {
                                reject(err);
                            }
                        });
                    })
                        .then(resolve, reject);
                };
                // we have a user conflict callback,
                // collect nodes and start asking
                if (options.conflictCallback) {
                    let result = void 0;
                    // walker variables
                    const visitorArgs = {
                        resolve: resolve,
                        reject: reject,
                        abort: false,
                        filesInProgress: 0,
                        resolveSettings: null,
                        options: options,
                        result: result,
                        nodes: nodes || []
                    };
                    const process = () => {
                        visitorArgs.nodes = nodes;
                        if (isDone(nodes)) {
                            return resolve(result);
                        }
                        if (nodes.length) {
                            const item = next(nodes);
                            if (item) {
                                visitor(item.path, visitorArgs, item);
                            }
                        }
                    };
                    if (!nodes) {
                        let _nodes = visitorArgs.nodes;
                        iterator_1.async(path, {
                            filter: options.filter
                        }).then((it) => {
                            let node = null;
                            while (node = it.next()) {
                                _nodes.push({
                                    path: node.path,
                                    item: node.item,
                                    status: interfaces_2.ENodeOperationStatus.COLLECTED
                                });
                            }
                            process();
                        }).catch((err) => {
                            console.error('read error', err);
                        });
                    }
                    else {
                        process();
                    }
                }
                else {
                    proceed();
                }
            }
            else if (err.code === 'ENOENT') {
                // File already doesn't exist. We're done.
                resolve();
            }
            else {
                // Something unexpected happened. Rethrow original error.
                reject(err);
            }
        };
        // if matching is set, its like rm somePath/*.ext
        // in this case, we collect the inner matching nodes and proceed as it
        // would be an error
        if (options.matching) {
            const nodes = yield collect(path, options);
            let err = new interfaces_1.ErrnoException('dummy');
            err.code = 'ENOTEMPTY';
            return new Promise((resolve, reject) => {
                onError(err, resolve, reject, nodes);
            });
        }
        else {
            return new Promise((resolve, reject) => {
                // Assume the path is a file or directory and just try to remove it.
                rmASync(path, options)
                    .then((res) => {
                    resolve();
                })
                    .catch((err) => { onError(err, resolve, reject); });
            });
        }
    });
}
exports.async = async;
;
//# sourceMappingURL=remove.js.map