import { Engine} from '../src/di'

import { Cache } from '../src/services/caches/local-fs'

import { Checkpoint } from '../src/tasks/checkpoint'

import http from '../src/units/http'
import cheerio from '../src/units/cheerio'
import files from '../src/units/files'

(async () => {
  const result = await Engine.inject({
    cache: [ Cache, { path: './dist/' } ],
    checkpoint: Checkpoint
  }).into(({ checkpoint }) => [
    () => http.get('https://smile.amazon.com/s?k=holy+stone+drone+gps&i=warehouse-deals&ref=nb_sb_noss_2'),
    checkpoint({
      name: 'holy-stone2'
    }),
    cheerio.select('[data-component-type="s-search-result"]', (item, $, $html, _) => {
      return [
        $(item).attr('data-asin'),
        $('.a-link-normal.a-text-normal').attr('href'),
        $('.a-row > .a-color-base').text()
      ]
    })
  ])
  console.log('Result', result)
})()
