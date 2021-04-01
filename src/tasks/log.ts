import { Task } from '../base/task'
import _ from 'lodash'

interface LogConfig {
  [key: string]: any
}

export class Log extends Task{
  message: string | Function

  constructor(message?: string | Function, config?:LogConfig) {
    super()
    this.message = message
  }

  fn (input: any) {
    let output
    if (_.isFunction(this.message)) {
      output = this.message(input)
    } else if(this.message) {
      output = this.message
    } else {
      output = input
    }
    console.log(output)
    return input
  }
}