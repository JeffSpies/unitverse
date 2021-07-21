import _ from 'lodash'

export function Pick (values) {
  return (input) => {
    return _.pick(input, values)
  }
}