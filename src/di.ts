import isPromise from 'p-is-promise'

import { Engine as EngineBase } from './engine'
import metadata from './util/metadata'
import { createContainer, asClass, asValue, asFunction, AwilixContainer, Lifetime} from 'awilix'
import _ from 'lodash'
import { Task } from './base/task'
import { Service } from './base/service'

import { Cache } from './services/caches/local-fs'
import { Emitter } from './services/emitters/events'
import { Queue } from './services/queues/p-queue'
import { parseDependencies } from './util/parameters'
import { Workflow } from './workflow'

const rootContainer: AwilixContainer = createContainer()

function createTaskFactory( cls:any ) {
  return function taskFactory (input:any) {
    return new cls(input)
  }
} 

function createInjectedTaskFactory( cls:any, scope: any) {
  return function injectableTaskFactory (kwargs: any) {
    // kwargs could be assumed to be config/options
    // unless there is a variable called config/options
    // console.log(cls, parseDependencies(cls))
    return asClass(cls).inject(() => kwargs).resolve(scope, {
      allowUnregistered: true // this option was added in my fork of awilix
    })
  }
}

// const defaultServices = {
//   cache: () => new Cache({
//     config: {
//       path: './cache'
//     }
//   })
// }

interface EngineInput {
  [key: string]: any
}

export class Engine extends EngineBase {
  scope: any

  constructor({ scope, workflow, ...deps }) {
    super({ workflow })
    this.scope = scope
    this.registerDependencies(deps)
  }

  public async build (script: any): Promise<Function> {
    // From awilix readme:
    //  Builds an instance of a class (or a function) by injecting dependencies
    //  but without registering it in the container.
    // Allow script to take advantage of DI (could have a config option on this)
    const functionsAndTasks = this.scope.build(script)
    return super.build(functionsAndTasks)
  }

  registerDependencies(deps: EngineInput) {
    const diDeps  = _.mapValues(deps, (obj:any) => {
      if ( obj.prototype instanceof Service ) {
        // A service class
        // TODO support this, but handle this correctly
        return asClass(obj)
      } else if ( obj instanceof Service ) {
        // An instance of a service
        return asValue(obj)
      } else if ( obj.prototype instanceof Task && obj.inject === true) {
        // A task class with a static variable 'inject' set to true
        return asValue(createInjectedTaskFactory(obj, this.scope))
      } else if ( obj.prototype instanceof Task && !obj.inject) {
        // A task class with a static variable 'inject' set to false, undefined, etc.
        return asValue(createTaskFactory(obj))
      } else if ( obj instanceof Task ) {
        console.log('Registering configured task')
        return asValue(obj)
      } else if ( isPromise(obj) ) {
        console.log('Registering promise')
        return asValue(obj)
      } else if ( _.isFunction(obj) ) {
        console.log('Registering function')
        return asValue(obj)
      } else {
        console.error('Trying to register an inappropritely typed service or task')
      }
    })
    this.scope.register(diDeps)
  }

  static inject (input: EngineInput) {
    return {
      into: async function (fn: Function): Promise<any> {
        const scope = rootContainer.createScope()
        scope.register({
          workflow: asClass(Workflow),
          scope: asValue(scope)
        })

        // The second argument to Reflect.construct must be array-like
        // const engine = asClass(Engine).resolve(scope) 
        const engine: Engine = asClass(Engine).inject(
          () => (input)
        ).resolve(scope)

        const result = await engine.run(fn)
        await engine.close()
        return result
      }
    }
  }
}