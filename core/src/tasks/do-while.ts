import { Task, Workflow } from '../internal'
export interface DoWhileConfig {
}

export class DoWhile extends Task {
  name = 'dowhile'

  doWorkflow: Workflow
  whileWorkflow: Workflow

  constructor(tasks: Function, whilst: Function, options: any = {}) {
    super(tasks, whilst)
    const { workflow } = options
    const workflowInstance = workflow
    this.doWorkflow = workflowInstance.newWorkflow(tasks, {}, { name: 'doWhile:do'})
    this.whileWorkflow = workflowInstance.newWorkflow(whilst, {}, { name: 'doWhile:while'})
  }

  async run (input: any) {
    let result = input
    do {
      result = await this.doWorkflow.run(result)
    } while(await this.whileWorkflow.run(result))
    return result
  }
}