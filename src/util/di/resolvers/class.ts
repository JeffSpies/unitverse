import _ from "lodash"
import { Container } from "../container"

interface RegistrationOptions {
  inject?: boolean
  isLazy?: boolean
}

export interface ClassOptions extends RegistrationOptions {
  constructorDefaults?: any
  resolve?: 'instantiate' | 'wrap' | 'proxy'
  defaults?: any
}

export function asClass(container: Container, cls: any, opts: ClassOptions) {
  let proxy
  if (opts.inject) {
    proxy = new Proxy(cls, {
      construct: function(target: any, args: any) {
        // If the constructor takes no arguments
        if (target.length === 0) {
          return new target()
        }
        
        // If the number of arguments in the constructor is greater than those
        //  provided, fill in undefined until we get to the assumed injectable
        // options parameter at the end
        if (target.length > args.length) {
          _.times(target.length - args.length - 1, () => {
            args.push(undefined)
          })
          args.push({})
        }

        // Assuming options with injectables are at the very end (or, thus,
        // the start when args.length===1)
        const diObjectIndex = args.length - 1

        args[diObjectIndex] = new Proxy(args[diObjectIndex], {
          get: function (obj, prop) {
            const propString = <string>prop

            // First, check if the obj has that property
            if (Object.keys(obj).includes(propString)) {
              return obj[prop]
            }

            // Thenm, then check if the property was included/overwritten by args
            if (Object.keys(opts.defaults).includes(propString)) {
              return opts.defaults[propString]
            }

            // Then, check the containerd--if not found, return undefined
            const resolved = this.resolve(propString)
            return resolved
          }.bind(container)
        })

        return new target(...args)
      }.bind(container)
    })
  } else {
    proxy = cls
  }
  
  switch (opts.resolve) {
    case 'proxy': {
      // A proxied class will return the class
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