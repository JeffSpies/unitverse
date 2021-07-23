import path from 'path'
import _ from 'lodash'
import hash from 'object-hash'
import { promises as fs } from 'fs'
import serializejs from 'serialize-javascript'
import { add, isAfter, parseISO, Duration} from 'date-fns'
import { Service } from '../../base/service'
import { AbstractCache } from '../../base/services/cache'

export interface CacheOptions {
  expiration?: Duration
  hashAlgo?: string
  path: string
}

export class Cache extends AbstractCache{
  options: CacheOptions

  constructor({ expiration, hashAlgo, path}: CacheOptions) {
    super()
    this.options = {
      expiration: undefined,
      hashAlgo: 'sha1',
      ... {
        expiration,
        hashAlgo,
        path
      }
    }
  }

  serialize(data: any): string {
    return serializejs(data)
  }

  deserialize(data: string): any {
    return eval(`(${data})`)
  }

  hashContent(input: any): string {
    return hash(input, {
      algorithm: this.options.hashAlgo
    })
  }

  private getPath(key: number | string): string {
    if(_.isNumber(key)) {
      key = _.toString(key)
    }
    return path.join(this.options.path, `${key}.json`) 
  }

  /**
    * @param key  The key used for storing the cached data.
  */
  public async get(key: number | string): Promise <any> {
    let fi
    try {
      fi = await fs.readFile(
        this.getPath(key),
        'utf-8'
      )
    } catch (err) {
      throw Error('Cache not found')
    }

    const cachedObject = this.deserialize(fi)

    const now = new Date()
    if (
      this.options.expiration 
      && isAfter(now, add(parseISO(cachedObject.date), this.options.expiration))
    ) {
      await this.delete(key)
      throw Error('Cache not found')
    }
    
    return cachedObject.data
  }

  public async set (key: number | string, data: any): Promise<void> {
    await fs.mkdir(this.options.path, { recursive: true })
    return fs.writeFile(
      this.getPath(key),
      this.serialize({
        serializer: {
          // TODO pull this from package.json?
          uri: 'https://www.npmjs.com/package/serialize-javascript/v/5.0.1',
        },
        date: new Date().toISOString(),
        data
      })
    )
  }

  public async hashAndSet(data: any) {
    const key = this.hashContent(data)
    this.set(key, data)
  }

  public async delete (key:any): Promise<void> {
    await fs.rm(this.getPath(key))
  }

  public async clear (): Promise<void> {
    await fs.rm(this.options.path, { recursive: true })
  }
}