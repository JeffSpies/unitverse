import { Workflow } from "../tasks/workflow"

import functionName from '../util/function-name'

export interface TaskOptions {
  name?: string
}

export const TaskDefaults = {
  name: undefined
}

export abstract class Task {
  name: string
  engine: any // todo do we need this
  
  static inject: boolean = false

  constructor(opts?: TaskOptions) {
    opts = {
      ...TaskDefaults,
      ...opts
    }
    this.name = opts.name || functionName(this.constructor)
  }

  emit(topic, message) {
    // const topicArray = [this.constructor.name, this.name].concat(topic)
    // const topicString = topicArray.join(':')
    // this.engine.emitter.emit(topicString, message)
  }

  requiresWorkflowInput: boolean = false

  // async forWorkflow(workflow?: Workflow): Promise<Function> {
  //   const bound = this.run.bind(this)
  //   Object.defineProperty(bound, "name", { value: this.name })
  //   return bound
  // }

  abstract run(input?: any): any | Promise<any>

  async close () {
    return true
  }
}