export abstract class AbstractEmitter {
  abstract on(topic: string | string[], fn: Function): void
  abstract emit(topic: string | string[], message: any): void
}