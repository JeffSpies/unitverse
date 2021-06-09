import { createEngine } from './src/di'
import { Log } from './src/tasks/log'
import { chain, _ } from './src/units/lodash'
import { Task } from './src/base/task'

class Queue extends Task {
  static inject = true
  cache: any
  config: any

  constructor({ cache, config }) {
    super()
    this.cache = cache
    this.config = config
  }

  fn( input) {
    console.log(this.cache, this.config)
    return input
  }
}

// Task classes could take *args, config?, defaultConfig?
// defaultConfig could be injected "per module" when added to
// the engine

(async () => {
  const engine = createEngine({
    queue: Queue,
    log: Log
  })
  // The items registered in the engine above will be injected into the function passed to run
  const result = await engine.run(({ log, queue}) => {
    return [
      queue({ hello: 'world' }),
      () => 1,
      log(),
      queue({ hello: 'world2' }),
    ]
  })
})()
