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
  constructorFunctions: (Task | Function)[]
  wrappedFunctions: any
  wrapperTask: any

  constructor (tasks = [], options: Options = {}) {
    super()
    this.wrapperTask = options.wrapper
    this.constructorFunctions = _.isArray(tasks) ? tasks : [ tasks ]
    this.wrappedFunctions = []
  }

  private push (fn: Function | Promise<any>) {
    if (this.wrapperTask) {
      const task = this.wrapperTask({ fn })
      
      // Create new function
      fn = task.fn.bind(task)
    }
    this.wrappedFunctions.push(fn)
  }

  private async add (obj: any | any[], workflowInput?: any): Promise<boolean> {
    if (_.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const individualFunction = obj[i]
        await this.add(individualFunction, workflowInput)
      }
    } else if ( obj instanceof Task ) {
      // if (obj.requiresWorkflowInput) {
      const potentialFnToAdd = await obj.forWorkflow(this, workflowInput)
      if (potentialFnToAdd) {
        this.push(potentialFnToAdd)
      }
    } else if ( isPromise(obj) || _.isFunction(obj) ) {
      if (!functionName(obj)) {
        Object.defineProperty(obj, 'name', { value: 'arrow-function' })
      }
      this.push(obj)
    } else {
      console.error('Trying to add an inappropritely typed service or task')
    }
    return true
  }

  public clear () {
    this.wrappedFunctions = []
  }

  public async setup (workflowInput): Promise<void> {
    if (!_.isEmpty(this.constructorFunctions)) {
      await this.add(this.constructorFunctions, workflowInput)
    }
  }

  public async fn (input): Promise<Function> {
    return (async (input, wrappedFunctions) => {
      console.log(`workflow received input ${input}`)
      await this.setup(input)
      let result: any = input
      for ( let i = 0; i < wrappedFunctions.length; i++ ) {
        const currentFn = wrappedFunctions[i]
        result = await currentFn(result)
      }
      return result
    })(input, this.wrappedFunctions)
  }
}