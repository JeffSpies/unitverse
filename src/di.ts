import isPromise from 'p-is-promise'

import { Engine as EngineBase } from './engine'
import _ from 'lodash'
import { Task } from './base/task'
import { Service } from './base/service'

import { Workflow } from './tasks/workflow'

import {Container} from './util/di/'

function register(scope, name: string, cls, defaults = {}) {
  if ( cls.prototype instanceof Service ) {
    return scope.registerClass(name, cls, defaults, {
      resolve: 'instantiate'
    })
  } else if ( cls.prototype instanceof Task) {
    return scope.registerClass(name, cls, defaults, {
      resolve: 'wrap'
    })
  } else if ( _.isFunction(cls) ) {
    return scope.registerFunction(name, cls, defaults, {
    })
  } else {
    console.error('Trying to register an inappropritely typed service or task')
  }
}

export class Engine extends EngineBase {
  scope: any

  constructor({ scope, workflow }) {
    super({ workflow })
    this.scope = scope
  }

  register(name: string, cls, defaults = {}) {
    return register(this.scope, name, cls, defaults)
  }

  static inject (dependencies) {
    return {
      into: async function (fn: Function): Promise<any> {
        const scope = new Container()
        
        dependencies = {
          workflow: Workflow,
          ...dependencies
        }

        for(const [key, value] of Object.entries(dependencies)) {
          if (_.isArray(value)) {
            const [cls, args, opts ] = value
            register(scope, key, cls, args || {})
          } else {
            register(scope, key, value)
          }
        }

        const engine = scope.asClass(Engine, { scope }, {
          resolve: 'instantiate'
        })

        const injectedFunction = engine.scope.asFunction(fn)
        const fnList = injectedFunction()
        const result = await engine.run(fnList)
        await engine.close()
        return result
      }
    }
  }
}
