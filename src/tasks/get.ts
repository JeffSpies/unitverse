import _ from 'lodash'

export function Get (path) {
  return (input) => {
    return _.get(input, path)
  }
}