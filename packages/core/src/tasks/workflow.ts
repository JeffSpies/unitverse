import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'
import async from 'async'

import metadata from '../util/metadata'

import { Task } from '../base/task'
import functionName from '../util/function-name'

export function nameWorkflow (value) {
  function workflowName () {
    return value
  }
  metadata.set(workflowName, 'unitverse:workflow:name', true)
  return workflowName
}

export interface WorkflowConfig {
  wrapper?: any
  name?: string
}
export class Workflow extends Task {
  taskName = 'workflow'

  originalTasks: (Task | Function)[]

  wrappedTasks: any
  wrapperTask: any

  input: any

  constructor (tasks = [], options: WorkflowConfig = {}) {
    super()
    
    this.originalTasks = tasks
    this.wrappedTasks = []

    this.wrapperTask = options.wrapper
  }

  private async add (obj: Function | Task | Promise <any> | (Function | Promise <any> | Task)[]): Promise<boolean> {
    if (_.isArray(obj)) {
    } else if (obj instanceof Task || isPromise(obj) || _.isFunction(obj)) {
      obj = [ <Function | Task | Promise<any>> obj ]
    } else {
      obj = [ () => obj ]
    }

    return await this.addArray(obj)
  }

  private async addArray (obj: (Function | Promise <any> | Task)[]): Promise<boolean> {
    const results = []
    for (let i = 0; i < obj.length; i++) {
      const individualFunction = obj[i]
      results.push(await this.addFunctionOrTask(individualFunction))
    }
    return _.every(results)
  }

  private async addFunctionOrTask (obj: Function | Task | Promise<any>): Promise<boolean> {
    if ( obj instanceof Task ) {
      // if (obj.requiresWorkflowInput) {
      // const potentialFnToAdd = obj.run.bind(obj) // await obj.forWorkflow(this)
      // if (potentialFnToAdd) {
      this.wrapAndPush(obj.run.bind(obj))
      // }
    } else if ( isPromise(obj) || _.isFunction(obj) ) {
      if (metadata.get(obj, 'unitverse:workflow:name')) {
        this.name = (<Function>obj)()
        return true
      }

      if (!functionName(obj)) {
        Object.defineProperty(obj, 'name', { value: 'arrow-function' })
      }
      this.wrapAndPush(obj)
    } else {
      console.error(`Trying to add an inappropritely typed service or task ${obj.name}`)
    }
    return true
  }

  private wrapAndPush (fn: Function | Promise<any>) {
    if (this.wrapperTask) {
      const task = this.wrapperTask({ fn })
      // Create new function
      fn = task.run.bind(task)
      Object.defineProperty(fn, 'name', { value: task.name })
    }
    this.wrappedTasks.push(fn)
  }

  public clear () {
    this.wrappedTasks = []
  }

  public async setup (): Promise<void> {
    if (!_.isEmpty(this.originalTasks)) {
      await this.add(this.originalTasks)
      this.originalTasks = []
    }
  }

  public async run (input): Promise<Function> {
    this.input = input

    await this.setup()
    
    let result: any = input
    for ( let i = 0; i < this.wrappedTasks.length; i++ ) {
      const currentFn = this.wrappedTasks[i]
      result = await currentFn(result)
    }
    return result
  }
}