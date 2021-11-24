import { Task, Workflow, Workflowable } from '../internal'
export interface DoWhileConfig {
  Workflow?: any
  Wrapper?: any
  wrapperConfig?: any
}

export class DoWhile extends Task {
  name = 'dowhile'

  doWorkflow: Workflow
  whileWorkflow: Workflow

  constructor(tasks: Workflowable, whilst: Workflowable, config: DoWhileConfig = {}) {
    super(tasks, whilst, config)
    this.doWorkflow = this.workflowify(tasks, config)
    this.whileWorkflow = this.workflowify(whilst, config)
  }

  async run (input: any) {
    let result = input
    do {
      result = await this.doWorkflow.run(result)
    } while(await this.whileWorkflow.run(result))
    return result
  }
}