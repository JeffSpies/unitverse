import isPromise from "p-is-promise";
import { Workflow } from "./workflow";

export class DebugWorkflow extends Workflow {
  constructor () {
    super()
  }

  push (fn: Function | Promise<any>) {
    this.functions.push(
      this.wrap(fn, this.functions.length)
    )
  }

  wrap(fn, index) {
    console.log('name', fn.name)
    return async (...args) => {
      let output = fn(...args)
      if( isPromise(output) ) {
        output = await output
      }
      return output
    }
  }
}