import { Task, Workflow } from '../internal'
export interface DoWhileConfig {
}

export class DoWhile extends Task {
  name = 'dowhile'

  doWorkflow: Workflow
  whileWorkflow: Workflow

  constructor(tasks: Function, whilst: Function, options: any = {}) {
    super(tasks, whilst)
    console.log('# Constructing do-while')
    const { workflow } = options
    const workflowInstance = workflow
    console.log('# Workflow Instance')
    this.doWorkflow = workflowInstance.newWorkflow(tasks)
    this.whileWorkflow = workflowInstance.newWorkflow(whilst)
  }

  async run (input: any) {
    let result = input
    do {
      result = await this.doWorkflow.run(result)
    } while(await this.whileWorkflow.run(result))
    return result
  }
}