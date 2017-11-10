"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jp = require("jsonpath");
const primitives_1 = require("../std/primitives");
require("reflect-metadata");
const Implementation = JSON;
//
// ─── FILE - IO ───────────────────────────────────────────────────────────────────────
//
function read(file) {
    const size = fs.statSync(file).size, buf = new Buffer(size), fd = fs.openSync(file, 'r');
    if (!size) {
        return '';
    }
    fs.readSync(fd, buf, 0, size, 0);
    fs.closeSync(fd);
    return buf.toString();
}
exports.read = read;
//
// ─── Standard decoder ───────────────────────────────────────────────────────────────────────
//
exports.to = (data, path) => {
    let value = path ? jp.query(data, path)[0] : data;
    let changed = false;
    try {
        if (primitives_1.isString(value)) {
            value = JSON.parse(value);
            changed = true;
        }
    }
    catch (e) {
        console.error('error decoding json', e);
    }
    changed && path && jp.value(data, path, value);
    return data;
};
//
// ─── API abbreviation ───────────────────────────────────────────────────────────────────────
//
exports.serialize = (value, replacer, space) => {
    return Implementation.stringify(value, replacer, space);
};
exports.deserialize = (value) => {
    return Implementation.parse(value);
};
//
// ─── UTILS ──────────────────────────────────────────────────────────────────────
//
/**
 * Calls JSON.Stringify with a replacer to break apart any circular references.
 * This prevents JSON.stringify from throwing the exception
 *  "Uncaught TypeError: Converting circular structure to JSON"
 */
exports.safe = (obj) => {
    let seen = [];
    return exports.serialize(obj, (key, value) => {
        if (primitives_1.isObject(value) || primitives_1.isArray(value)) {
            if (seen.indexOf(value) !== -1) {
                return '[Circular]';
            }
            else {
                seen.push(value);
            }
        }
        return value;
    });
};
//
// ─── JSON-MAPPING ────────────────────────────────────────────────────────────────
//
const jsonMetadataKey = 'jsonProperty';
/**
 * Decorator to map/support dashed property names
 *
 * @export
 * @template T
 * @param {(IJsonMetaData<T> | string)} [metadata]
 * @returns {*}
 */
function JsonProperty(metadata) {
    if (metadata instanceof String || typeof metadata === 'string') {
        return Reflect.metadata(jsonMetadataKey, {
            name: metadata,
            clazz: undefined
        });
    }
    else {
        const metadataObj = metadata;
        return Reflect.metadata(jsonMetadataKey, {
            name: metadataObj ? metadataObj.name : undefined,
            clazz: metadataObj ? metadataObj.clazz : undefined
        });
    }
}
exports.JsonProperty = JsonProperty;
function getClazz(target, propertyKey) {
    return Reflect.getMetadata('design:type', target, propertyKey);
}
exports.getClazz = getClazz;
function getJsonProperty(target, propertyKey) {
    return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
}
exports.getJsonProperty = getJsonProperty;
/**
* @example
// Example - JSON-Mapping
class Address {
    @JsonProperty('first-line')
    firstLine: string;
    @JsonProperty('second-line')
    secondLine: string;
    city: string;

    // Default constructor will be called by mapper
    constructor() {
        this.firstLine = undefined;
        this.secondLine = undefined;
        this.city = undefined;
    }
}

class Person {
    name: string;
    surname: string;
    age: number;
    @JsonProperty('address')
    address: Address;

    // Default constructor will be called by mapper
    constructor() {Array.
        this.name = undefined;
        this.surname = undefined;
        this.age = undefined;
        this.address = undefined;
    }
}
let example = {
    "name": "Mark",
    "surname": "Galea",
    "age": 30,
    "address": {
        "first-line": "Some where",
        "second-line": "Over Here",
        "city": "In This City"
    }
};
const Person2 = Map.deserialize(Person, example);
*/
class Map {
    static isPrimitive(obj) {
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true;
        }
        return !!(obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean);
    }
    static isArray(object) {
        if (object === Array) {
            return true;
        }
        else if (typeof Array.isArray === 'function') {
            return Array.isArray(object);
        }
        else {
            return !!(object instanceof Array);
        }
    }
    static deserialize(clazz, jsonObject) {
        if ((clazz === undefined) || (jsonObject === undefined)) {
            return undefined;
        }
        const obj = new clazz();
        Object.keys(obj).forEach((key) => {
            const propertyMetadataFn = (propertyMetadata) => {
                let propertyName = propertyMetadata.name || key;
                let innerJson = jsonObject ? jsonObject[propertyName] : undefined;
                let clazz = getClazz(obj, key);
                if (Map.isArray(clazz)) {
                    let metadata = getJsonProperty(obj, key);
                    if (metadata.clazz || Map.isPrimitive(clazz)) {
                        if (innerJson && Map.isArray(innerJson)) {
                            return innerJson.map((item) => Map.deserialize(metadata.clazz, item));
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return innerJson;
                    }
                }
                else if (!Map.isPrimitive(clazz)) {
                    return Map.deserialize(clazz, innerJson);
                }
                else {
                    return jsonObject ? jsonObject[propertyName] : undefined;
                }
            };
            const propertyMetadata = getJsonProperty(obj, key);
            if (propertyMetadata) {
                obj[key] = propertyMetadataFn(propertyMetadata);
            }
            else {
                if (jsonObject && jsonObject[key] !== undefined) {
                    obj[key] = jsonObject[key];
                }
            }
        });
        return obj;
    }
}
exports.Map = Map;
//# sourceMappingURL=json.js.map