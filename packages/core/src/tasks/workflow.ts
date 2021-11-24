import _, { isObject } from 'lodash'
import isPromise from 'p-is-promise'
import async from 'async'

import metadata from '../util/metadata'

import { makeTask, Task } from '../internal'
import functionName from '../util/function-name'

type TaskLike = Task | Workflow | Function
type TaskLikeList = (TaskLike)[]
export type Workflowable = TaskLike | TaskLikeList

export interface WorkflowConfig {
  Wrapper?: any
  WrapperConfig?: any
  name?: string
}
export class Workflow extends Task {
  tasks: any = []

  wrapperClass: any
  wrapperConfig: any

  options

  constructor (tasks: any = [], options: WorkflowConfig = {}){
    super(tasks, options);
    this.setParentWorkflow(this);

    // The following are likely coming from Engine's DI
    const { Wrapper, WrapperConfig, name } = options;
    console.log(Wrapper)

    this.wrapperClass = Wrapper;
    this.wrapperConfig = WrapperConfig || {};

    this.add(tasks);
    
    if (this.wrapperClass) {
      return new this.wrapperClass(this, this.wrapperConfig);
    }
  }

  private add ( tasks: Workflowable): boolean {
    if (!_.isArray(tasks)) {
      tasks = [ tasks ]
    }
    return this.addArray(tasks)
  }

  private addArray (tasks: Workflowable[]): boolean {
    const results = []
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (task instanceof Task) {
        results.push(this.addTask(task))
      } else if (_.isFunction(task)) {
        const NewTaskClass = makeTask(
          function Tmp () {
            return task
          }
        )
        results.push(
          this.addTask(new NewTaskClass())
        )
      } else {
        throw new Error('That type is not currently supported')
      }
    }
    return _.every(results)
  }

  private addTask (task: Task): boolean {
    task.setParentWorkflow(this)
    this.wrapAndPushTask(task)
    return true
  }

  private wrapAndPushTask (task: Task): void {
    this.tasks.push(
      new this.wrapperClass(task, this.wrapperConfig)
    )
  }

  public async run (input: any): Promise<Function> {
    let result: any = input
    for ( let i = 0; i < this.tasks.length; i++ ) {
      result = await this.tasks[i].run(result)
    }
    return result
  }
}