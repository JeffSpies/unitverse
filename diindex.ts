import {Container} from './src/util/di/'

class Cache {
  path
  constructor({ path }) {
    this.path = path
    console.log('constructor<cache>', this.path)
  }
}

class Checkpoint {
  cache: Cache
  name: string
  
  constructor({ cache, name }) {
    this.cache = cache
    this.name = name
    console.log('constructor<checkpoint>', this.cache.path, this.name)
  }
}

const container = new Container()
container.registerClass('cache', Cache, { path: '/here'}, {
  resolve: 'instantiate'
})
container.registerClass('checkpoint', Checkpoint, { path: '/joke' }, {
  resolve: 'wrap'
})

console.log(container.resolve('cache'))
console.log(container.resolve('checkpoint')({ name: 'jeff' }))
console.log(container.resolve('checkpoint')({ name: 'joe' }))
