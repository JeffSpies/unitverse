import _ from 'lodash'
import { asClass, ClassOptions } from './resolvers/class'
import { asFunction, FunctionOptions } from './resolvers/function'

const ClassOptionDefaults: ClassOptions = {
  inject: true,
  isLazy: true,
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

  private register(
    name: string,
    obj: any,
    opts,
    as
  ) {
    const compiled = opts.isLazy ?
      () => as(this, obj, opts) :
      as(this, obj, opts)
    
    this.registry[name] = <StoredObject> {
      obj: compiled,
      opts
    }
  }

  public resolve(name: string) {
    const stored = this.registry[name]
    if (!stored) {
      return undefined
    }
    if (stored.isAlias) {
      return this.resolve(stored.obj)
    }
    if (stored.opts.isLazy) {
      this.registry[name].obj = stored.obj()
      this.registry[name].opts.isLazy = false
      return this.registry[name].obj
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
    this.register(
      name,
      obj,
      opts,
      asClass
    )
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
    this.register(
      name,
      obj,
      opts,
      asFunction
    )
  }

  public registerValue(name: string, obj) {
    this.registry[name] = <StoredObject>{ obj }
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