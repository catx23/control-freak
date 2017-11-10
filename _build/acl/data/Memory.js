"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
  Memory Backend.
  In-memory implementation of the storage.
*/
const _ = require("lodash");
const contract_1 = require("../contract");
const bluebird = require("bluebird");
function makeArray(arr) {
    return Array.isArray(arr) ? arr : [arr];
}
class Memory {
    constructor() {
        this.endAsync = bluebird.promisify(this.end);
        this.getAsync = bluebird.promisify(this.get);
        this.cleanAsync = bluebird.promisify(this.clean);
        this.unionAsync = bluebird.promisify(this.union);
        this.unionsAsync = bluebird.promisify(this.unions);
        this._buckets = {};
    }
    data() {
        return this._buckets;
    }
    /*
       Begins a transaction.
    */
    begin() {
        // returns a transaction object(just an array of functions will do here.)
        return [];
    }
    ;
    /*
       Ends a transaction (and executes it)
    */
    end(transaction, cb) {
        contract_1.contract(arguments).params('array', 'function').end();
        // Execute transaction
        for (let i = 0, len = transaction.length; i < len; i++) {
            transaction[i]();
        }
        cb();
    }
    /*
      Cleans the whole storage.
    */
    clean(cb) {
        contract_1.contract(arguments).params('function').end();
        this._buckets = {};
        cb();
    }
    /*
       Gets the contents at the bucket's key.
    */
    get(bucket, key, cb) {
        contract_1.contract(arguments)
            .params('string', 'string|number', 'function')
            .end();
        if (this._buckets[bucket]) {
            cb(null, this._buckets[bucket][key] || []);
        }
        else {
            cb(null, []);
        }
    }
    /*
       Gets the union of the keys in each of the specified buckets
    */
    unions(buckets, keys, cb) {
        contract_1.contract(arguments)
            .params('array', 'array', 'function')
            .end();
        const self = this;
        let results = {};
        buckets.forEach(function (bucket) {
            if (self._buckets[bucket]) {
                results[bucket] = _.uniq(_.flatten(_.values(_.pick(self._buckets[bucket], keys))));
            }
            else {
                results[bucket] = [];
            }
        });
        cb(null, results);
    }
    /*
      Returns the union of the values in the given keys.
    */
    union(bucket, keys, cb) {
        contract_1.contract(arguments)
            .params('string', 'array', 'function')
            .end();
        let match;
        let re;
        if (!this._buckets[bucket]) {
            Object.keys(this._buckets).some(function (b) {
                re = new RegExp("^" + b + "$");
                match = re.test(bucket);
                if (match) {
                    bucket = b;
                }
                return match;
            });
        }
        if (this._buckets[bucket]) {
            const keyArrays = [];
            for (let i = 0, len = keys.length; i < len; i++) {
                if (this._buckets[bucket][keys[i]]) {
                    keyArrays.push.apply(keyArrays, this._buckets[bucket][keys[i]]);
                }
            }
            cb(undefined, _.union(keyArrays));
        }
        else {
            cb(undefined, []);
        }
    }
    /*
      Adds values to a given key inside a bucket.
    */
    add(transaction, bucket, key, values) {
        contract_1.contract(arguments)
            .params('array', 'string', 'string|number', 'string|array|number')
            .end();
        const self = this;
        values = makeArray(values);
        transaction.push(function () {
            if (!self._buckets[bucket]) {
                self._buckets[bucket] = {};
            }
            if (!self._buckets[bucket][key]) {
                self._buckets[bucket][key] = values;
            }
            else {
                self._buckets[bucket][key] = _.union(values, self._buckets[bucket][key]);
            }
        });
    }
    /*
       Delete the given key(s) at the bucket
    */
    del(transaction, bucket, keys) {
        contract_1.contract(arguments)
            .params('array', 'string', 'string|array')
            .end();
        const self = this;
        keys = makeArray(keys);
        transaction.push(function () {
            if (self._buckets[bucket]) {
                for (let i = 0, len = keys.length; i < len; i++) {
                    delete self._buckets[bucket][keys[i]];
                }
            }
        });
    }
    /*
      Removes values from a given key inside a bucket.
    */
    remove(transaction, bucket, key, values) {
        contract_1.contract(arguments)
            .params('array', 'string', 'string|number', 'string|array|number')
            .end();
        const self = this;
        values = makeArray(values);
        transaction.push(function () {
            let old;
            if (self._buckets[bucket] && (old = self._buckets[bucket][key])) {
                self._buckets[bucket][key] = _.difference(old, values);
            }
        });
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map