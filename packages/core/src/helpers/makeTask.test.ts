import { expect } from 'chai'
import { makeTask } from './makeTask'

describe('basic tests', () => {
  describe('metadata', () => {
    it ('workflow attached', async () => {
      function Add(config) {
        return function add (value) {
          return config + value
        }
      }

      const Cls = makeTask(Add)
      const obj = new Cls(5)
      expect(obj.unitverse.name).to.equal('Add')
      expect(obj.run(8)).to.equal(13)
      expect(obj.run(10)).to.equal(15)
    })
  })
})
