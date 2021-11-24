import _ from 'lodash'
import { Container } from './util/di/'
import { Service, Task, Workflow } from './internal'

export class Engine {
  scope: any
  workflow: any

  constructor(dependencies: Object, fn: Function) {
    this.scope = new Container()
    this.register(dependencies)
    this.inject(fn)
  }

  private registerValue(name: string, obj: any) {
    this.scope.registerValue(name, obj, {
      resolve: 'identity',
      inject: false,
      isLazy: false
    })
  }

  private registerTask(name: string, cls: any, defaults?) {
    this.scope.registerClass(_.upperFirst(name), cls, defaults, {
      resolve: 'identity',
      inject: true,
      isLazy: false,
    })
    this.scope.registerClass(_.lowerFirst(name), cls, defaults, {
      resolve: 'instance',
      inject: true,
      isLazy: true,
    })
    // console.log(this.scope.registry)
  }

  private registerService(name: string, cls: any, defaults?) {
    this.scope.registerClass(_.upperFirst(name), cls, defaults, {
      resolve: 'identity',
      inject: true,
      isLazy: true,
    })
  }
  
  public register(dependencies: Object): Engine {
    let obj: any,
        args: any
    
    for(const [name, value] of Object.entries(dependencies)) {
      obj = value
      args = {}
      if (_.isArray(obj)) {
        [obj, args] = obj
      }

      if ( obj.prototype instanceof Service ) {
        this.registerService(name, obj, args)
      } else if (obj.prototype instanceof Task) {
        this.registerTask(name, obj, args)
      } else {
        this.registerValue(name, obj)
      }
    }

    if (!this.scope.contains('Workflow')) {
      this.registerTask('workflow', Workflow)
    }

    return this;
  }

  public inject(fn: Function): Engine {
    const injectedFunction = this.scope.asFunction(fn)
    const WorkflowClass = this.scope.resolve('Workflow')
    const tasks = injectedFunction()
    this.workflow = new WorkflowClass(tasks, { name: 'EngineWorkflow' }) 
    return this;
  }

  run(input: any): any {
    return this.workflow.run(input)
  }
}
