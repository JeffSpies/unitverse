import _ from 'lodash';

import { asClass, ClassOptions } from "./resolvers/class";
import { asFunction, FunctionOptions } from "./resolvers/function";
import { VersionedRegistry } from "./versioned-registry";

export class Container {
  registry: VersionedRegistry

  constructor () {
    this.registry = new VersionedRegistry()
  }

  public getStoredObject (pkg: Package, options?: ResolveOptions): StoredObject {
    const opts = {
      ...ClassOptionDefaults,
      ...options,
      dependencies: pkg.dependencies
    };

    const obj = asClass(this, pkg.main, opts);

    return <StoredObject>{
      ...opts,
      obj
    }
  }

  public registerClass (pkg: Package, options: ClassOptions): void {
    this.registry.registerVersion(
      pkg.name,
      pkg.version,
      this.getStoredObject(pkg, options)
    )
  };

  public resolveInDependencies (name:string, dependencies:Dependencies) {
    const dependency = dependencies[name];
    if (dependency === undefined) {
      return undefined
    }
    return this.resolve(dependency.id, dependency.version);
  }

  public resolve(obj:Storable, dependencies:Dependencies, options?:ResolveOptions): any
  public resolve(pkg:Package, options?: ResolveOptions): any
  public resolve(name:string, version:string): any
  public resolve(first:Storable|Package|string, second?:Dependencies|ResolveOptions|string, third?:ResolveOptions): any {
    if (!_.isString(first) && _.isPlainObject(first)) {
      const pkg = first
      const options = second
      return this.getStoredObject(<Package>pkg, <ResolveOptions>options).obj
    }

    if (!_.isString(first) && _.isFunction(first)) {
      const obj = first
      const dependencies = second
      const options = third
      return this.getStoredObject(<Package>{
        name: 'tmp',
        version: '0.0.0',
        type: 'class',
        main:obj,
        dependencies
      }, <ClassOptions>options).obj
    }

    const name = <string>first;
    const version = <string>second;

    const stored = this.registry.getVersion(name, version);
    
    if (stored.resolve === 'instance') {
      this.registry[name].obj = stored.obj();
      this.registry[name].resolve = 'identity';
    }
    
    return stored.obj;
  }
}

function isClass (x) {
  return _.isFunction(x) && x.constructor
}

type ClassRef = new (...args: any[]) => any;

type Storable = ClassRef | Function

interface Dependency {
  id: string
  version: string
}

interface Dependencies {
  [x:string]: Dependency
}

interface StoredObject {
  obj?: any
  inject?: boolean
  isLazy?: boolean
  resolve?: 'instance' | 'identity'
  defaults?: any
  dependencies?: Dependencies
}

interface Package {
  name: string
  version: string
  main: Storable
  type: any
  dependencies?: Dependencies
}

type ResolveOptions = ClassOptions | FunctionOptions

const ClassOptionDefaults: ClassOptions = {
  inject: true,
  isLazy: true,
  resolve: 'identity',
  defaults: {},
  dependencies: {}
}

const FunctionOptionDefaults: FunctionOptions = {
  inject: true,
  isLazy: true,
  resolve: 'identity',
  defaults: {},
  dependencies: {}
}

const RESERVED_WORDS = ['constructor', 'length']
