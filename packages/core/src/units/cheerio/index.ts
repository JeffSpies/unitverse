import * as cheer from 'cheerio'
import _ from 'lodash'

export function select(query: string, callback: Function) {
  return (html: string) => {
    const $html = cheer.load(html)
    const output = []
    $html(query).each(function () {
      const item = this
      const $ = cheer.load(item)
      output.push(callback(item, $, $html, _))
    })
    return output
  }
}

export default {
  select
}