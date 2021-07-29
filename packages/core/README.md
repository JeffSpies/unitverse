# Unitverse

## Architecture 0.2

Engines register things.

Workflows build streams of Tasks. 

workflow([
  add(1),
  subtract(2),
  multiply(3),
  doWhile(
    workflow([ add(2) ]),
    workflow([ i => i > 30 ])
  )
])

## Architecture 0.1

Engine
  <- DIEngine

There are currently four core abstractions:
- units are functions that take one input and return one output
- tasks are units that can be configured
- the engine
  - builds and/or runs an array of functions or units/tasks
- components
  - observer
  - planner
  - queue
  - cache
    - set
    - get
  - emitter
    - emit
    - on
- units
  - functions
    - simply take an input and return an output
  - tasks
    - functions that can be configured when instantiated or treated simply as functions
- plugins/extensions.

### Engine

### Components

Components are modules that can used by the engine or tasks. These include

- Caches
  - local-fs (default)
- Emitters
  - events (default) - using the `events2` library
- Queues
  - p-queue (default)
  - bull-queue - using `bull-queue` and `redis`

For exapmle, the engine's queue task could use `p-queue` with local aync or `bull-queue` with redis.

### Tasks

The engine will process Tasks or functions that take a single input object. Tasks have the following abstractions, wrapping the most basic component the `fn` method--and providing access to the engine it was instantiated within.

```ts
- emit(topic, message)
- onPreplan(context)
- fn(input?: any): any | Promise<any>
- close(): boolean | Promise<boolean>
```
The tasks that are available on the engine that make use of provided components above are
- engine.queue()
- engine.log()
- engine.inputter()
- engine.checkpoint()

#### New thinking
Perhaps Tasks can use di'd services:
- emitter emit
- logger log
- queue queue

```ts
(...services) => {
  return (input) => {
    service(input)
    return input
  }
}
```

Functions
```ts
input => output,
config => input => output,
```

Class
```ts
config =>fn(input) => output
```

Workflows requires an array of functions. But if you were to do
```ts
const w = workflow([
  a => a,
  (c => d => c + d)(2)
])

w.fn(1)
```

Calling `w.fn` returns 3 because--walking through the array--[0] returns 1 and [1] became d => 2 + d where d = 1.

The problem is that if you call w.fn(2), you expect to get 4--and you do. But what if the workflow list is as follows:

```ts
class Example extends Task {
  x
  constructor (x) {
    this.x = x
  }

  fn (y) {
    if (!this.x) {
      this.x = y
    }
  }
}

const w = workflow([
  new Task(3)
])

x