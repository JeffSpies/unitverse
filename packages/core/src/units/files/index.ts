import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'
import { Task } from '../../base/task'

export function readFile(config): Function {
  return (input?:string|any): Promise<string | Buffer> => {
    // let path = _.get(config, 'path')
    // let format = _.get(config, 'format')
    
    // if (!path && _.isString(input)) {
    //   path = input
    // } else if( !path && _.isObjectLike(input)) {
    //   path = _.get(config, 'path')
    // } 
    
    // if( !path) {
    //   throw Error('Path is not available')
    // }

    // if (!format && _.isObjectLike(input)) {
      
    // }

    // } else if (_.isObjectLike(input)) {

    // }
    return fs.readFile(config.path, config.format)
  }
}

export interface WriteFileConfig {
  path: string
  filename: Function | Task | (Function | Task)[]
  content: Function | Task | (Function | Task)[]
  returnPath?: boolean
  workflow?: any
}

export class WriteFile extends Task {
  opts
  contentWorkflow
  filenameWorkflow
  pathWorkflow

  constructor (opts: WriteFileConfig) {
    super()
    this.opts = opts
    this.contentWorkflow = opts.workflow( opts.content )
    this.pathWorkflow = opts.workflow( opts.path )
    this.filenameWorkflow = opts.workflow(opts.filename)
  }

  public async run (input) {
    const filepath = await this.pathWorkflow.run(input)
    const filename = await this.filenameWorkflow.run(input)
    const fullPath = path.join(filepath, filename)
    const content = await this.contentWorkflow.run(input)
    await fs.writeFile(fullPath, content)
    return this.opts.returnPath ? fullPath : content
  }
}

export function readJson(config) {
  return async (input?:string|any) => {
    const data = await readFile({
      path: config.path,
      format: config.format || 'utf-8'
    })()
    return JSON.parse(data)
  }
}
export const readJSON = readJson