import functionName from '../util/function-name'
import { Workflow } from '../internal' // ./base/task/workflow

import _ from 'lodash'
interface TaskMetadata {
  args?: any
  name?: string
  parent?:any
  level?: number
}

export abstract class Task {
  unitverse: TaskMetadata
  
  constructor(...args: any) {
    this.unitverse = {
      args,
      name: _.get(args, `[${args.length-1}].name`) || functionName(this.constructor)
    }
  }

  public workflowify (fn: any, config) {
    return new Workflow(fn, {}, {
      scope: this.unitverse.parent.scope
    })
  }

  public setParentWorkflow(workflow) {
    this.unitverse.parent = workflow
    this.unitverse.level = _.get(this.unitverse, 'parent.level', 1) + 1
  }

  abstract run(input?: any): any | Promise<any>

  async close () {
    return true
  }
}