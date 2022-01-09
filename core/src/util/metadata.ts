import _ from 'lodash'

// TODO function set (obj, mapOfKeyVals)
export function set (obj: any, key: string, value: any): void {
  // TODO maybe switch this to storing unitverse_key on the obj
  const metadata = !Reflect.has(obj, 'unitverse') ?
    {} :
    Reflect.get(obj, 'unitverse')
  metadata[key] = value
  Reflect.set(obj, 'unitverse', metadata)
}

export function get (obj: any, key: string): any {
  const metadata = Reflect.get(obj, 'unitverse')
  return _.get(metadata, key)
}

export default {
  set,
  get
}