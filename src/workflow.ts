import _ from 'lodash'
import isPromise from 'p-is-promise'

import metadata from './util/metadata'

import { Engine } from './engine'
import { Service } from './base/service'
import { Task } from './base/task'

export class Workflow {
  engine: any
  functions: any

  constructor (engine: Engine) {
    this.engine = engine
    this.functions = []
  }

  private push (fn: Function | Promise<any>) {
    this.functions.push(fn)
  }

  public async add (obj): Promise<boolean> {
    if ( obj.prototype instanceof Service ) {
    } else if ( obj instanceof Service ) {
    } else if ( obj.prototype instanceof Task ) {
    } else if ( obj instanceof Task ) {
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
    // We're checking if this is a function created as result of the using 
    // the wrapped task class. If the task function (really a Task 
    // constructor) had input, it wouldn't be a function, but a Task. That's
    // why we call the function (i.e., instantiate the class without input
    // to the consturctor).
    // const wasWrappedByCreateEngine: boolean = metadata.get(obj, 'wrappedConstructor')
    // if ( wasWrappedByCreateEngine ) {
    //   console.log('Found wrapped Task')
    //   const taskObject = obj() // TODO ? Constr4ucting the task without an input
    //   this.push(taskObject.fn.bind(taskObject))
    // } else if (obj instanceof Task) {
    //   console.log('Found instantiated Task')
    //   
    // } else {
    //   console.log('Found function')
    //   this.push(obj)
    // }
    return true
  }

  public clear (fn) {
    this.functions = []
  }

  public compile () {
    return ( fnArray => {
      return async () => {
        let result
        for ( let i = 0; i < fnArray.length; i++ ) {
          const currentFn = fnArray[i]
          result = await currentFn(result)
          if( this.engine.wasExitCalled ) {
            return this.engine.exitResult
          }
        }
        return result
      }
    })( this.functions )
  }
}