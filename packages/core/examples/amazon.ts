import { Engine} from '../src/engine'

import { Wrapper } from '../src/tasks/wrapper'
import { Get } from '../src/tasks/get'
import { Log } from '../src/tasks/log'


import { DoWhile } from '../src/tasks/do-while'
import { Identity } from '../src/tasks/identity'

(async () => {
  const engine = new Engine ()
  engine.register({
    Identity,
    Get,
    Log,
    Wrapper: [Wrapper, { logTiming: true }] // defaults happen to magically, this should be { config { logTiming: true }} or [null, {logTiming: true}]
  })
  engine.inject(({ Get, Log, Workflow }) => {
    return [
      new Get('a'),
      new Log('Result is'),
      new Log()
    ]
  })
  engine.run({ a: 1 })
})()