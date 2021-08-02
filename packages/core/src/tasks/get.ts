import _ from 'lodash'
import { makeTask } from '../helpers/makeTask'

export const Get = makeTask(
  function Get (path, defaultValue:any=undefined) {
    return function get (input) {
      return _.get(input, path, defaultValue)
    }
  }
)