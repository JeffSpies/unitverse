import { Task } from '../base/task'
import { AbstractEmitter } from '../base/emitter'

import _ from 'lodash'

interface WrapperConfig {
  emitter?: AbstractEmitter
  logInput?: boolean
  logOutput?: boolean
  logTiming?: boolean
}

const WrapperDefaults = {
  logInput: false,
  logOutput: false,
  logTiming: false
}

export class Wrapper extends Task {
  task: any
  config: WrapperConfig

  constructor (task: Task, config?: WrapperConfig) {
    super(task, config)
    this.unitverse = task.unitverse
    this.task = task
    this.config = {
      ...WrapperDefaults,
      ...config
    }
  }
 
  public async run (input: any) {
    const parentName = _.get(this.unitverse, 'parentWorkflow.unitverse.name')
    const taskName = this.unitverse.name

    let time
    if (this.config.logTiming) time = process.hrtime()
    if (this.config.logInput) console.log(`${_.times(this.unitverse.level, (n) => '\t')}${parentName}\t${taskName}`, 'input', `${input}`.substring(0, 10))

    const result = await this.task.run(input)
    
    if (this.config.logTiming) {
      const diff = process.hrtime(time)
      console.log(`${taskName} took ${(diff[0] * 1e9 + diff[1]) * 1e-6} ms`)
    }

    if (this.config.logOutput) console.log(`${parentName}\t${taskName}`, `${JSON.stringify(result)}`.substring(0, 200))

    return result
  }
}