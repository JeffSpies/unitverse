import { Task } from "../internal"
import functionName from "../util/function-name"

export interface MakeTaskConfig {
  name?: string
  spreadInput?: boolean
  isFactory?: boolean
}

export function makeTask (func: Function, config?: MakeTaskConfig) {
  config = {
    ... {
      name: 'MadeTask',
      spreadInput: false,
      isFactory: true
    },
    ... {
      name: functionName(func)
    },
    ...config
  }

  class CustomTask extends Task {
    fn: Function

    constructor(...options: any) {
      super(func, config, options)
      this.unitverse.name = config.name
      if (config.isFactory) {
        this.fn = func(...options)
      } else {
        this.fn = func
      }
    }

    run (input: any) {
      if (config.spreadInput) {
        return this.fn(...input)
      }
      return this.fn(input)
    }
  }

  return CustomTask
}