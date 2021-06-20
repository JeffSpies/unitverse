import { Container } from "../container"
import _ from 'lodash'

interface RegistrationOptions {
  inject?: boolean
  isLazy?: boolean
}

export interface FunctionOptions extends RegistrationOptions {
  defaults?: any
}

export function asFunction(
  container: Container,
  fn: any,
  opts: FunctionOptions
) {
  if (!opts.inject) {
    return fn
  }

  return (...args) => {
    if (args.length === 0 ) {
      args = [{}]
    }
    if (_.isPlainObject(args[0])) {
      args[0] = new Proxy(args[0], {
        get: function (obj, prop) {
          const propString = <string>prop
          if (Object.keys(obj).includes(propString)) {
            return obj[prop]
          }
          if (Object.keys(opts.defaults).includes(propString)) {
            return opts.defaults[propString]
          }
          return this.resolve(propString)
        }.bind(container)
      })
    }
    return fn(...args)
  }
}