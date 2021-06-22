import { Engine} from './src/di'
import { Log } from './src/tasks/log'
import { chain, _ } from './src/units/lodash'
import { Task } from './src/base/task'

import { Cache } from './src/services/caches/local-fs'
import { Checkpoint } from './src/tasks/checkpoint'
import { Wrapper } from './src/tasks/wrapper'

class Queue extends Task {
  static inject = true
  cache: any
  config: any

  constructor({ cache }) {
    super()
    this.cache = cache
    console.log('constructing cache', this.cache)
  }

  fn(input: any[]) {
    console.log('calling cache', this.cache)
    return input
  }
}

(async () => {
  const result = await Engine.inject({
    cache: [ Cache, { path: './dist/' } ],
    checkpoint: Checkpoint,
    queue: Queue,
    log: Log,
    wrapper: [ Wrapper, { shouldLog: false }]
  }).into(({ log, queue, checkpoint }) => {
    return [
      log('jeff'),
      function start () { return 1 },
      queue(),
      (i) => i + 2
    ]
  })
  console.log('Result', result)
})()
