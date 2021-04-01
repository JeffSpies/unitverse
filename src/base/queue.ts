import pMap from 'p-map'

export abstract class AbstractQueue {
  name: string
  abstract close()
}