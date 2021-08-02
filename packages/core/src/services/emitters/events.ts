import { AbstractEmitter } from '../../base/services/emitter'
import { EventEmitter2 } from 'eventemitter2'

export class Emitter extends AbstractEmitter {
  emitter: any
  name: string

  constructor(config?: any) {
    super()
    this.emitter = new EventEmitter2({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    })
  }

  on(topic: string | string[], fn: Function): void {
    this.emitter.on(topic, fn)
  }

  emit(topic: string | string[], message: any): void {
    this.emitter.emit(topic, message)
  }
}