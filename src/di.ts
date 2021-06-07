import { Engine } from './engine'
import metadata from './util/metadata'
import { createContainer, asClass, asValue, asFunction, AwilixContainer, Lifetime} from 'awilix'
import _ from 'lodash'
import { Task } from './base/task'

const rootContainer: AwilixContainer = createContainer()

function wrapTask( cls:any ) {
  return (input:any) => {
    const instance = new cls(input)
    return instance
  }
}

export function createEngine (tasks: object = {}): Engine {
  const scope = rootContainer.createScope()
  
  // TODO complain about names that are too generic like "conifg", "defaultConfig", "unitverse"
  const userProvidedTasks = _.mapValues(tasks, (task:any) => {
    if ( task.prototype instanceof Task ) {
      // We've received a class of superclass Task
      // Task has a method called "fn" on it that eventually needs to be called
      // But Tasks may be constructed first with some input
      // e.g., sendEmail('example@example.com') might be a function that takes
      // input that would go into the body of the message; the email address is
      // being added to the object as configuration
      // So we're going to turn these classes into functions that return
      // constructed, instantiated objects that the Planner will look for
      // fn methods on.
      const wrappedTask = wrapTask(task)
      // To differentiate an unconstructed function (e.g., sendEmail) that would
      // otherwise have resulted in an object with a fn method, we add some metadata
      // for the Planner.
      metadata.set(wrappedTask, 'wrappedConstructor', true)
      // We wrap the function that has metadata on it for awilix to inject as dependencies
      return asValue(wrappedTask)
    }
    return asFunction(task)
  })
  scope.register(userProvidedTasks)

  // TODO I might create a value called unitverse, resolve engine, then add it to the unitverse object (i.e., namespace with log, etc.)
  scope.register({
    scope: asValue(scope),
    engine: asClass(Engine, { lifetime: Lifetime.SCOPED })
  })

  return scope.resolve('engine')
}