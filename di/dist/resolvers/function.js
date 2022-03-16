"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asFunction = void 0;
var lodash_1 = __importDefault(require("lodash"));
function asFunction(container, fn, opts) {
    if (!opts.inject) {
        return fn;
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            args = [{}];
        }
        var diObjectIndex = args.length - 1;
        if (lodash_1.default.isPlainObject(args[diObjectIndex])) {
            args[diObjectIndex] = new Proxy(args[diObjectIndex], {
                get: function (obj, prop) {
                    var propString = prop;
                    if (Object.keys(obj).includes(propString)) {
                        return obj[prop];
                    }
                    if (Object.keys(opts.defaults).includes(propString)) {
                        return opts.defaults[propString];
                    }
                    var resolved = this.resolveInDependencies(propString, opts.dependencies);
                    return resolved;
                }.bind(container)
            });
        }
        return fn.apply(void 0, args);
    };
}
exports.asFunction = asFunction;
//# sourceMappingURL=function.js.map