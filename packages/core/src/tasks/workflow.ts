import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'
import async from 'async'

import metadata from '../util/metadata'

import { Task } from '../base/task'
import functionName from '../util/function-name'

interface Options {
  wrapper?: any
}

export class Workflow extends Task {
  originalTasks: (Task | Function)[]

  wrappedTasks: any
  wrapperTask: any

  input: any

  constructor (tasks = [], options: Options = {}) {
    super()
    
    this.originalTasks = tasks
    this.wrappedTasks = []

    this.wrapperTask = options.wrapper
  }

  private async add (obj: Function | Task | (Function | Task)[]): Promise<boolean> {
    // if (_.isFunction(obj)) {
    //   const result = await obj()
    //   if (_.isArray(result)) {
    //     return await this.addArray(result)
    //   } else {
    //     // todo maybe we shoudln't allow this, I don't know
    //     return await this.addFunctionOrTask(obj)
    //   }
    // }
    if (_.isArray(obj)) {
      return await this.addArray(obj)
    } else {
      console.log('error')
    }
  }

  private async addArray (obj: (Function | Task)[]): Promise<boolean> {
    const results = []
    for (let i = 0; i < obj.length; i++) {
      const individualFunction = obj[i]
      results.push(await this.addFunctionOrTask(individualFunction))
    }
    return _.every(results)
  }

  private async addFunctionOrTask (obj: Function | Task): Promise<boolean> {
    if ( obj instanceof Task ) {
      // if (obj.requiresWorkflowInput) {
      // const potentialFnToAdd = obj.run.bind(obj) // await obj.forWorkflow(this)
      // if (potentialFnToAdd) {
      this.wrapAndPush(obj.run.bind(obj))
      // }
    } else if ( isPromise(obj) || _.isFunction(obj) ) {
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