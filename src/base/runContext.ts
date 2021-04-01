import { Task } from './task'
import { Observer } from '../observer'

export interface IRunContext {
  tasks:  (Function | Task | Observer)[],
  taskListIndex?: number
}