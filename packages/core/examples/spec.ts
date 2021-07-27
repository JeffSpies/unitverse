import { identity } from "lodash"

(async () => {
  function crawl ({ mapValues, withContext, add, subtract, cache, http, hashUrl }) {
    return [
      cache(
        hashUrl({ algo: 'sha1' }),
        [
          mapValues({
            url: identity(),
            html: http.get()
          })
        ]
      )
    ]
  }
})()
