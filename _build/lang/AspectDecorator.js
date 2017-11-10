"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// fancy ES7 - Aspect - decorator
var SIGNALS;
(function (SIGNALS) {
    SIGNALS[SIGNALS["BEFORE"] = Symbol('before')] = "BEFORE";
    SIGNALS[SIGNALS["AFTER"] = Symbol('after')] = "AFTER";
    SIGNALS[SIGNALS["AROUND"] = Symbol('around')] = "AROUND";
    SIGNALS[SIGNALS["ERROR"] = Symbol('error')] = "ERROR";
})(SIGNALS = exports.SIGNALS || (exports.SIGNALS = {}));
const SignalMap = {
    [SIGNALS.BEFORE](original, advice) {
        return function before() {
            advice(this, arguments);
            return original.apply(this, arguments);
        };
    },
    [SIGNALS.AFTER](original, advice) {
        return function after() {
            const ret = original.apply(this, arguments);
            return advice(this, ret, arguments);
        };
    },
    [SIGNALS.AROUND](original, advice) {
        return function around() {
            return advice(() => original.apply(this, arguments));
        };
    },
    [SIGNALS.ERROR](original, advice) {
        return function around() {
            try {
                return original.apply(this, arguments);
            }
            catch (err) {
                return advice(err);
            }
        };
    }
};
const isMethod = (target, descriptor) => descriptor && descriptor.value;
const cutMethod = (target, name, descriptor, advice, type) => {
    const original = descriptor.value;
    descriptor.value = SignalMap[type](original, advice);
    return descriptor;
};
const cut = (target, advice, type) => {
    return SignalMap[type](target, advice);
};
function aspect({ type, advice }) {
    if (!(type in SignalMap)) {
        return function crosscut(target, name, descriptor) {
            return descriptor || target;
        };
    }
    return function crosscut(target, name, descriptor) {
        if (isMethod(target, descriptor)) {
            return cutMethod(target, name, descriptor, advice, type);
        }
        return cut(target, advice, type);
    };
}
function before(advice) { return aspect({ type: SIGNALS.BEFORE, advice }); }
exports.before = before;
function after(advice) { return aspect({ type: SIGNALS.AFTER, advice }); }
exports.after = after;
function around(advice) { return aspect({ type: SIGNALS.AROUND, advice }); }
exports.around = around;
function error(advice) { return aspect({ type: SIGNALS.ERROR, advice }); }
exports.error = error;
exports.default = {
    before, after, around, error
};
//# sourceMappingURL=AspectDecorator.js.map