import { Container } from "../container"

import chai from 'chai'
import { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

describe('di', () => {

  let container

  class Test1 {
    constructor () {
    }

    fn () {
      return 1
    }
  }

  class Test2 {
    test1
    constructor ({test1}) {
      const Test1 = test1
      const instance = new Test1()
      this.test1 = instance.fn()
    }

    fn(x) {
      return this.test1 + x
    }
  }

  beforeEach(() => {
    container = new Container()
  })

  describe('working with classes', () => {
    it ('the class should work', () => {
      const test1 = new Test1()
      expect(test1.fn()).to.equal(1)
    })
    
    it('registration fails on reserved words', () => {
      const result = container.registerClass('constructor', Test1)
      expect(result).to.be.false
    })

    it('resolution of a class', () => {
      expect(container.registerClass('test1', Test1)).to.be.true
      const cls = container.resolve('test1')
      const instance = new cls()
      expect(instance instanceof Test1).to.be.true
      expect(instance.fn()).to.equal(1)
    })

    it('dependency injection', () => {
      expect(container.registerClass('test1', Test1)).to.be.true
      expect(container.registerClass('test2', Test2)).to.be.true
      const cls = container.resolve('test2')
      const instance = new cls()
      expect(instance instanceof Test2).to.be.true
      expect(instance.fn(1)).to.equal(2)
    })

    it('dependency injection as last arg', () => {
      class Test3 {
        test1
        x
        constructor (x, { test1 }) {
          this.x = x
          // const { test1 } = options
          const Test1 = test1
          const instance = new Test1()
          this.test1 = instance.fn()
        }
    
        fn(y) {
          return this.test1 + this.x + y
        }
      }

      expect(container.registerClass('test1', Test1)).to.be.true
      expect(container.registerClass('test3', Test3)).to.be.true
      const cls = container.resolve('test3')
      const instance = new cls(1, {})
      expect(instance instanceof Test3).to.be.true
      expect(instance.fn(1)).to.equal(3)
      expect(instance.fn(52)).to.equal(54)
    })

    it('dependency injection as last arg unexpanded', () => {
      interface Options4 {
        test1?: any
      }
      
      class Test {
        test1
        x
        constructor (x, options: Options4 = {}) {
          this.x = x
          const { test1 } = options
          const Test1 = test1
          const instance = new Test1()
          this.test1 = instance.fn()
        }
    
        fn(y) {
          return this.test1 + this.x + y + 4
        }
      }

      expect(container.registerClass('test1', Test1)).to.be.true
      expect(container.registerClass('test4', Test)).to.be.true
      const cls = container.resolve('test4')
      // Notice how options is essentially undefined
      const instance = new cls(1)
      expect(instance instanceof Test).to.be.true
      expect(instance.fn(1)).to.equal(7)
      expect(instance.fn(52)).to.equal(58)
    })

    it('nested dependencies', () => {
      class Test {
        value
        constructor ({ test2 }) {
          const instance = new test2()
          this.value = instance.fn(20)
        }

        fn (x) {
          return this.value + x
        }
      }
      expect(container.registerClass('test1', Test1)).to.be.true
      expect(container.registerClass('test2', Test2)).to.be.true
      expect(container.registerClass('test', Test)).to.be.true
      const cls = container.resolve('test')
      const instance = new cls()
      expect(instance instanceof Test).to.be.true
      expect(instance.fn(2)).to.equal(23)
    })
  })
})