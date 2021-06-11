import { createEngine } from './src/di'
import { Log } from './src/tasks/log'
import { chain, _ } from './src/units/lodash'
import { Task } from './src/base/task'

import { Cache } from './src/services/caches/local-fs'
import { Checkpoint } from './src/tasks/checkpoint'

class Queue extends Task {
  static inject = true
  cache: any
  config: any

  constructor({ cache, config }) {
    super()
    this.cache = cache
    this.config = config
  }

  fn(input: any[]) {
    return input
  }
}

// Task classes could take *args, config?, defaultConfig?
// defaultConfig could be injected "per module" when added to
// the engine

(async () => {
  const engine = createEngine({
    cache: new Cache({
      config: {
        path: './dist/'
      }
    }),
    checkpoint: Checkpoint,
    queue: Queue,
    log: Log
  })
  // The items registered in the engine above will be injected into the function passed to run
  const result = await engine.run(({ log, queue, checkpoint }) => {
    return [
      log('hi'),
      () => 1,
      (i) => i + 2,
      checkpoint({ 
        config: {
          name: 'jeff' 
        }
      }),
    ]
  })
  console.log('Result', result)
})()
