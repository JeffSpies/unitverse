import {Observer} from './observer'
import { Task } from './base/task'
import { IRunContext } from './base/runContext'
import _ from 'lodash'

export class Planner {
  // Lifecycle
  //  prepareRunContext
  //  createRun
  //  modifyRun

  context: IRunContext = {
    tasks: []
  }
  isPreplanned: boolean = false
  isPlanned: boolean = false
  isPostplanned: boolean = false

  taskObjects: Task[] = []
  runList: any[] = []

  constructor(tasks: (Function | Task | Observer)[]) {
    this.context.tasks = tasks
  }

  async preplan () {
    if (this.isPreplanned) return
    
    this.context.taskListIndex = this.context.tasks.length-1

    for(
      this.context.taskListIndex;
      this.context.taskListIndex >= 0;
      this.context.taskListIndex--
    ) {
      const task = this.context.tasks[this.context.taskListIndex]
      if (task instanceof Task) {
        this.taskObjects.push(task)
        let preplanResult = await task.onPreplan(this.context)
        if(!preplanResult) {
          break // TODO handle non-promises
        }
      }
    }

    this.isPreplanned = true
  }

  async plan() { 
    if (!this.isPreplanned) await this.preplan()
    if (this.isPlanned) {
      if (!this.isPostplanned) await this.postplan() 
      return this.runList 
    }

    const tasks = this.context.tasks

    let observer: Observer = this.createNewObserver()

    this.context.taskListIndex = this.context.taskListIndex < 0 
      ? 0
      : this.context.taskListIndex

    for(
      this.context.taskListIndex;
      this.context.taskListIndex < tasks.length;
      this.context.taskListIndex++
    ) {
      const task = tasks[this.context.taskListIndex]
      observer = observer || this.createNewObserver()
      observer.add(task)
    }
    this.isPlanned = true
    return this.runList
  }

  async postplan() {

  }

  createNewObserver(tasks?: any | any[]): Observer {
    const o = new Observer(tasks)
    this.runList.push(function observer (input: any) {
      return o.run(input, {
        debug: false
      })
    })
    return o
  }
}