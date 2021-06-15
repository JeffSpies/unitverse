import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'

import metadata from './util/metadata'

import { Task } from './base/task'

export class Workflow extends Task {
  functions: any

  constructor () {
    super()
    this.functions = []
  }

  private push (fn: Function | Promise<any>) {
    this.functions.push(fn)
  }

  public async add (obj): Promise<boolean> {
    if ( obj instanceof Task ) {
      const potentialFnToAdd = await obj.forWorkflow(this)
      if (potentialFnToAdd) {
        this.push(potentialFnToAdd)
      }
    } else if ( isPromise(obj) ) {
      this.push(obj)
    } else if ( _.isFunction(obj) ) {
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
      return async () => {
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