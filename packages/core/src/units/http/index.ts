import axios from 'axios'
import delay from 'delay'

export function get() {
  return async function get(url: string) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36'
          //User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
        }
      })
      return data
    } catch (e) {
      console.log('error')
    }
  }
}

export default {
  get
}