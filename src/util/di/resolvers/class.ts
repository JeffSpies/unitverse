import { Container } from "../container"

interface RegistrationOptions {
  inject?: boolean
}

export interface ClassOptions extends RegistrationOptions {
  constructorDefaults?: any
  resolve?: 'instantiate' | 'wrap' | 'proxy'
}

function classResolution (proxy, type: 'proxy' | 'instantiate' | 'wrap') {
  switch (type) {
    case 'proxy': {
      return proxy
    }
    case 'instantiate': {
      return new proxy()
    }
    case 'wrap': {
      return (...args: any[]) => new proxy(...args)
    }
  } 
}

export function asClass(container: Container, cls: any, defaults: any = {}, opts: ClassOptions) {
  let proxy
  if (opts.inject) {
    proxy = new Proxy(cls, {
      construct: function(target: any, args: any) {
        if (args.length === 0) {
          args = [{}]
        }

        // TODO some minor optimization by logging the potential values and then iterating over those
        args[0] = new Proxy(args[0], {
          get: function (obj, prop) {
            const propString = <string>prop
            if (Object.keys(obj).includes(propString)) {
              return obj[prop]
            }
            if (Object.keys(defaults).includes(propString)) {
              return defaults[propString]
            }
            return this.resolve(propString)
          }.bind(container)
        })

        return new target(...args)
      }.bind(container)
    })
  } else {
    proxy = cls
  }
  
  return classResolution(proxy, opts.resolve)
}