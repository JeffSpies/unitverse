import { Task } from '../base/task'

interface InputConfig {
  [key: string]: any
}

export class Inputter extends Task{
  value: any

  constructor(value: any, config:InputConfig) {
    super('Input Task', config)
    this.value = value
  }

  fn (input?: any) {
    return this.value
  }
}