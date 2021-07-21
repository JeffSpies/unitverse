import { Engine} from '../src/di'

import { Cache } from '../src/services/caches/local-fs'

import { Checkpoint } from '../src/tasks/checkpoint'
import { Emitter } from '../src/services/emitters/events'
import { MapValues } from '../src/tasks/map-values'
import { Wrapper } from '../src/tasks/wrapper'
import { Pick } from '../src/tasks/pick'
import { Get } from '../src/tasks/get'


import http from '../src/units/http'
import cheerio from '../src/units/cheerio'
import files from '../src/units/files'
import { Workflow } from '../src/tasks/workflow'

(async () => {
  const warehouse = 'bbn=10158976011'

  const getCategories = ({ checkpoint }) => [
    () => http.get('https://www.amazon.com/b?node=10158976011'),
    checkpoint({
      name: 'categories'
    }),
    cheerio.select('ul.a-unordered-list > * > span.a-list-item', (item, $, $html, _) => {
      return {
        url: $('[href]').attr('href'),
        title: $('[dir="auto"]').text()
      }
    })
  ]

  const search = ({ checkpoint }) => [
    () => 'https://www.amazon.com/s?i=lawngarden&bbn=2972638011&rh=n%3A2972638011%2Cp_85%3A2470955011%2Cp_n_condition-type%3A6358198011&s=price-asc-rank&dc',
    (i) => http.get(i),
    checkpoint({
      name: 'test'
    }),
    cheerio.select('li.a-disabled:contains("400")', (item, $, $html, _) => item ),
    (i) => {
      if (i.length > 0) {

      }
    }
  ]

  const crawl = ({ checkpoint, mapValues, get }) => [
    () => 'https://www.amazon.com/s?i=lawngarden&bbn=3610851&rh=n%3A2972638011%2Cn%3A3610851%2Cn%3A128061011%2Cp_85%3A2470955011%2Cp_n_condition-type%3A6358198011&s=price-asc-rank&dc',
    mapValues({
      url: (i: string): string => i,
      html: (i: string): Promise<string> => http.get(i)
    }),
    // checkpoint({
    //   name: 'hand-tools-1'
    // }),
    get('html'),
    mapValues({
      size: (i) => i.length,
      products: cheerio.select('[data-component-type="s-search-result"]', (item, $, $html, _) => {
        return {
          id: $(item).attr('data-asin'),
          index: $(item).attr('data-index'),
          amazonPrice: $('a > .a-price:not([data-a-strike]) > .a-offscreen').text(),
          usedPrice: $('.a-color-secondary > .a-color-base').text(),
          title: $('div > span > div> div > div > div > h2 > a > span').text()
        }
      })
    })
  ]

  const result = await Engine.inject({
    cache: [ Cache, { path: './dist/' } ],
    checkpoint: Checkpoint,
    emitter: Emitter,
    get: Get,
    mapValues: MapValues,
    wrapper: [ Wrapper, {} ]
  }).into((function into ({ checkpoint, mapValues, get}) {
    return [
    ...crawl({ checkpoint, mapValues, get })
    ]
  }))
  console.log('Result', result)
})()
  