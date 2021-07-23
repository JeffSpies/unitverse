import { Task } from "../base/task";

export class Persist extends Task {
  x
  y
  constructor(x) {
    super()
    console.log('instantiated')
    this.y = x
  }

  set(x) {
    if (this.x === undefined) {
      this.x = x
    }
  }

  async forWorkflow(workflow, input) {
    this.set(input)
    return super.forWorkflow(workflow, input)
  }

  async fn(i) {
    console.log(`Class property is ${this.x}`)
    return i
  }
}