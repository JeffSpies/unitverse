import { Task } from '../base/task'

export interface DoWhileOptions {
  workflow?: any
}

export class DoWhile extends Task{
  workflowWrapper
  undertakeFn
  whilstFn

  constructor(undertake, whilst, options: DoWhileOptions = {}) {
    super()

    this.workflowWrapper = options.workflow

    this.undertakeFn = undertake
    this.whilstFn = whilst
  }

  async run (input: any) {
    let result = input
    let whilstWorkflowTask 
    do {
      const undertakeTasks = this.undertakeFn
      const undertakeWorkflowTask = this.workflowWrapper(undertakeTasks)
      result = await undertakeWorkflowTask.run(result)
      const whilstTasks = this.whilstFn
      whilstWorkflowTask = this.workflowWrapper(whilstTasks)
    } while(await whilstWorkflowTask.run(result))
    return result
  }
}