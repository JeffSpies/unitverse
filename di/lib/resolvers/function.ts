import { Container } from "../container"
import _ from 'lodash'

export interface FunctionOptions {
  inject?: boolean
  isLazy?: boolean
  resolve?: 'identity'
  defaults?: any
  dependencies?: any
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
          const resolved = this.resolveInDependencies(propString, opts.dependencies)
          return resolved
        }.bind(container)
      })
    }
    return fn(...args)
  }
}