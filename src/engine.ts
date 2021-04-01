
import _ from 'lodash'
import pWaterfall from 'p-waterfall'
import pMap from 'p-map'
import { Task } from './base/task'
import { Observer } from './observer'
import metadata from './util/metadata'

export class Engine {
  scope: any
  taskObjects: Task[] = []
  planned: Observer[]

  constructor({ scope }) {
    this.scope = scope
  }

  public plan ( script: (Function | Task | Observer)[] ) {
    // From awilix readme:
    //  Builds an instance of a class (or a function) by injecting dependencies
    //  but without registering it in the container.
    // Allow script to take advantage of DI (could have a config option on this)
    const functionsAndTasks = this.scope.build(script)

    return _.map(functionsAndTasks, fnOrTask => {

      // We're checking if this is a function created as result of the using 
      // the wrapped task class. If the task function (really a Task 
      // constructor) had input, it wouldn't be a function, but a Task. That's
      // why we call the function (i.e., instantiate the class without input
      // to the consturctor).
      const wasWrappedByCreateEngine: boolean = metadata.get(fnOrTask, 'wrappedConstructor')
      if ( wasWrappedByCreateEngine ) {
        const taskObject = fnOrTask() // Constructing the task without an input
        return taskObject.fn.bind(taskObject)
      }

      return fnOrTask instanceof Task ?
        fnOrTask.fn.bind(fnOrTask) :
        fnOrTask
    })
  }

  public build ( script: any): Function {
    const fnArray = this.plan(script)
    return ( fnArray => { 
      return input => pWaterfall(fnArray, input)
    })( fnArray )
  }

  /**
   * 
   * @param fns 
   * @param input 
   */
  public async run( script:any, input?: any ): Promise<any> {
    const builtFunction = this.build(script)
    const result = await builtFunction(input)
    return result
  }

  /**
   * Closes all tasks registered in the engine
   */
  public async close(): Promise<Boolean> {
    if (
      _.every(await pMap(
        this.taskObjects, 
        (task:Task) => task.close()
      ), i => i === true)
    ) {
      // this.emitter.emit('engine:close', true)
      return true
    }
    // this.emitter.emit('engine:close', false)
    return false
  }
}
