import pMap from 'p-map'
import { Service } from '../service'

export abstract class AbstractQueue extends Service {
  name: string
  abstract close()
}