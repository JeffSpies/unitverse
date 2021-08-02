import { Service } from "../service";

export abstract class AbstractEmitter extends Service {
  abstract on(topic: string | string[], fn: Function): void
  abstract emit(topic: string | string[], message: any): void
}