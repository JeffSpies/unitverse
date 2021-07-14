import { Task } from '../base/task'
import { AbstractEmitter } from '../base/emitter'

export class Wrapper extends Task {
  func: any
  shouldLog: any
  emitter: AbstractEmitter

  constructor ({ fn, shouldLog, emitter }) {
    super()
    this.func = fn
    this.shouldLog = shouldLog
    this.name = this.func.name
    this.emitter = emitter
  }

  public fn (input) {
    return (async (input) => {
      this.emitter.emit('task:input', `Processing ${input}`)
      const time = process.hrtime()
      if (this.shouldLog) {
        console.log('Function', this.name, 'input', input)
      }
      const result = await this.func(input)
      const diff = process.hrtime(time)
      if (this.shouldLog) {
        console.log(`${this.name} took ${(diff[0] * 1e9 + diff[1])} ns`)
        console.log(`${this.name} took ${(diff[0] * 1e9 + diff[1]) * 1e-6} ms`)
      }
      this.emitter.emit('task:output', `Processing ${input}`)
      return result
    })(input)
  }
}