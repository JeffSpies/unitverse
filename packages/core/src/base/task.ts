import { Workflow } from "../tasks/workflow"

import functionName from '../util/function-name'
import _ from 'lodash'

interface TaskMetadata {
  args?: any
  name?: string
  parentWorkflow?: Workflow
  level?: number
}

export abstract class Task {
  unitverse: TaskMetadata
  
  static inject: boolean = false

  constructor(...args: any) {
    this.unitverse = {}
    this.unitverse.args = args
    this.unitverse.name = args.name || functionName(this.constructor)
  }

  public setParentWorkflow(workflow: Workflow) {
    this.unitverse.parentWorkflow = workflow
    this.unitverse.level = _.get(this.unitverse, 'parentWorkflow.level', 1) + 1
  }

  abstract run(input?: any): any | Promise<any>

  async close () {
    return true
  }
}