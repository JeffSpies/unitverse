import { createEngine } from './src/di'
import { Log } from './src/tasks/log'
import { chain, _ } from './src/units/lodash'

// Task classes could take *args, config?, defaultConfig?
// defaultConfig could be injected "per module" when added to
// the engine

(async () => {
  const engine = createEngine({
    // TODO are these services, rather than tasks?
    log: Log
  })
  // The items registered in the engine above will be injected into the function passed to run
  const result = await engine.run(({ log }) => [
    log('starting'),
    x => [1,2,3],
    new Log()
  ])
})()
