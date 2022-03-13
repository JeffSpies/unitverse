import { Container } from "./container"

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
      const instance = new test1()
      this.test1 = instance.fn()
    }

    fn(x) {
      return this.test1 + x
    }
  }   

  beforeEach(() => {
    container = new Container()
  })

  describe('new interface', () => {
    it('works', () => {
      class Test {
        o
        constructor({ test1 }) {
          this.o = new test1()
        }
        fn () {
          return this.o.fn()
        }
      }

      container.registerClass({
        name: 'jeffspies/test1',
        version: '0.0.1',
        main: Test1,
        type: 'Test',
        dependencies: {}
      })

      container.registerClass({
        name: 'jeffspies/test',
        version: '0.0.1',
        main: Test,
        type: 'Test',
        dependencies: {
          test1: {
            id: 'jeffspies/test1',
            version: '>=0.0.1'
          }
        }
      })

      const cls = container.resolve('jeffspies/test', '0.0.1');
      const obj = new cls();
      expect(obj.fn()).to.equal(1);
    })
  })
})