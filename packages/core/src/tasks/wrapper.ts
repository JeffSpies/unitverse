import { Task } from '../base/task'
import { AbstractEmitter } from '../base/emitter'

interface WrapperConfig {
  fn
  shouldLog?: boolean
  emitter?: AbstractEmitter
}

export class Wrapper extends Task {
  func: any
  shouldLog: any
  emitter: AbstractEmitter
  
  logInput: boolean = false
  logOutput: boolean = false
  logTiming: boolean = false

  constructor ({ fn, logInput, logOutput, logTiming, emitter }) {
    super()
    this.func = fn
    this.name = this.func.name
    this.emitter = emitter

    this.logInput = logInput
    this.logOutput = logOutput
    this.logTiming = logTiming
  }
 
  public async run (input) {
    
    let time
    if (this.logTiming) time = process.hrtime()
    if (this.logInput) console.log('task:input', this.name, 'input', `${input}`.substring(0, 10))

    const result = await this.func(input)
    
    if (this.logTiming) {
      const diff = process.hrtime(time)
      console.log(`${this.name} took ${(diff[0] * 1e9 + diff[1]) * 1e-6} ms`)
    }

    if (this.logOutput) console.log('task:output', this.name, `${JSON.stringify(result)}`.substring(0, 200))

    return result
  }
}