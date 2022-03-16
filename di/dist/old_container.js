"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var lodash_1 = __importDefault(require("lodash"));
var class_1 = require("./resolvers/class");
var function_1 = require("./resolvers/function");
var value_1 = require("./resolvers/value");
var RESERVED_WORDS = ['constructor', 'length'];
var ClassOptionDefaults = {
    inject: true,
    isLazy: true,
    resolve: 'identity',
    defaults: {},
    dependencies: {}
};
var FunctionOptionDefaults = {
    inject: true,
    isLazy: true,
    defaults: {},
    dependencies: {}
};
var ValueOptionDefaults = {};
var Container = /** @class */ (function () {
    function Container() {
        this.registry = {};
    }
    Container.prototype.contains = function (name) {
        if (lodash_1.default.has(this.registry, lodash_1.default.lowerCase(name))) {
            return true;
        }
        return false;
    };
    Container.prototype.isReserved = function (name) {
        if (name in RESERVED_WORDS) {
            return true;
        }
        return false;
    };
    Container.prototype.connectResolver = function (name, obj, opts, as) {
        var _this = this;
        if (this.isReserved(name)) {
            return false;
        }
        var compiled = opts.isLazy ?
            function () { return as(_this, obj, opts); } :
            as(this, obj, opts);
        this.registry[name] = {
            obj: compiled,
            opts: opts
        };
        return true;
    };
    Container.prototype.resolve = function (name) {
        if (this.isReserved(name)) {
            return undefined;
        }
        var stored = this.registry[name];
        if (!stored) {
            return undefined;
        }
        if (stored.isAlias) {
            return this.resolve(stored.obj);
        }
        // if (stored.opts.isLazy) {
        //   // Let's undo the laziness
        //   this.registry[name].obj = stored.obj()
        //   this.registry[name].opts.isLazy = false
        //   return stored.obj
        // }
        if (stored.opts.resolve === 'instance') {
            this.registry[name].obj = stored.obj();
            this.registry[name].opts.resolve = 'identity';
        }
        return stored.obj;
    };
    Container.prototype.registerAlias = function (name, target) {
        this.registry[name] = {
            isAlias: true,
            obj: target
        };
        // todo use this.register
        return true;
    };
    /**
     * defaults The default contructor arguments used when instantiate the class
     */
    Container.prototype.registerClass = function (name, obj, opts) {
        opts = __assign(__assign({}, ClassOptionDefaults), opts);
        return this.connectResolver(name, obj, opts, class_1.asClass);
    };
    Container.prototype.registerFunction = function (name, obj, opts) {
        opts = __assign(__assign({}, FunctionOptionDefaults), opts);
        return this.connectResolver(name, obj, opts, function_1.asFunction);
    };
    Container.prototype.registerValue = function (name, obj) {
        return this.connectResolver(name, obj, {}, value_1.asValue);
    };
    /**
     * defaults The default contructor arguments used when instantiate the class
     */
    Container.prototype.asClass = function (cls, defaults, opts) {
        if (defaults === void 0) { defaults = {}; }
        opts = __assign(__assign(__assign({}, ClassOptionDefaults), { isLazy: false }), opts);
        return (0, class_1.asClass)(this, cls, opts);
    };
    /**
     * defaults The default contructor arguments used when instantiate the class
     */
    Container.prototype.asFunction = function (fn, defaults, opts) {
        if (defaults === void 0) { defaults = {}; }
        opts = __assign(__assign(__assign({}, FunctionOptionDefaults), { isLazy: false }), opts);
        return (0, function_1.asFunction)(this, fn, opts);
    };
    return Container;
}());
exports.Container = Container;
//# sourceMappingURL=old_container.js.map