import _ from 'lodash'

interface StoredObject {
  obj: any
  isAlias?: boolean
  cached?: any
  args?: any
}

interface Registry {
  [key: string]: StoredObject
}

interface RegistrationOptions {
  type?: string
  inject?: boolean
  defaultClassConfig?: any
}

export class Container {
  registry: Registry
  
  constructor() {
    this.registry = <Registry>{}
  }

  getStored(name: string) {
    const stored = this.registry[name]
    if (!stored) {
      return undefined
    }
    if (stored.isAlias) {
      return this.getStored(stored.obj)
    }
    return stored.obj
  }

  register(name: string, obj: any, opts: RegistrationOptions = {}) {
    const defaults = {
      type: 'value',
      inject: true,
    }
    
    opts = { ...defaults, ...opts}

    if (opts.inject && opts.type === 'class') {
      obj = this.asClass(obj, opts.defaultClassConfig)
    } else if (!opts.inject && opts.type === 'class') {
      obj = this.asUninjectedClass(obj)
    }

    this.registry[name] = <StoredObject>{
      obj
    }
  }

  registerClass(name: string, obj: any, defaults: any, opts?: RegistrationOptions) {
    opts = {
      ...opts,
      type: 'class',
      defaultClassConfig: defaults
    }
    return this.register(name, obj, opts)
  }

  asUninjectedClass(cls) {
    return new Proxy(cls, {
      construct: function(target: any, args: any) {
        const obj = new target(...args)
        return obj
      }.bind(this)
    })
  }

  asClass(cls: any, defaults: any = {} ) {
    const proxy = new Proxy(cls, {
      construct: function(target: any, args: any) {
        if (args.length === 0) {
          args = [{}]
        }

        // TODO some minor optimization by logging the potential values and then iterating over those
        args[0] = new Proxy(args[0], {
          get: function (obj, prop) {
            const propString = <string>prop
            if (Object.keys(obj).includes(propString)) {
              console.log(1, propString)
              return obj[prop]
            }
            if (Object.keys(defaults).includes(propString)) {
              console.log(2, propString)
              return defaults[propString]
            }
            console.log(3, propString)
            return this.getStored(propString)
          }.bind(this)
        })

        const obj = new target(...args)
        return obj
      }.bind(this)
    })
    return (...args) => new proxy(...args)
  }

  asValue(obj: any) {

  }

  resolve(name: string) {
    return this.getStored(name)
  }
}


class Cache {
  constructor({ path }) {
    console.log('Cache path', path)
  }
}

class Checkpoint {
  cache: Cache
  name: string
  constructor({ cache, name }) {
    this.cache = cache()
    this.name = name
    console.log('constructor', cache, name)
  }
}

const container = new Container()
container.registerClass('cache', Cache, { path: '/here'})
container.registerClass('checkpoint', Checkpoint, { name: 'checkpoint' })

const cp = container.resolve('checkpoint')
const c = cp()