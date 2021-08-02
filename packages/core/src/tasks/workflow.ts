import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'
import async from 'async'

import metadata from '../util/metadata'

import { Task } from '../base/task'
import functionName from '../util/function-name'

export interface WorkflowConfig {
  Wrapper?: any
  WrapperConfig?: any
  name?: string
}
export class Workflow extends Task {
  tasks: any = []

  Wrapper: any
  WrapperConfig: any

  options

  constructor (tasks: any = [], options: WorkflowConfig = {}){
    super(tasks, options)
    const { Wrapper, WrapperConfig, name } = options
    
    this.Wrapper = Wrapper
    this.WrapperConfig = WrapperConfig || {}
    this.add(tasks)
    if (this.Wrapper) {
      return new this.Wrapper(this, this.WrapperConfig)
    }
  }

  private add ( tasks: Task | Task[]): boolean {
    if (!_.isArray(tasks)) {
      tasks = [ tasks ]
    }
    return this.addArray(tasks)
  }

  private addArray (tasks: (Function | Task)[]): boolean {
    const results = []
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (task instanceof Task) {
        results.push(this.addTask(task))
      } else {
        results.push(this.addFunction(task))
      }
    }
    return _.every(results)
  }

  private addTask (task: Task): boolean {
    task.setParentWorkflow(this)
    this.wrapAndPushTask(task)
    return true
  }

  private addFunction(task: Function): boolean {
    return true
  }

  private wrapAndPushTask (task: Task) {
    if (this.Wrapper) {
      task = new this.Wrapper(task, this.WrapperConfig)
    }
    this.tasks.push(task)
  }

  public async run (input: any): Promise<Function> {
    let result: any = input
    for ( let i = 0; i < this.tasks.length; i++ ) {
      result = await this.tasks[i].run(result)
    }
    return result
  }
}