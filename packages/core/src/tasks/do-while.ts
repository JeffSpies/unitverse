import { Task } from '../base/task'

export interface DoWhileOptions {
  workflow?: any
}

export class DoWhile extends Task{
  workflowWrapper
  undertake
  whilst

  constructor(undertake, whilst, options: DoWhileOptions = {}) {
    super()

    this.workflowWrapper = options.workflow
    this.undertake = undertake
    this.whilst = whilst
  }

  async setup () {
    // await Promise.all([this.undertake.setup(), await this.whilst.setup()])
  }

  async fn (input: any) {
    // await this.setup()
    return (async (undertakeTasks, whilstTasks) => {
      let result = input
      let whilstWorkflowTask 
      do {
        const undertakeWorkflowTask = this.workflowWrapper(undertakeTasks)
        result = await undertakeWorkflowTask.fn(result)
        whilstWorkflowTask = this.workflowWrapper(whilstTasks)
      } while(await whilstWorkflowTask.fn(result))

      return result
    })(this.undertake, this.whilst)
  }
}