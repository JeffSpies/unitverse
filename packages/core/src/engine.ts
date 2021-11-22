import _ from 'lodash'
import isPromise from 'p-is-promise'

// import { Engine as EngineBase } from './engine'
import { Container } from './util/di/'
import { Service } from './base/service'
import { Task } from './base/task'
import { Workflow } from './tasks/workflow'
import { Wrapper } from './tasks/wrapper'

export class Engine {
  scope: any
  workflow: any

  constructor() {
    this.scope = new Container()
  }

  registerValue(name: string, obj: any) {
    this.scope.registerValue(name, obj, {
      resolve: 'identity',
      inject: false,
      isLazy: false
    })
  }

  registerTask(name: string, cls: any, defaults?) {
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
  }

  registerService(name: string, cls: any, defaults?) {
    this.scope.registerClass(_.upperFirst(name), cls, defaults, {
      resolve: 'identity',
      inject: true,
      isLazy: true,
    })
  }

  register(dependencies: Object) {
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
  }

  inject(fn: Function) {
    const injectedFunction = this.scope.asFunction(fn)
    const tasks = injectedFunction()
    // console.log(tasks instanceof Wrapper, tasks.task instanceof Workflow, tasks.task) // this is effectively returning a workflow; deal with theis next
    if (tasks !instanceof Workflow || (tasks instanceof Wrapper && tasks.task !instanceof Workflow)) {
      // console.log('here')
      const WorkflowClass = this.scope.resolve('Workflow')
      this.workflow = new WorkflowClass(tasks, { name: 'EngineWorkflow' })
    } else {
      this.workflow = tasks
    }
  }

  run(input) {
    return this.workflow.run(input)
  }
}
