import _ from 'lodash'
import PQueue from 'p-queue'

interface IPQueueConfig {
  name: string
  concurrency?: number
}

export class Queue  {
  queue: any
  name: string
  onCompleteFunction: Function
  task: Function
  results: any

  constructor(
    config?: IPQueueConfig
  ){    
    const defaults = {
      concurrency: 1
    } 
    config = config === undefined ?
      defaults : _.defaultsDeep(config, defaults)
    this.results = []
    this.name = config.name
    this.queue = new PQueue({
      concurrency: config.concurrency
    })
  }

  clear (): void {
    // TODO not async, but should be?
    this.queue.clear()
  }

  process(fn: Function): void {
    this.task = fn
  }
  
  onCompleted(fn: Function): void {
    this.onCompleteFunction = fn
    // this.queue.on('idle', () => fn(this.results))
  }

  add(input) {
    // TODO consider using addAll, storing the promise, and using that for onCompleted
    this.results.push(undefined)
    const index = this.results.length - 1
    this.queue.add(async () => {
      const result = await this.task(input)
      return this.onCompleteFunction(result)
    })
  }

  close(): boolean {
    this.clear()
    return true
  }
}