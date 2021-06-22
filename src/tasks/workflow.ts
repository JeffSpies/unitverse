import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'

import metadata from '../util/metadata'

import { Task } from '../base/task'
import functionName from '../util/function-name'

interface Options {
  wrapper?: any
}

const OptionDefaults = {
  wrapper: undefined
}

export class Workflow extends Task {
  functions: any
  wrapperTask: any

  constructor ({ wrapper }) {
    super()
    this.wrapperTask = wrapper
    // opts = {
    //   ...OptionDefaults,
    //   ...opts
    // }
    this.functions = []
  }

  push (fn: Function | Promise<any>) {
    if (this.wrapperTask) {
      const task = this.wrapperTask({ fn })
      fn = task.fn.bind(task)
    }
    this.functions.push(fn)
  }

  public async add (obj): Promise<boolean> {
    if ( obj instanceof Task ) {
      const potentialFnToAdd = await obj.forWorkflow(this)
      if (potentialFnToAdd) {
        this.push(potentialFnToAdd)
      }
    } else if ( isPromise(obj) || _.isFunction(obj) ) {
      if (!functionName(obj)) {
        Object.defineProperty(obj, 'name', { value: 'arrow-function' })
      }
      this.push(obj)
    } else {
      console.error('Trying to add an inappropritely typed service or task')
    }
    return true
  }

  public clear () {
    this.functions = []
  }

  public fn () {
    return ( fnArray => {
      return async function () {
        let result: any
        for ( let i = 0; i < fnArray.length; i++ ) {
          const currentFn = fnArray[i]
          result = await currentFn(result)
          // if( this.engine.wasExitCalled ) {
          //   return this.engine.exitResult
          // }
        }
        return result
      }
    })( this.functions )
  }
}