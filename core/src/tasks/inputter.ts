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

  run (input?: any) {
    return this.value
  }
}