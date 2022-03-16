import _ from 'lodash'
import semver from 'semver'

// todo allow for different types
type StoredObject = any

interface VersionedStore {
  [version: string]: StoredObject
}

interface KeyedStore {
  [key: string]: StoredObject | VersionedStore
}

export interface TypedStore {
  [type: string]: KeyedStore
}

export class VersionedRegistry {
  store: TypedStore = {}
  meta: TypedStore = {}

  defaultStoreType: string = ''

  constructor(defaultStore: string = '__default__') {
    this.createStoreType(defaultStore)
    this.setDefaultStoreType(defaultStore)
  }

  setDefaultStoreType(label: string) {
    this.defaultStoreType = label
  }

  createStoreType(label: string, versioned: boolean = true) {
    this.store[label] = {}
    this.meta[label] = {
      isVersioned: versioned
    }
  }

  private processStoreType(type: string) {
    let theType: string = _.trim(type)
    if (theType === '') {
      theType = this.defaultStoreType
    }
    return theType
  }

  public registerVersion(id: string, version: string, obj: any, type: string = '') {
    if (!semver.valid(version)) {
      throw Error('Version invalid (semver)')
    }
    let theType = this.processStoreType(type)

    _.set(this.store, [theType, id, version], obj)
  }

  listVersionedObjects(name: string, type: string = '') {
    const storeType = this.processStoreType(type)
    if (!this.meta[storeType].isVersioned) {
      throw Error('The store type requested is not versioned')
    }

    const versions = _.get(this.store, [storeType, name])
    if (!versions && _.size(versions) > 0) {
      return undefined
    }

    return versions
  }

  listVersions(name: string, type: string = '') {
    const versions = this.listVersionedObjects(name, type)
    const versionKeys = _.keys(versions)
    return versionKeys
  }

  public get(name: string, type: string = '') {
    const storeType = this.processStoreType(type)
    if (this.meta[storeType].isVersioned) {
      return this.getVersion(name, '>0.0.0', type)
    }
    return _.get(this.store, [storeType, name])
  }

  public getVersion(name: string, version: string, type: string = '') {
    const versions = this.listVersionedObjects(name, type)
    const versionKeys = _.keys(versions)
    const maxVersion = semver.maxSatisfying(versionKeys, version)
    return _.get(versions, maxVersion)
  }
}