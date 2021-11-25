import _ from 'lodash'
import { Container } from './util/di/'
import { makeTask, Service, Task } from './internal'

export class Engine extends Task {
  scope: any
  tasks: any = []

  wrapperClass: any
  wrapperConfig: any

  constructor(fn: Function, dependencies: Object, options: any = {}) {
    super (fn, dependencies, options)

    this.scope = options.scope || this.unitverse?.parentWorkflow?.scope || new Container()

    if(!this.scope.resolve(this.unitverse.name)) {
      this.register({
        Engine,
        ...dependencies
      })

      const resolvedEngineClass = this.scope.resolve('Engine')

      return new resolvedEngineClass(fn, dependencies, {
        ...options,
        scope: this.scope
      })
    }

    const { Wrapper, WrapperConfig, name } = options;

    this.wrapperClass = Wrapper;
    this.wrapperConfig = WrapperConfig || {};

    this.inject(fn)
  }
  
  public register(dependencies: Object): void {
    let obj: any,
        args: any
    
    for(const [name, value] of Object.entries(dependencies)) {
      obj = value
      args = {}
      if (_.isArray(obj)) {
        [obj, args] = obj
      }

      if ( obj.prototype instanceof Service ) {
        this.scope.registerClass(_.upperFirst(name), obj, args, {
          resolve: 'identity',
          inject: true,
          isLazy: true,
        })
      } else if (obj.prototype instanceof Task) {
        this.scope.registerClass(_.upperFirst(name), obj, args, {
          resolve: 'identity',
          inject: true,
          isLazy: false,
        })
        this.scope.registerClass(_.lowerFirst(name), obj, args, {
          resolve: 'instance',
          inject: true,
          isLazy: true,
        })
      } else {
        this.scope.registerValue(name, obj, {
          resolve: 'identity',
          inject: false,
          isLazy: false
        })
      }
    }
  }

  private addTask (task: Task): boolean {
    task.setParentWorkflow(this)
    this.tasks.push(
      new this.wrapperClass(task, this.wrapperConfig)
    )
    return true
  }

  public inject(fn: Function): void {
    const injectedFunction = this.scope.asFunction(fn)
    const tasks = injectedFunction()
    const results = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (task instanceof Task) {
        results.push(
          this.addTask(task)
        )
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

    if (!_.every(results)) {
      throw new Error('Task didnt push')
    }
  }

  public async run(input: any): Promise<any> {
    let result: any = input
    for ( let i = 0; i < this.tasks.length; i++ ) {
      result = await this.tasks[i].run(result)
    }
    return result
  }
}
