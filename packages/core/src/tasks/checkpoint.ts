import { Task } from '../base/task'
import _ from 'lodash'
import { Workflow } from './workflow'
import { AbstractCache } from '../base/services/cache'

const defaultNameFunction = (name: string) => `${name}`

export interface CheckpointOptions {
  cache: AbstractCache
  name: string | Function
}

export class Checkpoint extends Task{
  cache: AbstractCache

  checkpointName: string | Function
  processedCheckpointName: string
  
  result: any = undefined
  
  events: {
  }

  constructor(opt: CheckpointOptions) {
    super()
    this.cache = opt.cache
    this.checkpointName = opt.name
  }

  async processCheckpointName(input?) {
    if (this.processedCheckpointName) {
    } else if (_.isString(this.checkpointName)) {
      this.processedCheckpointName = <string>this.checkpointName
    } else if (_.isFunction(this.checkpointName)) {
      const checkpointFunction = <Function>this.checkpointName
      this.processedCheckpointName = await checkpointFunction(input)
    } else {
      throw Error (`name was neither a string or a function`)
    }

    return this.processedCheckpointName
  }

  async isCached() {
    // todo add isResultSet to allow for undefined as a result
    if(this.result !== undefined)
      return true
    try {
      this.result = await this.cache.get(this.processedCheckpointName)
      return true
    } catch (error) {
      return false
    }
  }

  cachedTask() {
    return this.result
  }

  async uncachedTask(input) {
    await this.cache.set(this.processedCheckpointName, input)
    return input
  }

  async fn (input: any) {
    if (!this.processedCheckpointName) {
      this.processCheckpointName()
    }
    if(await this.isCached()) {
      return this.cachedTask()
    }
    return this.uncachedTask(input)
  }

  requiresWorkflowInput: boolean = true

  async forWorkflow(workflow: Workflow, workflowInput?): Promise<Function> {
    this.processCheckpointName(workflowInput)
    if (await this.isCached()) {
      workflow.clear()
    }
    return super.forWorkflow(workflow, workflowInput)
  }
}