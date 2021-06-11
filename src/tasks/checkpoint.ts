import { Task } from '../base/task'
import { Observer } from '../observer'

import _ from 'lodash'
import { Workflow } from '../workflow'

interface CheckpointConfig {
  cacheClass: any
  cacheOptions?: any
  nameFunction?: any
  [key: string]: any
}

export class Checkpoint extends Task{
  cacheInstance: any
  result: any = undefined
  config: CheckpointConfig
  baseName: string
  events: {
  }

  static inject: boolean = true
  
  constructor({
    cache,
    config
  }) {
    super()
    this.cacheInstance = cache
    this.baseName = config.name

    const defaults = {
      nameFunction: (prefix, name) => `${prefix}_${name}`
    }

    this.config = !config ? defaults : _.defaultsDeep(config, defaults)
  }

  async isCached() {
    if(this.result !== undefined)
      return true
    
    try {
      this.result = await this.cacheInstance.get(this.baseName)
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
    await this.cacheInstance.set(this.baseName, input)
    return input
  }

  async fn (input: any) {
    this.name = this.config.nameFunction(this.baseName, input)
    if(await this.isCached()) {
      return this.cachedTask()
    }
    return this.uncachedTask(input)
  }

  async forWorkflow(workflow: Workflow): Promise<Function> {
    if (await this.isCached()) {
      workflow.clear()
    }
    return this.fn.bind(this)
  }
}