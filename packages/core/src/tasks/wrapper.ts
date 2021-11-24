import { Task } from '../internal'
import _ from 'lodash'

interface WrapperConfig {
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

  constructor (task: Task, config: WrapperConfig = {}) {
    super(task, config)
    this.unitverse = task.unitverse
    this.task = task
    const { logInput, logOutput, logTiming } = config
    this.config = {
      ...WrapperDefaults,
      ...{ logInput, logOutput, logTiming } // Possible values must be written out
    }
  }
 
  public async run (input: any) {
    const parentName = _.get(this.unitverse, 'parentWorkflow.unitverse.name')
    const taskName = this.unitverse.name

    let time
    if (this.config.logTiming) time = process.hrtime()
    const inputString = input !== undefined ? JSON.stringify(input) : 'undefined'
    if (this.config.logInput) console.log(`${_.times(this.unitverse.level, (n) => '\t').join('')}${parentName}\t${taskName}\tinput\t${inputString.substring(0, 20)}`)

    const result = await this.task.run(input)
    
    if (this.config.logTiming) {
      const diff = process.hrtime(time)
      console.log(`${_.times(this.unitverse.level, (n) => '\t').join('')}${parentName}\t${taskName}\t${(diff[0] * 1e9 + diff[1]) * 1e-6} ms`)
    }

    const resultString = result !== undefined ? JSON.stringify(result) : 'undefined'
    if (this.config.logOutput) console.log(`${_.times(this.unitverse.level, (n) => '\t').join('')}${parentName}\t${taskName}\toutput\t${resultString.substring(0, 200)}`)

    return result
  }
}