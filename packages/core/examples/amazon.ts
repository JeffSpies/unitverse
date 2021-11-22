import { Engine} from '../src/engine'

import { Wrapper } from '../src/tasks/wrapper'
import { Get } from '../src/tasks/get'
import { Log } from '../src/tasks/log'


// import { DoWhile } from '../src/tasks/do-while'
import { Identity } from '../src/tasks/identity'
import { Task } from '../src/base/task'

import { makeTask } from '../src/helpers/makeTask'


(async () => {
  // const Incrementer = makeTask(
  //   function Incrementer (i) {
  //     return function incrementer (input) {
  //       console.log(i, input)
  //       return input + 1
  //     }
  //   }
  // )

  // const Conditional = makeTask(
  //   function Conditional (i) {
  //     return function conditional (input) {
  //       console.log(i, input)
  //       return input < 5
  //     }
  //   }
  // )

  const engine = new Engine ();
  engine.register({
    Identity,
    Get,
    Log,
    // DoWhile,
    // Incrementer,
    // Conditional,
    Wrapper: [Wrapper, { logTiming: false }]                                                                                                                                                                                                                                                                                                                                                                            // defaults happen too magically, this should be { config { logTiming: true }} or [null, {logTiming: true}]
  });

  engine.inject(({ Get, get, Log, Workflow, DoWhile, Incrementer, Conditional}) => {
    return new Workflow([
      get('a'),
      // new DoWhile([new Incrementer()], [new Conditional()]),
      new Log('Result is'),
      new Log()
    ])
  });

  // engine.run('https://www.amazon.com/gp/product/B07RJ1PFB6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1')
  engine.run({a:1})
})()