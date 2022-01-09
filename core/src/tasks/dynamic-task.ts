import { Task } from "../base/task"
import functionName from "../util/function-name"

interface DynamicTaskConfig {
  name?: string
  spreadInput?: boolean
  isFactory?: boolean
}

export class DynamicTask extends Task {

  config: DynamicTaskConfig
  fn: Function

  constructor(fn: Function, config?: DynamicTaskConfig) {
    super(fn, config)
    
    this.config = {
      name: functionName(fn),
      ...{
        name: 'MadeTask',
        spreadInput: false
      },
      ...config
    }

    this.fn = fn

    this.unitverse.name = config.name
  }
  
  run (input: any) {
    if( this.config.spreadInput ) {
      return this.fn(...input)
    }
    return this.fn(input)
  }
}

