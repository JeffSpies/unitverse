import { promises as fs } from 'fs'
import _ from 'lodash'

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

export function writeFile(config): Function {
  return async (input?:string|any): Promise<string> => {
    await fs.writeFile(config.path, input)
    return config.returnPath ? config.path : input
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

export default {
  readFile,
  writeFile,
  readJson
}