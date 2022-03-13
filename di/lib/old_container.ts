import _ from 'lodash'
import { asClass as asClassResolver, ClassOptions } from './resolvers/class'
import { asFunction as asFunctionResolver, FunctionOptions } from './resolvers/function'
import { asValue as asValueResolver, ValueOptions } from './resolvers/value'
import { VersionedRegistry } from './versioned-registry'

const RESERVED_WORDS = ['constructor', 'length']

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
  defaults: {},
  dependencies: {}
}

const ValueOptionDefaults: ValueOptions = {}

interface StoredObject {
  obj?: any
  isAlias?: boolean
  opts?: any
}

export class Container {
  registry: VersionedRegistry
  
  constructor() {
    this.registry = <VersionedRegistry>{}
  }

  public contains (name: string) {
    if (_.has(this.registry, _.lowerCase(name))) {
      return true
    }
    return false
  }

  private isReserved (name) {
    if (name in RESERVED_WORDS) {
      return true
    }
    return false
  }

  private connectResolver(
    name: string,
    obj: any,
    opts,
    as
  ): boolean {
    if (this.isReserved(name)) {
      return false
    }

    const compiled = opts.isLazy ?
      () => as(this, obj, opts) :
      as(this, obj, opts)
    
    this.registry[name] = <StoredObject> {
      obj: compiled,
      opts
    }

    return true
  }

  public resolve(name: string) {
    if (this.isReserved(name)) {
      return undefined
    }

    const stored = this.registry[name]
    if (!stored) {
      return undefined
    }
    if (stored.isAlias) {
      return this.resolve(stored.obj)
    }
    // if (stored.opts.isLazy) {
    //   // Let's undo the laziness
    //   this.registry[name].obj = stored.obj()
    //   this.registry[name].opts.isLazy = false
    //   return stored.obj
    // }
    if (stored.opts.resolve === 'instance') {
      this.registry[name].obj = stored.obj()
      this.registry[name].opts.resolve = 'identity'
    }
    return stored.obj
  }

  public registerAlias(
    name: string,
    target: string
  ) {
    this.registry[name] = <StoredObject> {
      isAlias: true,
      obj: target
    }
    // todo use this.register
    return true
  }

  /**
   * defaults The default contructor arguments used when instantiate the class
   */
  public registerClass(
    name: string,
    obj: any,
    opts?: ClassOptions
  ) {
    opts = {
      ...ClassOptionDefaults,
      ...opts
    }
    return this.connectResolver(name, obj, opts, asClassResolver)
  }

  public registerFunction (
    name: string,
    obj: any,
    opts?: FunctionOptions
  ) {
    opts = {
      ...FunctionOptionDefaults,
      ...opts
    }
    return this.connectResolver(name, obj, opts, asFunctionResolver)
  }

  public registerValue(
    name: string,
    obj: any,
  ) {
    return this.connectResolver(name, obj, {}, asValueResolver)
  }

  /**
   * defaults The default contructor arguments used when instantiate the class
   */
  public asClass(cls: any, defaults: any = {}, opts: ClassOptions) {
    opts = {
      ...ClassOptionDefaults,
      isLazy: false,
      ...opts
    }
    return asClassResolver(this, cls, opts)
  }

  /**
   * defaults The default contructor arguments used when instantiate the class
   */
  public asFunction(fn, defaults: any = {}, opts: FunctionOptions) {
    opts = {
      ...FunctionOptionDefaults,
      isLazy: false,
      ...opts
    }
    return asFunctionResolver(this, fn, opts)
  }

  // asValue(obj: any, opts) {
  //   opts
  // }
}