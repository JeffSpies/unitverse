import functionName from '../util/function-name'
import { Workflow } from '../internal' // ./base/task/workflow

import _ from 'lodash'
interface TaskMetadata {
  args?: any
  name?: string
  parentWorkflow?
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
    console.log('here')
    // const workflowCls = this.unitverse.parentWorkflow['prototype']
    // When calling this from a task, we can't get the task's workflow, because it hasn't been set yet
    console.log(this.unitverse)
    return new Workflow(fn, {}, {
      scope: this.unitverse.parentWorkflow.scope
    })
  }

  public setParentWorkflow(workflow) {
    this.unitverse.parentWorkflow = workflow
    this.unitverse.level = _.get(this.unitverse, 'parentWorkflow.level', 1) + 1
  }

  abstract run(input?: any): any | Promise<any>

  async close () {
    return true
  }
}