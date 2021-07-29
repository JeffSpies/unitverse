import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'
import async from 'async'

import metadata from '../util/metadata'

import { Task } from '../base/task'
import functionName from '../util/function-name'

export interface WorkflowConfig {
  wrapper?: any
  wrapperConfig?: any
  name?: string
}
export class Workflow extends Task {
  tasks: any = []

  wrapper: any
  wrapperConfig: any

  options

  constructor (tasks: any = [], options: WorkflowConfig = {}){
    super(tasks, options)
    this.wrapper = options.wrapper
    this.wrapperConfig = options.wrapperConfig
    this.add(tasks)
    if (this.wrapper) {
      return this.wrapper(this, this.wrapperConfig)
    }
  }

  private add ( tasks: Task | Task[]): boolean {
    if (!_.isArray(tasks)) {
      tasks = [ tasks ]
    }
    return this.addArray(tasks)
  }

  private addArray (tasks: Task[]): boolean {
    const results = []
    for (let i = 0; i < tasks.length; i++) {
      const individualFunction = tasks[i]
      results.push(this.addTask(individualFunction))
    }
    return _.every(results)
  }

  private addTask (task: Task): boolean {
    task.setParentWorkflow(this)
    this.wrapAndPushTask(task)
    return true
  }

  private wrapAndPushTask (task: Task) {
    if (this.wrapper) {
      task = this.wrapper(task, this.wrapperConfig)
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