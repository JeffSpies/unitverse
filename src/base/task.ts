import { Workflow } from "../workflow"

export abstract class Task {
  name: string
  engine: any
  
  static inject: boolean = false

  constructor() {
  }

  emit(topic, message) {
    // const topicArray = [this.constructor.name, this.name].concat(topic)
    // const topicString = topicArray.join(':')
    // this.engine.emitter.emit(topicString, message)
  }

  async forWorkflow(workflow?: Workflow): Promise<Function> {
    return this.fn.bind(this)
  }

  abstract fn(input?: any): any | Promise<any>

  async close () {
    return true
  }
}