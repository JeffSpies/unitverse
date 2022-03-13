import { asClass, ClassOptions } from "./resolvers/class";
import { VersionedRegistry } from "./versioned-registry";

export class Container {
  registry: VersionedRegistry

  constructor () {
    this.registry = new VersionedRegistry()
  }

  public registerClass (pkg: Package, options: ClassOptions): void {
    const opts = {
      ...ClassOptionDefaults,
      ...options,
      dependencies: pkg.dependencies
    };

    const obj = asClass(this, pkg.main, opts);

    this.registry.registerVersion(
      pkg.name,
      pkg.version,
      {
        obj,
        opts
      }
    )
  };

  public resolveInDependencies (name:string, dependencies:any) {
    const dependency = dependencies[name];
    if (dependency === undefined) {
      return undefined
    }
    return this.resolve(dependency.id, dependency.version);
  }

  public resolve(name:string, version:string) {
    const stored = this.registry.getVersion(name, version);
    
    if (stored.opts.resolve === 'instance') {
      this.registry[name].obj = stored.obj();
      this.registry[name].opts.resolve = 'identity';
    }
    
    return stored.obj;
  }
}

interface StoredObject {
  obj?: any
  opts?: any
}

interface Package {
  name: string
  version: string
  dependencies?: any
  main: any
  type: any
}

const ClassOptionDefaults: ClassOptions = {
  inject: true,
  isLazy: true,
  resolve: 'identity',
  defaults: {},
  dependencies: {}
}

const RESERVED_WORDS = ['constructor', 'length']