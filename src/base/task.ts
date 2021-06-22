import { Workflow } from "../tasks/workflow"

import functionName from '../util/function-name'

export abstract class Task {
  name: string
  engine: any
  
  static inject: boolean = false

  constructor() {
    this.name = functionName(this.constructor)
  }

  emit(topic, message) {
    // const topicArray = [this.constructor.name, this.name].concat(topic)
    // const topicString = topicArray.join(':')
    // this.engine.emitter.emit(topicString, message)
  }

  async forWorkflow(workflow?: Workflow): Promise<Function> {
    const bound = this.fn.bind(this)
    Object.defineProperty(bound, "name", { value: this.name })
    return bound
  }

  abstract fn(input?: any): any | Promise<any>

  async close () {
    return true
  }
}