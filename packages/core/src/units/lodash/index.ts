import ld from 'lodash'

const chainables = [
  'after','ary','assign','assignIn','assignInWith','assignWith','at','before','bind','bindAll','bindKey','castArray','chain','chunk','commit','compact','concat','conforms','constant','countBy','create','curry','debounce','defaults','defaultsDeep','defer','delay','difference','differenceBy','differenceWith','drop','dropRight','dropRightWhile','dropWhile','extend','extendWith','fill','filter','flatMap','flatMapDeep','flatMapDepth','flatten','flattenDeep','flattenDepth','flip','flow','flowRight','fromPairs','functions','functionsIn','groupBy','initial','intersection','intersectionBy','intersectionWith','invert','invertBy','invokeMap','iteratee','keyBy','keys','keysIn','map','mapKeys','mapValues','matches','matchesProperty','memoize','merge','mergeWith','method','methodOf','mixin','negate','nthArg','omit','omitBy','once','orderBy','over','overArgs','overEvery','overSome','partial','partialRight','partition','pick','pickBy','plant','property','propertyOf','pull','pullAll','pullAllBy','pullAllWith','pullAt','push','range','rangeRight','rearg','reject','remove','rest','reverse','sampleSize','set','setWith','shuffle','slice','sort','sortBy','splice','spread','tail','take','takeRight','takeRightWhile','takeWhile','tap','throttle','thru','toArray','toPairs','toPairsIn','toPath','toPlainObject','transform','unary','union','unionBy','unionWith','uniq','uniqBy','uniqWith','unset','unshift','unzip','unzipWith','update','updateWith','values','valuesIn','without','wrap','xor','xorBy','xorWith','zip','zipObject','zipObjectDeep','zipWith'
]

class Chain {
  [x: string]: any
  fns: any[]
  args: any[]
  path: any
  constructor(path?:string|string[]) {
    this.fns = []
    this.args = []
    this.path = path
  }
  // get(path, defaultValue?) {
  //   return (object) => {
  //     return ld.get(object, path, defaultValue)
  //   }
  // }

  value() {
    return (input) => {
      if (this.path) {
        input = ld.get(input, this.path)
        if (input === undefined) {
          throw Error('Path not found')
        }
      }
      let chain = ld.chain(input)
      for(let i = 0; i < this.fns.length; i++) {
        const name = this.fns[i]
        const args = this.args[i]
        chain = chain[name](...this.args[i])
      }
      return chain.value()
    }
  }
}

for(let i = 0; i < chainables.length; i++) {
  const name = chainables[i]
  Chain.prototype[name] = function (...args) {
    this.fns.push(name)
    this.args.push(args)
    return this
  }
}

export function chain(path?:string|string[]) {
  return new Chain(path)
}

export const lodash = ld
export const _ = ld