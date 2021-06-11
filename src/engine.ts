
import _ from 'lodash'
import pMap from 'p-map'
import { Task } from './base/task'
import { Workflow } from './workflow'
import { asFunction } from 'awilix'

export class Engine {
  builtFunction: any = undefined
  scope: any
  taskObjects: Task[] = []

  workflow: Workflow = new Workflow(this)
  
  wasExitCalled: boolean = false
  exitResult: any = undefined

  constructor({ scope }) {
    this.scope = scope
    const exitFn = this.exit.bind(this)
    this.scope.register('exit', asFunction(() => exitFn))
  }

  public inject ( fn ) {
    return (input) => asFunction(fn).inject(
      () => ({ input })
    ).resolve(this.scope)
  }

  public async build ( script: any): Promise<Function> {
    // From awilix readme:
    //  Builds an instance of a class (or a function) by injecting dependencies
    //  but without registering it in the container.
    // Allow script to take advantage of DI (could have a config option on this)
    const functionsAndTasks = this.scope.build(script)

    for ( let i = 0; i < functionsAndTasks.length; i++ ) {
      await this.workflow.add(functionsAndTasks[i])
    }

    if (this.builtFunction === undefined) {
      this.builtFunction = this.workflow.compile()
    }
    return this.builtFunction
  }

  /**
   * 
   * @param fns 
   * @param input 
   */
  public async run( script:any, input?: any ): Promise<any> {
    if (this.builtFunction === undefined) {
      this.builtFunction = await this.build(script)
    }
    return this.builtFunction(input)
  }

  public exit ( result: any ) {
    this.wasExitCalled = true
    this.exitResult = result
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
