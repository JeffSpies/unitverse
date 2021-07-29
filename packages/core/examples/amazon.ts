import { Engine} from '../src/di'

import { Cache } from '../src/services/caches/local-fs'

import { Checkpoint } from '../src/tasks/checkpoint'
import { Emitter } from '../src/services/emitters/events'
import { MapValues } from '../src/tasks/map-values'
import { Wrapper } from '../src/tasks/wrapper'
import { Pick } from '../src/tasks/pick'
import { Persist } from '../src/tasks/persist'
import { ParseUrl } from '../src/tasks/parse-url'
import { Get } from '../src/tasks/get'
import { Log } from '../src/tasks/log'
import { WriteFile } from '../src/units/files'
import { nameWorkflow } from '../src/tasks/workflow'

import objectHash from 'object-hash'

import http from '../src/units/http'
import cheerio from '../src/units/cheerio'

import { DoWhile } from '../src/tasks/do-while'
import { Identity } from '../src/tasks/identity'

(async () => {
  const getPage = ({ checkpoint, identity, get, mapValues, log, parseUrl, doWhile, writeFile }) => [
    // identity('https://www.amazon.com/s?i=lawngarden&bbn=3610851&rh=n%3A2972638011%2Cn%3A3610851%2Cn%3A128061011%2Cp_85%3A2470955011%2Cp_n_condition-type%3A6358198011&s=price-asc-rank&dc'),
    // log()
    // doWhile ([
    //   checkpoint({
    //     key: [ parseUrl(), (i) => objectHash(i, { algo: 'sha1' }) ],
    //     value: [
    //       mapValues({
    //         url: [ identity() ],
    //         html: [ http.get() ]
    //       })
    //     ]
    //   }),
    //   writeFile({
    //     path: [ identity('./dist/html') ],
    //     filename: [ get('url'), parseUrl(), (i) => `${objectHash(i, { algo: 'sha1'})}.html` ],
    //     content: [ get('html') ]
    //   }),
    //   cheerio.select(
    //     'li.a-last > a',
    //     (item, $, $html, _) => {
    //       return `https://www.amazon.com${$(item).attr('href')}`
    //     }
    //   ),
    //   get('[0]'),
    //   log()
    // ], [
    //   input => input ? true : false
    // ])
    // async (i) => { await new Promise(resolve => setTimeout(resolve, 5000)); return i } 
  ]
  
  const result = await Engine.inject({
    cache: [ Cache, { path: './dist/cache' } ],
    checkpoint: Checkpoint,
    doWhile: DoWhile,
    emitter: Emitter,
    identity: Identity,
    get: Get,
    mapValues: MapValues,
    parseUrl: ParseUrl,
    persist: Persist,
    log: Log,
    writeFile: WriteFile,
    wrapper: [ Wrapper, { logInput: true, logOutput: true } ]
  }).into(getPage)

  // console.log('Result', result)
})()
  
// const crawl = (di) => [
//   () => 1,
//   di.doWhile(
//     () => [
//       di.persist('jeff'),
//       (i) => i + 1,
//       (i) => i,
//       (i) => i,
//       (i) => i,
//       (i) => i, 
//       (i) => i,
//       (i) => i,
//       (i) => i,
//       (i) => i,
//       (i) => i,
//       (i) => i,
//       (i) => i
//     ],
//     i => i < 10
//   )
// ]
// 
// products: cheerio.select('[data-component-type="s-search-result"]', (item, $, $html, _) => {
//   return {
//     id: $(item).attr('data-asin'),
//     index: $(item).attr('data-index'),
//     amazonPrice: $('a > .a-pri-ce:not([data-a-strike]) > .a-offscreen').text(),
//     usedPrice: $('.a-color-secondary > .a-color-base').text(),
//     title: $('div > span > div> div > div > div > h2 > a > span').text()
//   }
// })
