import { makeTask } from '../helpers/makeTask'

export const Identity = makeTask(
  function Identity (value?: any) {
    return function identity (i) {
      return value || i
    }
  }
)