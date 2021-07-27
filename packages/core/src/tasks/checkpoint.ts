import { Task } from '../base/task'
import _ from 'lodash'
import { Workflow } from './workflow'
import { AbstractCache } from '../base/services/cache'

const defaultNameFunction = (name: string) => `${name}`

export interface CheckpointConfig {
  key: Task | Function | (Task | Function )[]
  value: Task | Function | (Task | Function )[]
  cache: AbstractCache
  workflow: Workflow
}

export class Checkpoint extends Task{
  cacheService: AbstractCache
  workflowTask: any

  keyTasks: (Task | Function)[]
  valueTasks: (Task | Function)[]

  constructor(config: CheckpointConfig) {
    super()

    const { key, value, cache, workflow } = config

    this.cacheService = cache
    this.workflowTask = workflow

    this.keyTasks = _.isArray(key) ? key : [key]
    this.valueTasks = _.isArray(value) ? value : [value]
  }

  async run (input: any) {
    const keyWorkflow = this.workflowTask(this.keyTasks)
    const key = await keyWorkflow.run(input)

    try {
      return await this.cacheService.get(key)
    } catch (error) {
      const valueWorkflow = this.workflowTask(this.valueTasks)
      const result = await valueWorkflow.run(input)
      await this.cacheService.set(key, result)
      return result
    }
  }
}