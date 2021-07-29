import _ from "lodash";
import pIsPromise from "p-is-promise";
import { Task as AbstractTask} from "../base/task";

export class Task extends AbstractTask {
  runnable: Function | Promise<any>
  constructor(obj) {
    super(obj)
    if (_.isFunction(obj) || pIsPromise(obj)) {
      this.runnable = obj
    } else {
      this.runnable = () => obj
    }
  }
  run (...args: any) {
    return this.runnable(...args)
  }
}