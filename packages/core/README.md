# Unitverse

## Architecture

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
