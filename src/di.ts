import isPromise from 'p-is-promise'

import { Engine } from './engine'
import metadata from './util/metadata'
import { createContainer, asClass, asValue, asFunction, AwilixContainer, Lifetime} from 'awilix'
import _ from 'lodash'
import { Task } from './base/task'
import { Service } from './base/service'

import { Cache } from './services/caches/local-fs'
import { Emitter } from './services/emitters/events'
import { Queue } from './services/queues/p-queue'

const rootContainer: AwilixContainer = createContainer()

function createTaskFactory( cls:any ) {
  return function taskFactory (input:any) {
    return new cls(input)
  }
}

function createInjectedTaskFactory( cls:any, scope: any) {
  return function injectableTaskFactory (config: any) {
    return asClass(cls).inject(() => ({ config })).resolve(scope)
  }
}

const defaultServices = {
  cache: new Cache({
    path: './cache'
  })
}

export function createEngine (objs: object = {}): Engine {
  objs = _.defaults(objs, defaultServices)
  const scope = rootContainer.createScope()
  // TODO complain about names that are too generic like "conifg", "defaultConfig", "unitverse"
  const userProvidedTasks = _.mapValues(objs, (obj:any) => {
    if ( obj.prototype instanceof Service ) {
      console.log('Registering service')
      return asValue(new obj())
    } else if ( obj instanceof Service ) {
      console.log('Registering configured service')
      return asValue(obj)
    } else if ( obj.prototype instanceof Task && obj.inject === true) {
      return asValue(createInjectedTaskFactory(obj, scope))
    } else if ( obj.prototype instanceof Task && !obj.inject ) {
      console.log('Registering task')
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
  scope.register(userProvidedTasks)
  
  // TODO I might create a value called unitverse, resolve engine, then add it to the unitverse object (i.e., namespace with log, etc.)
  scope.register({
    scope: asValue(scope),
    engine: asClass(Engine, { lifetime: Lifetime.SCOPED })
  })

  return scope.resolve('engine')
}