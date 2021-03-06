import functionName from '../util/function-name'
import { Workflow } from '../internal' // ./base/task/workflow

import _ from 'lodash'

interface MakeTaskConfig {
  name?: string
  spreadInput?: boolean
  isFactory?: boolean
}

interface TaskMetadata {
  args?: any
  name?: string
  parent?: any
  level?: number
}

export abstract class Task {
  unitverse: TaskMetadata

  public static events() {

  }

  public static dependencies() {

  }

  constructor(...args: any) {
  
    this.unitverse = {
      args,
      name: 'DefaultTaskName'
      // name: _.get(args, `[${args.length - 1}].name`) || this.constructor ? functionName(this.constructor) : 'madeFunction'
    }
    const Klass = Object.getPrototypeOf(this)

    if (Klass.constructor?.dependencies) {
      for (const dependencyName in Klass.constructor.dependencies()) {
        if (!_.get(args, `[${args.length - 1}].${dependencyName}`)) {
          console.error(`${this.unitverse.name} requires ${dependencyName}`)
        }
      }
    }
    // console.log(this.constructor.prototype.dependencies())
  }

  public workflowify(fn: any, config) {
    return new Workflow(fn, {}, {
      scope: this.unitverse.parent.scope
    })
  }

  public setParentWorkflow(workflow) {
    this.unitverse.parent = workflow
    this.unitverse.level = _.get(this.unitverse, 'parent.level', 1) + 1
  }

  abstract run(input?: any): any | Promise<any>

  async close() {
    return true
  }

  static fromFunction(func: Function, config?: MakeTaskConfig) {
    config = {
      ... {
        name: 'MadeTask',
        spreadInput: false,
        isFactory: true
      },
      ... {
        name: functionName(func)
      },
      ...config
    }
    class CustomTask extends Task {
      fn: Function

      constructor(...options: any) {
        super(func, config, options)
        this.unitverse.name = config.name
      }

      run(input: any) {
        let funcToRun = func
        // if (config.isFactory) {
        //   funcToRun = func()
        // }
        if (config.spreadInput) {
          return funcToRun(...input)
        }
        return funcToRun(input)
      }
    }
    return new CustomTask()
  }
}