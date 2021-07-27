import _ from 'lodash'

export function Pick (values) {
  return function pick (input) {
    return _.pick(input, values)
  }
}