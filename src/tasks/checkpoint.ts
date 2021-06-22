import { Task } from '../base/task'
import { Observer } from '../observer'

import _ from 'lodash'
import { Workflow } from './workflow'
import { AbstractCache } from '../base/services/cache'

const defaultNameFunction = (prefix: string, name: string) => `${prefix}_${name}`

export interface CheckpointOptions {
  cache: AbstractCache
  name: string
  nameFunction?: Function
}

export class Checkpoint extends Task{
  cache: AbstractCache
  baseName: string
  nameFunction: Function
  result: any = undefined
  
  events: {
  }

  static inject: boolean = true

  constructor(opt: CheckpointOptions) {
    super()
    this.cache = opt.cache
    this.baseName = opt.name
    this.nameFunction = opt.nameFunction || defaultNameFunction
  }

  async isCached() {
    if(this.result !== undefined)
      return true
    
    try {
      this.result = await this.cache.get(this.baseName)
      return true
    } catch (error) {
      return false
    }
  }

  cachedTask() {
    return this.result
  }

  async uncachedTask(input) {
    input = input instanceof Observer ? input.output : input
    await this.cache.set(this.baseName, input)
    return input
  }

  async fn (input: any) {
    this.name = this.nameFunction(this.baseName, input)
    if(await this.isCached()) {
      return this.cachedTask()
    }
    return this.uncachedTask(input)
  }

  async forWorkflow(workflow: Workflow): Promise<Function> {
    if (await this.isCached()) {
      workflow.clear()
    }
    return super.forWorkflow(workflow)
  }
}