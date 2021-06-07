import metadata from './util/metadata'
import { Task } from './base/task'
import { Engine } from './engine'

export class Workflow {
  engine: any
  functions: any

  constructor (engine: Engine) {
    this.engine = engine
    this.functions = []
  }

  public add (fnOrTask) {
    let objToAdd

    // We're checking if this is a function created as result of the using 
    // the wrapped task class. If the task function (really a Task 
    // constructor) had input, it wouldn't be a function, but a Task. That's
    // why we call the function (i.e., instantiate the class without input
    // to the consturctor).
    const wasWrappedByCreateEngine: boolean = metadata.get(fnOrTask, 'wrappedConstructor')
    if ( wasWrappedByCreateEngine ) {
      console.log('Found wrapped Task')
      const taskObject = fnOrTask() // TODO ? Constructing the task without an input
      objToAdd = taskObject.fn.bind(taskObject)
    } else if (fnOrTask instanceof Task) {
      console.log('Found instantiated Task')
      objToAdd = fnOrTask.fn.bind(fnOrTask)
    } else {
      console.log('Found function')
      objToAdd = fnOrTask
    }

    this.functions.push(objToAdd)
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