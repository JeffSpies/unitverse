import { AbstractCache } from '../../base/cache'
import path from 'path'
import _ from 'lodash'
import hash from 'object-hash'
import queryString from 'query-string'
import { promises as fs } from 'fs'
import serializejs from 'serialize-javascript'

export default class Cache extends AbstractCache {
  name: string
  config: any
  path: string

  constructor(name, config) {
    super()
    this.name = name
    this.config = config
    this.path = this.config.path
    // TODO because we can't create directories or do other ansync functions here, we may need a seutp or isReady function
  }

  serialize(data: any): string {
    return serializejs(data)
  }

  deserialize(data: string): any {
    return eval(`(${data})`)
  }

  preProcessInput(input: any): any {
    // TODO make inputProcessor a config option
    const type = _.get(this.config, 'type')
    let inputProcessor
    if(type === 'url') {
      inputProcessor = queryString.parseUrl
    } else {
      inputProcessor = (i:any): any => i
    }
    return inputProcessor(input)
  }

  generateKey(input: any): string {
    return hash(this.preProcessInput(input), {
      algorithm: 'sha1'
    })
  }

  getPath(key: number | string): string {
    if(_.isNumber(key)) {
      key = _.toString(key)
    }
    return path.join(this.path, `${key}.json`) 
  }


  /**
    * @param key  The key used for storing the cached data.
  */
  async get(key: number | string): Promise <any> {
    try {
      const fi = await fs.readFile(
        this.getPath(key),
        'utf-8'
      )
      return this.deserialize(fi).data
    } catch (err) {
      throw Error('Cache not found')
    }
  }

  async set (key: any): Promise<void>
  async set (key: number | string, data: any): Promise<void>
  async set (key: any, data?: any): Promise<void> {
    if (data === undefined) {
      // When no data is passed in, assume the key is the data to be cached, thus hash it for use as the key
      // TODO handle or disallow actual undefined results (convert to null)
      data = key
      key = this.generateKey(key)
    }

    await fs.mkdir(this.path, { recursive: true })
    return fs.writeFile(
      this.getPath(key),
      this.serialize({
        serializer: {
          // TODO pull this from package.json?
          uri: 'https://www.npmjs.com/package/serialize-javascript/v/4.0.0',
        },
        date: new Date().toISOString(),
        data
      })
    )
  }
}