import { Engine} from '../src/di'

import { Cache } from '../src/services/caches/local-fs'

import { Checkpoint } from '../src/tasks/checkpoint'
import { Emitter } from '../src/services/emitters/events'
import { MapValues } from '../src/tasks/map-values'
import { Wrapper } from '../src/tasks/wrapper'
import { Pick } from '../src/tasks/pick'
import { Persist } from '../src/tasks/persist'
import { Get } from '../src/tasks/get'

import objectHash from 'object-hash'

import http from '../src/units/http'
import cheerio from '../src/units/cheerio'

import {parseUrl} from '../src/util/urlObjects'
import { DoWhile } from '../src/tasks/do-while'

(async () => {
  // const getPage = ({ checkpoint, mapValues, get }) => [
  //   get('next[0]'),
  //   (i) => { console.log(1); return i },
  //   mapValues({
  //     url: (i: string): string => i,
  //     html: (i: string): Promise<string> => http.get(i)
  //   }),
  //   (i) => { console.log(2); return i },
  //   checkpoint({
  //     name: workflowInput => {
  //       console.log(workflowInput.next[0])
  //       return objectHash(
  //         parseUrl(workflowInput.next[0]),
  //           { algorithm: 'sha1' }
  //         )
  //     }
  //   }),
  //   (i) => { console.log(3); return i },
  //   get('html'),
  //   (i) => { console.log(4); return i },
  //   mapValues({
  //     next: cheerio.select('li.a-last > a', (item, $, $html, _) => {
  //       return `https://www.amazon.com${$(item).attr('href')}`
  //     }),
  //     // products: cheerio.select('[data-component-type="s-search-result"]', (item, $, $html, _) => {
  //     //   return {
  //     //     id: $(item).attr('data-asin'),
  //     //     index: $(item).attr('data-index'),
  //     //     amazonPrice: $('a > .a-pri-ce:not([data-a-strike]) > .a-offscreen').text(),
  //     //     usedPrice: $('.a-color-secondary > .a-color-base').text(),
  //     //     title: $('div > span > div> div > div > div > h2 > a > span').text()
  //     //   }
  //     // })
  //   }),
  //   (i) => { console.log(5); return i },
  //   async (i) => { await new Promise(resolve => setTimeout(resolve, 3000)); return i } 
  // ]

  // const crawl = (injections) => [
  //   () => ({
  //     next: [
  //       'https://www.amazon.com/s?i=lawngarden&bbn=3610851&rh=n%3A2972638011%2Cn%3A3610851%2Cn%3A128061011%2Cp_85%3A2470955011%2Cp_n_condition-type%3A6358198011&s=price-asc-rank&dc'
  //     ]
  //   }),
  //   injections.doWhile(getPage(injections), input => input.next.length > 0)
  // ]
  
  const crawl = (di) => [
    () => 1,
    di.doWhile(
      [
        di.persist('jeff'),
        (i) => i + 1,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i,
        (i) => i
      ],
      (i) => i < 10
    )
  ]

  const result = await Engine.inject({
    cache: [ Cache, { path: './dist/' } ],
    checkpoint: Checkpoint,
    doWhile: DoWhile,
    emitter: Emitter,
    get: Get,
    mapValues: MapValues,
    persist: Persist,
    wrapper: [ Wrapper, {} ]
  }).into(crawl)

  console.log('Result', result)
})()
  