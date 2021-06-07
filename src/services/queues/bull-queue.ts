import Bull from 'bull'
import _ from 'lodash'

export interface Job {
  input: any
}

export interface JobResult {
  result: any
}

interface CacheConfig {
  name: string
  inputType?: string
}

export interface QueueConfig {
  name?: string,
  redis?: string | object,
  max?: number,
  duration?: number,
  cache?: string | CacheConfig
}

export class Queue  {
  queue: any
  isDrained: boolean
  isCloseCalled: any
  name: string

  constructor(
    config?: QueueConfig
  ){    
    const defaults = {
      redis: 'redis://localhost:6379'
    } 
    config = config === undefined ?
      defaults : _.defaultsDeep(config, defaults)
    this.name = config.name
    this.queue = new Bull(this.name, config)
    this.queue.on('error', (error) => console.error('queue error', error))
    this.queue.on('failed', (job, error) => console.error('failed', job, error))
    this.queue.on('drained', async () => {
      this.isDrained = true
      // TODO config option: close on drain
    })
  }

  async clear (): Promise<void> {
    await this.queue.clean(0)
    await this.queue.clean(0, 'completed')
    await this.queue.clean(0, 'active')
    await this.queue.clean(0, 'delayed')
    await this.queue.clean(0, 'failed')
    await this.queue.empty()
  }

  process(fn: Function): void {
    this.queue.process(
      async function jobFn (job: {data: Job}) {
        return {
          result: await fn(job.data.input)
        }
      }
    )
  }
  
  onCompleted(fn: Function) {
    this.queue.on('completed', (jobOutput) => fn(jobOutput.returnvalue.result))
  }

  add(input) {
    this.isDrained = false
    return this.queue.add({
      input
    })
  }

  close(): boolean {
    this.isCloseCalled = true
    return this.queue.close()
  }
}