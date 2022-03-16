import _ from 'lodash'
import { Container } from '@unitverse/di'
import { Service, Task } from '../internal'

export class Workflow extends Task {
  scope: any
  tasks: any = []

  wrapperClass: any
  wrapperConfig: any

  constructor(fn: Function, dependencies: Object, options: any = {}) {
    super(fn, dependencies, options)

    this.scope = options.scope || new Container() // TODO add parent scope in mddle

    // If a workflow hasn't been injected
    if (!this.scope.resolve(this.unitverse.name)) {
      // Then register a workflow
      this.register({
        Workflow,
        ...dependencies
      })
      // Replace the lower case w "workflow" instance
      this.scope.registerValue('workflow', this)
      // And create a new Object
      return this.newWorkflow(fn, {}, options)
    }

    // Inject the following tasks
    const { Wrapper, WrapperConfig } = options;
    this.wrapperClass = Wrapper;
    this.wrapperConfig = WrapperConfig || {};
    this.inject(fn)
  }

  public register(dependencies: Object): void {
    let obj: any,
      args: any

    for (const [name, value] of Object.entries(dependencies)) {
      obj = value
      args = {}
      if (_.isArray(obj)) {
        [obj, args] = obj
      }

      if (obj.prototype instanceof Service) {
        this.scope.registerClass(_.upperFirst(name), obj, args, {
          resolve: 'identity',
          inject: true,
          isLazy: false,
        })
        this.scope.registerClass(_.lowerFirst(name), obj, args, {
          resolve: 'instance',
          inject: true,
          isLazy: false,
        })
      } else if (obj.prototype instanceof Task) {
        this.scope.registerClass(_.upperFirst(name), obj, args, {
          resolve: 'identity',
          inject: true,
          isLazy: false,
        })
        // this.scope.registerClass(_.lowerFirst(name), obj, args, {
        //   resolve: 'instance',
        //   inject: true,
        //   isLazy: true,
        // })
      } else {
        this.scope.registerValue(name, obj)
      }
    }
  }

  public newWorkflow(fn: any, dependencies = {}, options = {}) {
    // Here we're using the resolved workflow
    // todo here's the problem
    const resolvedWorkflowClass = this.scope.resolve(this.unitverse.name)
    return new resolvedWorkflowClass(fn, dependencies, {
      ...options,
      scope: this.scope
    })
  }

  private addTask(task: Task): boolean {
    task.setParentWorkflow(this)
    this.tasks.push(
      new this.wrapperClass(task, this.wrapperConfig)
    )
    return true
  }

  public inject(fn: Function): void {
    const injectedFunction = this.scope.asFunction(fn)
    // todo have to always inject into function?
    const tasks = injectedFunction()
    const results = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (task instanceof Task) {
        results.push(
          this.addTask(task)
        )
      } else if (_.isFunction(task)) {
        const obj = Task.fromFunction(
          function Tmp() {
            return task
          },
          {
            name: task.name || 'task'
          }
        )
        results.push(
          this.addTask(obj)
        )
      } else {
        throw new Error('That type is not currently supported')
      }
    }

    if (!_.every(results)) {
      throw new Error('Task didnt push')
    }
  }

  public async run(input: any): Promise<any> {
    let result: any = input
    for (let i = 0; i < this.tasks.length; i++) {
      result = await this.tasks[i].run(result)
    }
    return result
  }
}
