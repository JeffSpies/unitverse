"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionedRegistry = void 0;
var lodash_1 = __importDefault(require("lodash"));
var semver_1 = __importDefault(require("semver"));
var VersionedRegistry = /** @class */ (function () {
    function VersionedRegistry(defaultStore) {
        if (defaultStore === void 0) { defaultStore = '__default__'; }
        this.store = {};
        this.meta = {};
        this.defaultStoreType = '';
        this.createStoreType(defaultStore);
        this.setDefaultStoreType(defaultStore);
    }
    VersionedRegistry.prototype.setDefaultStoreType = function (label) {
        this.defaultStoreType = label;
    };
    VersionedRegistry.prototype.createStoreType = function (label, versioned) {
        if (versioned === void 0) { versioned = true; }
        this.store[label] = {};
        this.meta[label] = {
            isVersioned: versioned
        };
    };
    VersionedRegistry.prototype.processStoreType = function (type) {
        var theType = lodash_1.default.trim(type);
        if (theType === '') {
            theType = this.defaultStoreType;
        }
        return theType;
    };
    VersionedRegistry.prototype.registerVersion = function (id, version, obj, type) {
        if (type === void 0) { type = ''; }
        if (!semver_1.default.valid(version)) {
            throw Error('Version invalid (semver)');
        }
        var theType = this.processStoreType(type);
        lodash_1.default.set(this.store, [theType, id, version], obj);
    };
    VersionedRegistry.prototype.listVersionedObjects = function (name, type) {
        if (type === void 0) { type = ''; }
        var storeType = this.processStoreType(type);
        if (!this.meta[storeType].isVersioned) {
            throw Error('The store type requested is not versioned');
        }
        var versions = lodash_1.default.get(this.store, [storeType, name]);
        if (!versions && lodash_1.default.size(versions) > 0) {
            return undefined;
        }
        return versions;
    };
    VersionedRegistry.prototype.listVersions = function (name, type) {
        if (type === void 0) { type = ''; }
        var versions = this.listVersionedObjects(name, type);
        var versionKeys = lodash_1.default.keys(versions);
        return versionKeys;
    };
    VersionedRegistry.prototype.get = function (name, type) {
        if (type === void 0) { type = ''; }
        var storeType = this.processStoreType(type);
        if (this.meta[storeType].isVersioned) {
            return this.getVersion(name, '>0.0.0', type);
        }
        return lodash_1.default.get(this.store, [storeType, name]);
    };
    VersionedRegistry.prototype.getVersion = function (name, version, type) {
        if (type === void 0) { type = ''; }
        var versions = this.listVersionedObjects(name, type);
        var versionKeys = lodash_1.default.keys(versions);
        var maxVersion = semver_1.default.maxSatisfying(versionKeys, version);
        return lodash_1.default.get(versions, maxVersion);
    };
    return VersionedRegistry;
}());
exports.VersionedRegistry = VersionedRegistry;
//# sourceMappingURL=versioned-registry.js.map