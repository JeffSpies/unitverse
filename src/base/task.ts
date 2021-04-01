// import { IRunContext } from '../base/runContext' // TODO Move this to class var

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

  async onPreplan(context) {
    return true // TODO Maybe change this to Task.continuePreplanning
  }

  abstract fn(input?: any): any | Promise<any>

  async close () {
    return true
  }
}