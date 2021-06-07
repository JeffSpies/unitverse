export abstract class Task {
  name: string
  engine: any

  constructor(name?: string, config?: any) {
    // this.name = name
    // this.engine = config.engine
  }

  emit(topic, message) {
    // const topicArray = [this.constructor.name, this.name].concat(topic)
    // const topicString = topicArray.join(':')
    // this.engine.emitter.emit(topicString, message)
  }

  async forWorkflow(workflow: any | undefined) {
    return this.fn.bind(this)
  }

  abstract fn(input?: any): any | Promise<any>

  async close () {
    return true
  }
}