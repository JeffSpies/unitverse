import { createEngine, Engine} from './src/di'
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

(async () => {
  const result = await Engine.inject({
    cache: new Cache({
      path: './dist/'
    }),
    checkpoint: Checkpoint,
    queue: Queue,
    log: Log
  }).into(({ log, queue, checkpoint }) => {
    return [
      log('hi'),
      () => 1,
      (i) => i + 2,
      checkpoint({
        // cache: new Cache({
        //   path: './dist/cache'
        // }),
        name: 'joe'
      }),
    ]
  })
  console.log('Result', result)
})()
