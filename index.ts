import { createEngine } from './src/di'
import { Log } from './src/tasks/log'
import { chain, _ } from './src/units/lodash'

// Task classes could take *args, config?, defaultConfig?
// defaultConfig could be injected "per module" when added to
// the engine

(async () => {
  const engine = createEngine({
    log: Log
  })
  await engine.run(({ log }) => {
    return [
      log('starting'),
      () => 9
      // (n:number) => n+1,
      // (n) => [ {'count': n}, {'count': 30}],
      // ({ engine }) => { return (i) => {console.log(engine); return i }},
      // chain()
      //   .map('count')
      //   .value(),
      // _.sum,
      // log(input => `Result: ${input}`),
      // log('done!')
    ]
  })
})()