import _ from "lodash"
import { Container } from "../container"

export interface ClassOptions {
  inject?: boolean
  isLazy?: boolean
  resolve?: 'instance' | 'identity'
  defaults?: any
  dependencies?: any
}

export function asClass(container: Container, cls: any, opts: ClassOptions) {
  let proxy
  if (opts.inject) {
    proxy = new Proxy(cls, {
      construct: function(target: any, args: any) {
        // If the constructor takes no arguments, then it can't be expecting
        // injected objects. However, there are occasions where the
        // constructor is a, e.g., a makeTask wrapper, and args are passed in, but
        // the target seems to take no args. That's why we check both.
        if (_.isEmpty(args) && target.length === 0) {
          return new target()
        }
        
        // If the last argument is not a plain object AND
        // If the number of arguments in the constructor is greater than those
        //  provided, fill in undefined until we get to the assumed injectable
        // options parameter at the end
        if ( target.length > args.length) {
          _.times(target.length - args.length - 1, () => {
            args.push(undefined)
          })
          args.push({})
        } else {
          // The last argument will always be {} if the above if-conditional
          // was true, so just do this as an else - mostly for the weird-wrapper
          // scenario when the target is not relfective of the underlying function
          // being called
          if (!_.isPlainObject(args[args.length-1])) {
            args.push({})
          }
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

            // Then, check if the property was included/overwritten by args
            if (Object.keys(opts.defaults).includes(propString)) {
              return opts.defaults[propString]
            }

            // Then, check the containerd--if not found, return undefined
            const resolved = this.resolveInDependencies(propString, opts.dependencies)
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
    case 'identity': {
      // A proxied class will return the class
      return proxy
    }
    case 'instance': {
      return (...args: any[]) => new proxy(...args)
    }
  }
}