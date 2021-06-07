import { Task } from '../base/task'
import { IRunContext } from '../base/runContext'
import { buildEngine } from '../index'
import pEvent from 'p-event'
import {EventEmitter} from 'events'

import _ from 'lodash'
import pWaitFor from 'p-wait-for'

interface QueueConfig {
  engine:any
  queueClass?: any
  queueConfig?: any
  [key: string]: any
}

export class Queue extends Task{
  engineForQueue: any
  fnOrFns: any
  queueInstance: any
  completedEvents: any = []
  completedCount: number = 0
  queueEmitter: EventEmitter = new EventEmitter()
  queueName: string
  config: any
  
  constructor(fnOrFns:any, config:QueueConfig) {
    super(`taskqueue`, config)
    const defaults = {}
    this.config = config === undefined
      ? defaults
      : _.defaults(config, defaults)
    
    this.queueName = this.config.name
    this.queueInstance = new this.config.queueClass({
      name: this.queueName,
      ...this.config.queueConfig
    })

    this.fnOrFns = fnOrFns
  }

  async fn (input: any) {
    if(!_.isArrayLikeObject(input)) {
      input = [input]
    }
    for(let eachInput of input) {
      // Could package up index, input, and output
      this.queueInstance.add(eachInput)
    }

    await pWaitFor(async (): Promise<boolean> => {
      const results = await this.completedEvents
      return results.length === input.length
    }, {
      interval: 200
    })

    return this.completedEvents
  }

  async onPreplan(context: IRunContext) {
    this.queueInstance.process(async input => {
      const engine = buildEngine(this.engine.config)
      const result = await engine.run(this.fnOrFns, input)
      await engine.close()
      return result
    })

    this.queueInstance.onCompleted(
      jobOutput => {
        this.emit('result', jobOutput)
        this.queueEmitter.emit(this.queueName, jobOutput)
      }
    )

    this.completedEvents = pEvent.multiple(
      this.queueEmitter,
      this.queueName,
      {
        resolveImmediately: true,
        count: Infinity
      }
    )
    return true
  }

  async close(): Promise<boolean> {
    return _.every([
        // await this.engineForQueue.close(),
        await this.queueInstance.close()
      ], i => i === true
    )
  }
}