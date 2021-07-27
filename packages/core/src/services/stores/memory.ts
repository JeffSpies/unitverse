import { AbstractStore } from "../../base/store";
import _ from 'lodash'

class Store extends AbstractStore {
  data: any = {}
  constructor () {
    super()    
  }
  get (path, defaultValue: any = undefined) {
    return _.get(this.data, path, defaultValue)
  }

  set (path, value) {
    _.set(this.data, path, value)
  }
} 