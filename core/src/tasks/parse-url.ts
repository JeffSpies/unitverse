import queryString from 'query-string'
import urlParse from 'url-parse'
import _ from 'lodash'

export interface UrlObjectInterface {
  protocol: string
  slashes: boolean
  username: string
  password: string
  hostname: string
  pathname: string
  query?: any
  hash?: any
}

export function ParseUrl () {
  return function parseUrl (url: string) {
    const parsed = urlParse(url, false)
    const obj: UrlObjectInterface = _.pick(parsed, [
      'href',
      'protocol',
      'slashes',
      'username',
      'password',
      'hostname',
      'pathname'
    ])
    const parsedQuery = queryString.parseUrl(url)
    const parsedHash = queryString.parse(parsed.hash)
    obj.query = {
      ...parsedQuery.query
    }
    obj.hash = {
      ...parsedHash
    }
    return obj
  }
}