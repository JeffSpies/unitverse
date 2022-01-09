import { Engine} from '../src/di'

import { Cache } from '../src/services/caches/local-fs'

import { Checkpoint } from '../src/tasks/checkpoint'
import { Emitter } from '../src/services/emitters/events'
import { MapValues } from '../src/tasks/map-values'
import { Wrapper } from '../src/tasks/wrapper'
import { Pick } from '../src/tasks/pick'
import { Persist } from '../src/tasks/persist'
import { ParseUrl } from '../src/tasks/parse-url'
import { Get } from '../src/tasks/get'
import { Log } from '../src/tasks/log'
import { WriteFile } from '../src/units/files'
import { Workflow } from '../src/tasks/workflow'

import _ from 'lodash'

function deepMap(obj, iterator, context) {
  return _.transform(obj, function(result, val, key) {
      result[key] = _.isPlainObject(val) ?
        deepMap(val, iterator, context) :
        iterator.call(context, val, key, obj);
  })
}

class Task {
  args: any[]
  constructor () {
  }
}

function proxy = (obj, ...args) => {
  return new Proxy (obj, {
    construct: function (target: any, args: any) {
      args = deepMap(args, (value) => {
        if (value instanceof Task) {
          
        }
      })
      const obj = new target(...args)
      obj.args = args
      return obj
    }
  })
}

function task (cls) {
  return (...args) => proxy(new cls (...args))
}

class Add extends Task {
  value
  options

  constructor(value, options) {
    super()
    this.value = value
    this.options = options
  }
}


(async () => {
  const add = task(Add)
  const a = add(1, { a: 1 })
  console.log(a)
  
  workflow([

  ])
})()
