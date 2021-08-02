// import { Workflow, WorkflowConfig } from "../tasks/workflow"

import functionName from '../util/function-name'
import _ from 'lodash'

interface TaskMetadata {
  args?: any
  name?: string
  parentWorkflow?
  level?: number
}

export abstract class Task {
  unitverse: TaskMetadata
  
  static inject: boolean = false

  constructor(...args: any) {
    this.unitverse = {}
    this.unitverse.args = args
    this.unitverse.name = 
      _.get(args, `[${args.length-1}].name`) || 
      functionName(this.constructor)
  }

  public workflowify (obj: Task | Task[] | any, config) {
    const workflowCls = this.unitverse.parentWorkflow['prototype']

    let taskList
    if (obj instanceof workflowCls) {
      // todo Change the wrapper if config differs than what is provided?
      return obj
    } else if (obj instanceof Task) {
      taskList = [taskList]
    } else if (_.isArray(obj)) {
      taskList = obj
    }
    // todo build workflowConfig if direct parameters are not provided
    return new config.Workflow(taskList, config.workflowConfig)
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