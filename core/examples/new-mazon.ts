import { Task, Workflow } from '../src/internal'

import { Wrapper } from '../src/internal'
import { Get } from '../src/internal'
import { Log } from '../src/internal'

import { Emitter } from '../src/services/emitters/events'

import { DoWhile } from '../src/tasks/do-while'
import { Identity } from '../src/tasks/identity'

(async () => {
  const services = {
    Emitter
  }
  
  const tasks = {
    Wrapper: [Wrapper, { logOutput: true }],
    Identity,
    Get,
    DoWhile
  }

  const result = new Workflow (
    ({ Get, DoWhile, emitter }) => {
      const events = emitter
      events.on('output', (x) => console.log(x))
      
      return [
        new Get('a'),
        new DoWhile(() => [
          Task.fromFunction((input: number) => input + 1, { name: 'doFunction' })
        ], () => [
         Task.fromFunction((input: number) => input < 5, { name: 'whileFunction' })
        ], { name: 'inc' })
      ]
    }, {
      ...services,
      ...tasks
    }
  ).run({a:1});

  // engine.run('https://www.amazon.com/gp/product/B07RJ1PFB6/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1')
})()
