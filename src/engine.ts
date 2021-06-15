
import _ from 'lodash'
import pMap from 'p-map'
import { Task } from './base/task'
import { Workflow } from './workflow'
import { asFunction } from 'awilix'

export class Engine {
  builtFunction: any = undefined
  scope: any
  taskObjects: Task[] = []

  workflow: any
  
  wasExitCalled: boolean = false
  exitResult: any = undefined

  constructor({ workflow }) {
    this.workflow = workflow
    // this.scope = scope
    // const exitFn = this.exit.bind(this)
    // this.scope.register('exit', asFunction(() => exitFn))
  }

  public async build ( functions: any): Promise<Function> {
    for ( let i = 0; i < functions.length; i++ ) {
      await this.workflow.add(functions[i])
    }

    if (this.builtFunction === undefined) {
      this.builtFunction = this.workflow.fn()
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

  /**
   * 
   * @param result The result you want to exit with
   */
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
