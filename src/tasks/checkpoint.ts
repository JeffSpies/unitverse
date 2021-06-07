import { Task } from '../base/task'
import { IRunContext } from '../base/runContext'
import { Observer } from '../observer'

import _ from 'lodash'

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
  
  constructor({
    cache,
    name,
    config
  }) {
    super(name, config)
    
    this.baseName = name

    const defaults = {
      cacheOptions: {},
      nameFunction: undefined
    }
    this.config = !config ? defaults : _.defaultsDeep(config, defaults)
    
    this.cacheInstance = cache(
      'checkpoints', 
      this.config.cacheOptions
    )
  }

  async isCached() {
    if(this.result !== undefined)
      return true
    
    try {
      this.result = await this.cacheInstance.get(this.name)
      return true
    } catch (error) {
      // Check error type
      return false
    }
  }

  cachedTask() {
    return this.result
  }

  async uncachedTask(input) {
    input = input instanceof Observer ? input.output : input
    await this.cacheInstance.set(this.name, input)
    return input
  }

  async fn (input: any) {
    if (_.has(this.config, 'nameFunction')) {
      this.name = this.config.nameFunction(
        this.baseName,
        input
      )
    }

    if(await this.isCached()) {
      return this.cachedTask()
    }
    return this.uncachedTask(input)
  }

  async forWorkflow(workflow) {
    if (await this.isCached()) {
      workflow.clear()
    }
    return this.fn.bind(this)
  }

  async onPreplan(context: IRunContext) {
    if (await this.isCached()) {
      return false
    }
    return true
  }
}