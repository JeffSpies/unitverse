// import { Workflow, WorkflowConfig } from "../tasks/workflow"

import functionName from '../util/function-name'
import _ from 'lodash'
import { Workflow, Workflowable } from '../internal' // ./base/task/workflow

interface TaskMetadata {
  args?: any
  name?: string
  parentWorkflow?
  level?: number
}

export abstract class Task {
  unitverse: TaskMetadata
  
  constructor(...args: any) {
    this.unitverse = {}
    this.unitverse.args = args
    this.unitverse.name = 
      _.get(args, `[${args.length-1}].name`) || 
      functionName(this.constructor)
  }

  public workflowify (obj: Workflowable, config) {
    // const workflowCls = this.unitverse.parentWorkflow['prototype']
    console.log(this.unitverse)
    // When calling this from a task, we can't get the task's workflow, because it hasn't been set yet
    const workflowCls = config.Workflow || this.unitverse.parentWorkflow.__class__

    let taskList
    if (obj instanceof Workflow) {
      // todo Change the wrapper if config differs than what is provided?
      return obj
    } else if (obj instanceof Task ) {
      taskList = [obj]
    } else if (_.isArray(obj)) {
      taskList = obj
    } else {
      throw new Error('That type is not currently workflowable')
    }
    // todo build workflowConfig if direct parameters are not provided

    return new workflowCls(taskList, config.workflowConfig)
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