import { Task } from "../base/task";

export class Persist extends Task {
  x
  y
  constructor(x) {
    super()
    this.y = x
  }

  set(x) {
    if (this.x === undefined) {
      this.x = x
    }
  }

  // async forWorkflow(workflow) {
  //   this.set(workflow.input)
  //   return super.forWorkflow(workflow)
  // }

  async run(i) {
    return i
  }
}