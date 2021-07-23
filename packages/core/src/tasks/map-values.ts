import { Task } from '../base/task'

import async from 'async'

interface MapValuesOptions {
  workflow?: any
}

export class MapValues extends Task {
  name: string = 'mapvalues'
  
  wrappedWorkflow: any
  tasks: Object

  // Take tasks and wrap them in workflows, storing the workflow task fn for each key
  workflows: Object

  constructor (tasks: Object, options: MapValuesOptions = {}) {
    super()
    this.tasks = tasks
    this.wrappedWorkflow = options.workflow
  }

  public async setup () {
    if (!this.workflows) {
      this.workflows = await async.mapValues(this.tasks, async (value, key, cb) => {
        const workflowInstance = this.wrappedWorkflow(value)
        await workflowInstance.setup()
        cb(null, workflowInstance.fn.bind(workflowInstance))
      })

      // We no longer need the tasks
      this.tasks = {}
    }
  }

  public async fn (input) {
    await this.setup()
    return async.mapValues(this.workflows, async (workflowFn, key, cb) => {
      cb(null, await workflowFn(input))
    })
  }
}