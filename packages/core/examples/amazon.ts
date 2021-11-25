import { Workflow } from '../src/internal'

import { Wrapper } from '../src/internal'
import { Get } from '../src/internal'
import { Log } from '../src/internal'


import { DoWhile } from '../src/tasks/do-while'
import { Identity } from '../src/tasks/identity'
import { makeTask } from '../src/helpers/makeTask'

(async () => {
 const Incrementer = makeTask(
    function Incrementer () {
      return function incrementer (input: number) {
        return input + 1
      }
    }
  )

  const Conditional = makeTask(
    function Conditional () {
      return function conditional (input: number) {
        return input < 5
      }
    }
  )
  const result = new Workflow (({ Get, get, Log }) => {
    return [
      get('a'),
      // ToDO The following gets called, and then added to the outer workflow, where the parentWorkflow is set
      new DoWhile([Incrementer], [Conditional])
      // new DoWhile((i:any) => i + 1, (i:any) => i < 5),
    ]
  }, {
    // Workflow is implicitely registered, but can be overridden
    Identity,
    Get,
    Log,
    DoWhile,
    Incrementer,
    Conditional,
    Wrapper: [Wrapper, { logOutput: true }]                                                                                                                                                                                                                                                                                                                                                                            // defaults happen too magically, this should be { config { logTiming: true }} or [null, {logTiming: true}]
  }).run({a:1});

  // engine.run('https://www.amazon.com/gp/product/B07RJ1PFB6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1')
})()

// new Engine({
//  Get 
// }, ({ Get }) => {
// return [
//   get('a');
// ]
// })