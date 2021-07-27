import _ from 'lodash'

export function Get (path, fallback:any=undefined) {
  return (input) => {
    return _.get(input, path, fallback)
  }
}