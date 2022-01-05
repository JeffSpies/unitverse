import _ from 'lodash'
import semver from 'semver'

export class VersionedRegistry {
  
  store = {}
  defaultStoreType = '__default__'

  constructor () {
    this.store[this.defaultStoreType] = {}
  }

  setDefaultStoreType (label) {
    this.defaultStoreType = label
  }

  createStoreType (label: string) {
    this.store[label] = {}
  }

  register(id, version, obj, type: string = '') {
    if (!semver.valid(version)) {
      throw Error('Version invalid (semver)')
    }
    let theType = _.trim(type)
    if (!theType) {
      theType = this.defaultStoreType
    }
    _.set(this.store, [theType, id, version], obj)
  }

  get(name: string, range, type: string='') {
    let theType = _.trim(type)
    if (!theType) {
      theType = this.defaultStoreType
    }

    const versions = _.get(this.store, [theType, name])
    if (!versions && _.size(versions) > 0) {
      return undefined
    }

    const versionKeys = _.keys(versions)

    const maxVersion = semver.maxSatisfying(versionKeys, range)
    return _.get(versions, maxVersion)
  }
}