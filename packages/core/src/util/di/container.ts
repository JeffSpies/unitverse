import _ from 'lodash'
import { asClass, ClassOptions } from './resolvers/class'
import { asFunction, FunctionOptions } from './resolvers/function'

const RESERVED_WORDS = ['constructor', 'length']

const ClassOptionDefaults: ClassOptions = {
  inject: true,
  isLazy: true,
  resolve: 'identity',
  defaults: {}
}

const FunctionptionDefaults: FunctionOptions = {
  inject: true,
  isLazy: true,
  defaults: {}
}

interface StoredObject {
  obj?: any
  isAlias?: boolean
  opts?: any
}

interface Registry {
  [key: string]: StoredObject
}

export class Container {
  registry: Registry
  
  constructor() {
    this.registry = <Registry>{}
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

  private register(
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
    if (stored.opts.isLazy) {
      // Let's undo the laziness
      this.registry[name].obj = stored.obj()
      this.registry[name].opts.isLazy = false
      return stored.obj
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

  public registerClass(
    name: string,
    obj: any,
    defaults: any = {},
    opts?: ClassOptions
  ) {
    opts = {
      ...ClassOptionDefaults,
      defaults,
      ...opts
    }
    return this.register(name, obj, opts, asClass)
  }

  public registerFunction (
    name: string,
    obj: any,
    defaults: any = {},
    opts?: FunctionOptions
  ) {
    opts = {
      ...FunctionptionDefaults,
      defaults,
      ...opts
    }
    return this.register(name, obj, opts, asFunction)
  }

  public registerValue(name: string, obj) {
    // todo use this.register
    this.registry[name] = <StoredObject>{ obj }
    return true
  }

  public asClass(cls: any, defaults: any = {}, opts: ClassOptions) {
    opts = {
      ...ClassOptionDefaults,
      defaults,
      isLazy: false,
      ...opts
    }
    return asClass(this, cls, opts)
  }

  public asFunction(cls, defaults: any = {}, opts) {
    opts = {
      ...FunctionptionDefaults,
      defaults,
      isLazy: false,
      ...opts
    }
    return asFunction(this, cls, opts)
  }

  asValue(obj: any) {
  }
}