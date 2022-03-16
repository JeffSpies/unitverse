"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asClass = void 0;
var lodash_1 = __importDefault(require("lodash"));
function asClass(container, cls, opts) {
    var proxy;
    if (opts.inject) {
        proxy = new Proxy(cls, {
            construct: function (target, args) {
                // If the constructor takes no arguments, then it can't be expecting
                // injected objects. However, there are occasions where the
                // constructor is a, e.g., a makeTask wrapper, and args are passed in, but
                // the target seems to take no args. That's why we check both.
                if (lodash_1.default.isEmpty(args) && target.length === 0) {
                    return new target();
                }
                // If the last argument is not a plain object AND
                // If the number of arguments in the constructor is greater than those
                //  provided, fill in undefined until we get to the assumed injectable
                // options parameter at the end
                if (target.length > args.length) {
                    lodash_1.default.times(target.length - args.length - 1, function () {
                        args.push(undefined);
                    });
                    args.push({});
                }
                else {
                    // The last argument will always be {} if the above if-conditional
                    // was true, so just do this as an else - mostly for the weird-wrapper
                    // scenario when the target is not relfective of the underlying function
                    // being called
                    if (!lodash_1.default.isPlainObject(args[args.length - 1])) {
                        args.push({});
                    }
                }
                // Assuming options with injectables are at the very end (or, thus,
                // the start when args.length===1)
                var diObjectIndex = args.length - 1;
                args[diObjectIndex] = new Proxy(args[diObjectIndex], {
                    get: function (obj, prop) {
                        var propString = prop;
                        // First, check if the obj has that property
                        if (Object.keys(obj).includes(propString)) {
                            return obj[prop];
                        }
                        // Then, check if the property was included/overwritten by args
                        if (Object.keys(opts.defaults).includes(propString)) {
                            return opts.defaults[propString];
                        }
                        // Then, check the containerd--if not found, return undefined
                        var resolved = this.resolveInDependencies(propString, opts.dependencies);
                        return resolved;
                    }.bind(container)
                });
                return new (target.bind.apply(target, __spreadArray([void 0], args, false)))();
            }.bind(container)
        });
    }
    else {
        proxy = cls;
    }
    switch (opts.resolve) {
        case 'identity': {
            // A proxied class will return the class
            return proxy;
        }
        case 'instance': {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new (proxy.bind.apply(proxy, __spreadArray([void 0], args, false)))();
            };
        }
    }
}
exports.asClass = asClass;
//# sourceMappingURL=class.js.map