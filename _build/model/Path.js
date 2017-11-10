"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("@xblox/core/objects");
const primitives_1 = require("@xblox/core/primitives");
exports.slash = (str) => {
    let isExtendedLengthPath = /^\\\\\?\\/.test(str);
    let hasNonAscii = /[^\x00-\x80]+/.test(str);
    if (isExtendedLengthPath || hasNonAscii) {
        return str;
    }
    return str.replace(/\\/g, '/');
};
class Path {
    constructor(path = '.', hasLeading = false, hasTrailing = false) {
        if (primitives_1.isString(path)) {
            this.path = path;
            this.getSegments();
        }
        else {
            this.segments = path;
            this.hasLeading = hasLeading;
            this.hasTrailing = hasTrailing;
        }
    }
    static normalize(path) {
        return exports.slash(path).replace(/\/+/g, '\/');
    }
    endsWith(tail) {
        let segments = objects_1.clone(this.segments);
        let tailSegments = (new Path(tail)).getSegments();
        while (tailSegments.length > 0 && segments.length > 0) {
            if (tailSegments.pop() !== segments.pop()) {
                return false;
            }
        }
        return true;
    }
    getExtension() {
        if (!this.extension) {
            this.extension = this.path.substr(this.path.lastIndexOf('.') + 1);
        }
        return this.extension;
    }
    segment(index) {
        const segs = this.getSegments();
        if (segs.length < index) {
            return null;
        }
        return segs[index];
    }
    /**
     * Return all items under this path
     * @param items {String[]}
     * @param recursive {boolean}
     * @returns {String[]}
     */
    getChildren(items, recursive = false) {
        let result = [];
        let root = this, path = this.toString();
        const addChild = (child) => {
            let _path = typeof child !== 'string' ? child.toString() : child;
            if (_path !== path && result.indexOf(_path) === -1) {
                result.push(_path);
            }
        };
        items.forEach((item) => {
            let child = new Path(item);
            // root match
            if (child.startsWith(root)) {
                if (recursive) {
                    addChild(child.toString());
                }
                else {
                    let diff = child.relativeTo(path);
                    if (diff) {
                        let diffSegments = diff.getSegments();
                        // direct child
                        if (diffSegments.length === 1) {
                            addChild(child);
                        }
                        else if (diffSegments.length > 1) {
                            // make sure that its parent has been added:
                            let parent = child.getParentPath();
                            let parentDiff = parent.relativeTo(path);
                            // check diff again
                            if (parentDiff.getSegments().length === 1) {
                                addChild(parent.toString());
                            }
                        }
                    }
                }
            }
        });
        return result;
    }
    getSegments() {
        if (!this.segments) {
            let path = this.path;
            this.segments = path.split('/');
            if (path.charAt(0) === '/') {
                this.hasLeading = true;
            }
            if (path.charAt(path.length - 1) === '/') {
                this.hasTrailing = true;
                // If the path ends in '/', split() will create an array whose last element
                // is an empty string. Remove that here.
                this.segments.pop();
            }
            this._canonicalize();
        }
        return this.segments;
    }
    isAbsolute() {
        return this.hasLeading;
    }
    getParentPath() {
        if (!this._parentPath) {
            let parentSegments = objects_1.clone(this.segments);
            parentSegments.pop();
            this._parentPath = new Path(parentSegments, this.hasLeading);
        }
        return this._parentPath;
    }
    _clone() {
        return new Path(objects_1.clone(this.segments), this.hasLeading, this.hasTrailing);
    }
    append(tail) {
        tail = tail || '';
        if (typeof tail === 'string') {
            tail = new Path(tail);
        }
        if (tail.isAbsolute()) {
            return tail;
        }
        let mySegments = this.segments;
        let tailSegments = tail.getSegments();
        let newSegments = mySegments.concat(tailSegments);
        let result = new Path(newSegments, this.hasLeading, tail.hasTrailing);
        if (tailSegments[0] === '..' || tailSegments[0] === '.') {
            result._canonicalize();
        }
        return result;
    }
    toString() {
        let result = [];
        if (this.hasLeading) {
            result.push('/');
        }
        for (let i = 0; i < this.segments.length; i++) {
            if (i > 0) {
                result.push('/');
            }
            result.push(this.segments[i]);
        }
        if (this.hasTrailing) {
            result.push('/');
        }
        return result.join('').replace(/\/+/g, '\/');
    }
    _toString() {
        let result = [];
        if (this.hasLeading) {
            result.push('/');
        }
        for (let i = 0; i < this.segments.length; i++) {
            if (i > 0) {
                result.push('/');
            }
            result.push(this.segments[i]);
        }
        if (this.hasTrailing) {
            result.push('/');
        }
        return result.join('');
    }
    removeRelative() {
        let segs = this.getSegments();
        if (segs.length > 0 && segs[1] === '.') {
            return this.removeFirstSegments(1);
        }
        return this;
    }
    relativeTo(base, ignoreFilename = false) {
        if (typeof base === 'string') {
            base = new Path(base);
        }
        let mySegments = this.segments;
        if (this.isAbsolute()) {
            return this;
        }
        let baseSegments = base.getSegments();
        let commonLength = this.matchingFirstSegments(base);
        let baseSegmentLength = baseSegments.length;
        if (ignoreFilename) {
            baseSegmentLength = baseSegmentLength - 1;
        }
        let differenceLength = baseSegmentLength - commonLength;
        let newSegmentLength = differenceLength + mySegments.length - commonLength;
        if (newSegmentLength === 0) {
            return Path.EMPTY;
        }
        let newSegments = [];
        for (let i = 0; i < differenceLength; i++) {
            newSegments.push('..');
        }
        for (let i = commonLength; i < mySegments.length; i++) {
            newSegments.push(mySegments[i]);
        }
        return new Path(newSegments, false, this.hasTrailing);
    }
    startsWith(anotherPath) {
        let count = this.matchingFirstSegments(anotherPath);
        return anotherPath._length() === count;
    }
    _length() {
        return this.segments.length;
    }
    matchingFirstSegments(anotherPath) {
        let mySegments = this.segments;
        let pathSegments = anotherPath.getSegments();
        let max = Math.min(mySegments.length, pathSegments.length);
        let count = 0;
        for (let i = 0; i < max; i++) {
            if (mySegments[i] !== pathSegments[i]) {
                return count;
            }
            count++;
        }
        return count;
    }
    removeFirstSegments(count) {
        return new Path(this.segments.slice(count, this.segments.length), this.hasLeading, this.hasTrailing);
    }
    removeMatchingLastSegments(anotherPath) {
        let match = this.matchingFirstSegments(anotherPath);
        return this.removeLastSegments(match);
    }
    removeMatchingFirstSegments(anotherPath) {
        let match = this.matchingFirstSegments(anotherPath);
        return this._clone().removeFirstSegments(match);
    }
    removeLastSegments(count) {
        if (!count) {
            count = 1;
        }
        return new Path(this.segments.slice(0, this.segments.length - count), this.hasLeading, this.hasTrailing);
    }
    lastSegment() {
        return this.segments[this.segments.length - 1];
    }
    firstSegment(length) {
        return this.segments[length || 0];
    }
    equals(anotherPath) {
        if (this.segments.length !== anotherPath.segments.length) {
            return false;
        }
        for (let i = 0; i < this.segments.length; i++) {
            if (anotherPath.segments[i] !== this.segments[i]) {
                return false;
            }
        }
        return true;
    }
    _canonicalize() {
        let doIt;
        let segments = this.segments;
        for (let i = 0; i < segments.length; i++) {
            if (segments[i] === '.' || segments[i] === '..') {
                doIt = true;
                break;
            }
        }
        if (doIt) {
            let stack = [];
            for (let i = 0; i < segments.length; i++) {
                if (segments[i] === '..') {
                    if (stack.length === 0) {
                        // if the stack is empty we are going out of our scope
                        // so we need to accumulate segments.  But only if the original
                        // path is relative.  If it is absolute then we can't go any higher than
                        // root so simply toss the .. references.
                        if (!this.hasLeading) {
                            stack.push(segments[i]); // stack push
                        }
                    }
                    else {
                        // if the top is '..' then we are accumulating segments so don't pop
                        if ('..' === stack[stack.length - 1]) {
                            stack.push('..');
                        }
                        else {
                            stack.pop();
                        }
                    }
                    // collapse current references
                }
                else if (segments[i] !== '.' || this.segments.length === 1) {
                    stack.push(segments[i]); // stack push
                }
            }
            // if the number of segments hasn't changed, then no modification needed
            if (stack.length === segments.length) {
                return;
            }
            this.segments = stack;
        }
    }
}
Path.EMPTY = new Path('');
exports.Path = Path;
//# sourceMappingURL=Path.js.map