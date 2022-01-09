import _ from 'lodash'
import { makeTask } from '../internal'

export const Get = makeTask(
  function Get (path, defaultValue:any=undefined) {
    return function get (input) {
      return _.get(input, path, defaultValue)
    }
  }
)