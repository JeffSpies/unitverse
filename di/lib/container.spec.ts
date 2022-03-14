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
      this.test1 = instance
    }

    fn(x) {
      return this.test1.fn() + x
    }
  }

  class Test3 {
    test2
    constructor ({test2}) {
      const instance = new test2()
      this.test2 = instance
    }

    fn(x) {
      return this.test2.fn(x)
    }
  }

  beforeEach(() => {
    container = new Container()
  })

  describe('new interface', () => {
    it('works', () => {
      container.register({
        name: 'jeffspies/test1',
        version: '0.0.1',
        main: Test1,
        type: 'Test',
        dependencies: {
        }
      })

      container.register({
        name: 'jeffspies/test2',
        version: '0.0.1',
        main: Test2,
        type: 'Test2',
        dependencies: {
          test1: {
            id: 'jeffspies/test1',
            version: '>=0.0.1'
          }
        }
      })

      const cls = container.resolve({
        name: 'jeffspies/test3',
        version: '0.0.1',
        main: Test3,
        type: 'Test3',
        dependencies: {
          test2: {
            id: 'jeffspies/test2',
            version: '>=0.0.1'
          }
        }
      });

      const obj = new cls();
      expect(obj.fn(2)).to.equal(3);
      
      const cls2 = container.resolve(Test3, {
        test2: {
          id: 'jeffspies/test2',
          version: '>=0.0.1'
        }
      });

      const obj2 = new cls2();
      expect(obj2.fn(3)).to.equal(4);
    });
  })
})