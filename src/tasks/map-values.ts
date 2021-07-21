import { Task } from '../base/task'

import _ from 'lodash'
import async from 'async'

interface MapValuesOptions {
  workflow?: any
}

export class MapValues extends Task {
  name: string = 'mapvalues'
  workflows: any

  constructor (tasks, options: MapValuesOptions = {}) {
    super()
    const workflow = options.workflow
    this.workflows = _.mapValues(tasks, (value, key) => {
      const workflowInstance = workflow()
      if (!_.isArray(value)) {
        value = [value]
      }
      _.each(value, (fn) => {
        workflowInstance.add(fn)
      })
      return workflowInstance
    })
  }

  public async fn (input) {
    const result = await async.mapValues(this.workflows, async (workflow, key, cb) => {
      const createdWorkflow = workflow.fn()
      cb(null, await createdWorkflow(input))
    })
    return result
  }
}