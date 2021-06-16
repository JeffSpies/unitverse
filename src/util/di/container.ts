import _ from 'lodash'
import { asClass, ClassOptions } from './resolvers/class'

const ClassOptionDefaults: ClassOptions = {
  inject: true
}

interface StoredObject {
  obj: any
  isAlias?: boolean
  cached?: any
  args?: any
}

interface Registry {
  [key: string]: StoredObject
}

export class Container {
  registry: Registry
  
  constructor() {
    this.registry = <Registry>{}
  }

  public registerClass(name: string, obj: any, constructorDefaults: any = {}, opts?: ClassOptions) {
    opts = {
      ...ClassOptionDefaults,
      ...opts,
      constructorDefaults
    }
    
    obj = this.asClass(obj, opts.constructorDefaults, opts)

    this.registry[name] = <StoredObject>{ obj }
  }

  public asClass(cls: any, defaults: any, opts: ClassOptions) {
    return asClass(this, cls, defaults, opts)
  }

  asValue(obj: any) {

  }

  public resolve(name: string) {
    const stored = this.registry[name]
    if (!stored) {
      return undefined
    }
    if (stored.isAlias) {
      return this.resolve(stored.obj)
    }
    return stored.obj
  }
}