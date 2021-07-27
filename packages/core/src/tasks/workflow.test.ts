import { Workflow } from './workflow'
import chai from 'chai'
import { expect } from 'chai'
import { Task } from '../base/task'

describe('workflow-task', () => {

  beforeEach(() => {

  })

  describe('memory', () => {
    it ('should exist', async () => {
      const workflow = new Workflow([
        (i) => i + 1
      ])
      const fn = workflow.fn.bind(workflow)
      
      expect(await fn(1)).to.equal(2)
      expect(await fn(2)).to.equal(3)
      expect(await fn(50)).to.equal(51)
    })

    it ('should exist for Tasks', async () => {
      class Counter extends Task {
        i
        constructor(i) {
          super()
          this.i = i
        }
  
        async run (i) {
          this.i = this.i + i
          return this.i
        }
      }
  
      const counter = (i) => new Counter(i)
  
      const workflow = new Workflow([
        counter(1)
      ])
      const fn = workflow.fn.bind(workflow)
      expect(await fn(1)).to.equal(2)
      expect(await fn(10)).to.equal(12)
      expect(await fn(20)).to.equal(32)
    })
  })  
})
