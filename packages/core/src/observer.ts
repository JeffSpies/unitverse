import {Task} from './base/task'

import _ from 'lodash'
import isPromise from 'p-is-promise'
import pWaterfall from 'p-waterfall'
import PrettyError from 'pretty-error'

export class Observer {
  input: any
  tasks: any[] = []
  logs: any[] = []
  threwError: boolean = false
  nameRegex: RegExp = new RegExp('\/\/[\ ]*name[\ ]*:[\ ]*(?<name>.+)[\ ]*[`\r\n$]+', 'im')
  events: any = {}

  constructor(tasks?) {
    if (tasks && !_.isArray(tasks)) {
      tasks = [tasks]
    } else if (!tasks) {
      tasks = []
    }
    _.each(tasks, (task) => {
      this.add(task)
    }) 
  }

  get output(): any {
    if(!this.threwError)
      return this.logs[this.logs.length - 1]['output']
    throw Error('Output never reached; error thrown')
  }

  set output(x: any) {
    this.logs[this.logs.length-1].output = x
  }

  get errorMessage(): string {
    return this.logs[this.logs.length-1].errorMessage
  }

  set errorMessage(message: string) {
    this.logs[this.logs.length-1].errorMessage = message
  }

  get error(): object | boolean {
    if(this.threwError)
      return {
        message: this.errorMessage,
        task: this.logs[this.logs.length - 1],
      }
    return false
  }

  add(task) {
    this.tasks.push(
      this.wrap(task, this.tasks.length)
    )
  }

  wrap(task, index) {
    let functionString, name, fn
    if (task instanceof Task) {
      fn = task.fn.bind(task)
      functionString = ''
      name = task.name
    } else {
      fn = task
      functionString = fn.toString()
      name = fn.name
      if(!name) {
        const match = functionString.match(this.nameRegex)
        name = _.get(match, 'groups.name', '')
      }
    }
    return ((fn, index, name, functionString) => async (...args) => {
      this.logs.push({
        name,
        task: functionString,
        output: undefined
      })
      if( index === 0 ) {
        this.logs[this.logs.length - 1].input = args[0]
      }
      if( args.length > 1) {
        this.logs[this.logs.length - 1].args = _.slice(args, 1)
      }

      let output = fn(...args)
      if(isPromise(output)){
        output = await output
      }
      this.output = output
      return output
    })(fn, index, name, functionString)
  }

  resetRun() {
    this.logs = []
    this.threwError = false
  }

  filterLogs(config) {
    const include = config.include
    return JSON.stringify(
      _.map(this.logs, _.partialRight(_.pick, include)),
      null, 2
    )
  }

  async run (input?, config?): Promise<any|Observer> {
    config = config ? config : {}
    config = _.defaults(config, {
      debug: false,
      debugOnError: true
    })

    this.resetRun()

    input = input instanceof Observer ? input.output : input
    this.input = input

    try {
      const output = await pWaterfall(this.tasks, input)
      if(!config.debug)
        return output
    } catch (error) {
      if (config.debugOnError && !config.debug) {
        console.log('Received error; rerunning under debug mode')
        return this.run(input, _.assign(config, { debug: true } ))
      }

      this.threwError = true
      this.errorMessage = error.message

      if(!config.debug) {
        console.log(
          `${error.message}\n` +
          this.filterLogs({
            include: ['name', 'input', 'output', 'args']
          })
        )
      } else {
        console.log(
          `${error.message}\n` +
          this.filterLogs({
            include: ['name', 'input', 'output', 'args']
          })
        )
      }
      process.exit(1)
    }
    return this
  }
}

// (async () => {
//   const o = new Observer([
//     function plusFive (i) { return i + 5 },
//     i => { throw Error('hi') }
//   ])
//   const result = await o.run(1, true)
//   console.log(result.error)
// })()