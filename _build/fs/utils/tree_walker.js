"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const pathUtil = require("path");
const inspect_1 = require("../inspect");
const interfaces_1 = require("../interfaces");
const list_1 = require("../list");
// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------
function sync(path, options, callback, currentLevel) {
    const item = inspect_1.sync(path, options.inspectOptions);
    if (options.maxLevelsDeep === undefined) {
        options.maxLevelsDeep = Infinity;
    }
    if (currentLevel === undefined) {
        currentLevel = 0;
    }
    let children = [];
    const hasChildren = item && item.type === interfaces_1.ENodeType.DIR && currentLevel < options.maxLevelsDeep;
    if (hasChildren) {
        children = list_1.sync(path);
    }
    ;
    callback(path, item);
    if (hasChildren) {
        children.forEach(child => sync(path + pathUtil.sep + child, options, callback, currentLevel + 1));
    }
}
exports.sync = sync;
;
;
function stream(path, options) {
    const rs = new stream_1.Readable({ objectMode: true });
    let nextTreeNode = {
        path: path,
        parent: undefined,
        level: 0
    };
    let running = false;
    let readSome;
    const error = (err) => { rs.emit('error', err); };
    const findNextUnprocessedNode = (node) => {
        if (node.nextSibling) {
            return node.nextSibling;
        }
        else if (node.parent) {
            return findNextUnprocessedNode(node.parent);
        }
        return undefined;
    };
    const pushAndContinueMaybe = (data) => {
        let theyWantMore = rs.push(data);
        running = false;
        if (!nextTreeNode) {
            // Previous was the last node. The job is done.
            rs.push(null);
        }
        else if (theyWantMore) {
            readSome();
        }
    };
    if (options.maxLevelsDeep === undefined) {
        options.maxLevelsDeep = Infinity;
    }
    readSome = () => {
        const theNode = nextTreeNode;
        running = true;
        inspect_1.async(theNode.path, options.inspectOptions)
            .then((inspected) => {
            theNode.inspected = inspected;
            if (inspected && inspected.type === interfaces_1.ENodeType.DIR && theNode.level < options.maxLevelsDeep) {
                list_1.async(theNode.path)
                    .then((childrenNames) => {
                    const children = childrenNames.map((name) => {
                        return {
                            name: name,
                            path: theNode.path + pathUtil.sep + name,
                            parent: theNode,
                            level: theNode.level + 1
                        };
                    });
                    children.forEach((child, index) => {
                        child.nextSibling = children[index + 1];
                    });
                    nextTreeNode = children[0] || findNextUnprocessedNode(theNode);
                    pushAndContinueMaybe({ path: theNode.path, item: inspected });
                })
                    .catch(error);
            }
            else {
                nextTreeNode = findNextUnprocessedNode(theNode);
                pushAndContinueMaybe({ path: theNode.path, item: inspected });
            }
        })
            .catch(error);
    };
    rs['_read'] = () => {
        if (!running) {
            readSome();
        }
    };
    return rs;
}
exports.stream = stream;
//# sourceMappingURL=tree_walker.js.map