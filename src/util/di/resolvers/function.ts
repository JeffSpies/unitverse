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
    const diObjectIndex = args.length - 1
    if (_.isPlainObject(args[diObjectIndex])) {
      args[diObjectIndex] = new Proxy(args[diObjectIndex], {
        get: function (obj, prop) {
          const propString = <string>prop
          if (Object.keys(obj).includes(propString)) {
            return obj[prop]
          }
          if (Object.keys(opts.defaults).includes(propString)) {
            return opts.defaults[propString]
          }
          const resolved = this.resolve(propString)
          return resolved
        }.bind(container)
      })
    }
    return fn(...args)
  }
}