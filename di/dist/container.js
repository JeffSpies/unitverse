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
var versioned_registry_1 = require("./versioned-registry");
var Container = /** @class */ (function () {
    function Container() {
        this.registry = new versioned_registry_1.VersionedRegistry();
    }
    Container.prototype.resolveAsStoredObject = function (pkg, options) {
        var opts = __assign(__assign(__assign({}, ClassOptionDefaults), options), { dependencies: pkg.dependencies });
        var obj;
        if (isClass(pkg.main)) {
            obj = (0, class_1.asClass)(this, pkg.main, opts);
        }
        else if (lodash_1.default.isFunction(pkg.main)) {
            obj = (0, function_1.asFunction)(this, pkg.main, opts);
        }
        else {
            obj = pkg.main;
        }
        return __assign(__assign({}, opts), { obj: obj });
    };
    Container.prototype.resolveInDependencies = function (name, dependencies) {
        var dependency = dependencies[name];
        if (dependency === undefined) {
            return undefined;
        }
        return this.resolve(dependency.id, dependency.version);
    };
    Container.prototype.register = function (pkg, options) {
        this.registry.registerVersion(pkg.name, pkg.version, this.resolveAsStoredObject(pkg, options));
    };
    Container.prototype.resolve = function (first, second, third) {
        if (!lodash_1.default.isString(first) && lodash_1.default.isPlainObject(first)) {
            var pkg = first;
            var options = second;
            return this.resolveAsStoredObject(pkg, options).obj;
        }
        if (!lodash_1.default.isString(first) && lodash_1.default.isFunction(first)) {
            var obj = first;
            var dependencies = second;
            var options = third;
            var stored_1 = this.resolveAsStoredObject({
                name: 'tmp',
                version: '0.0.0',
                type: 'class',
                main: obj,
                dependencies: dependencies
            }, options);
            return stored_1.obj;
        }
        var name = first;
        var version = second;
        var stored = this.registry.getVersion(name, version);
        if (stored.resolve === 'instance') {
            this.registry[name].obj = stored.obj();
            this.registry[name].resolve = 'identity';
        }
        return stored.obj;
    };
    return Container;
}());
exports.Container = Container;
function isClass(x) {
    return lodash_1.default.isFunction(x) && x.constructor;
}
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
    resolve: 'identity',
    defaults: {},
    dependencies: {}
};
var RESERVED_WORDS = ['constructor', 'length'];
//# sourceMappingURL=container.js.map