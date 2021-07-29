import { Workflow } from './workflow'
import { expect } from 'chai'
import { Task } from '../base/task'
import { Wrapper } from './wrapper'

class Add extends Task {
  value: number

  constructor (value) {
    super(value)
    this.value = value
  }

  run (input) {
    return this.value + input
  }
}

describe('basic tests', () => {
  describe('metadata', () => {
    it ('workflow attached', async () => {
      const add1 = new Add(5)
      const add2 = new Add(10)
      const workflow = new Workflow([
        add1,
        add2
      ])
      expect(await workflow.run(5)).to.equal(20)
      expect(add1.unitverse.parentWorkflow).to.equal(workflow)
      expect(add2.unitverse.parentWorkflow).to.equal(workflow)
    })
  })
})

describe('workflows, wrappers, tasks', () => {
  it ('wrappers', async () => {
    const add1 = new Add(3)
    const add2 = new Add(5)
    const basic = new Workflow([
      add1,
      add2
    ])
    expect(await basic.run(1)).to.equal(9)

    const wrapped = new Workflow(
      [ add1, add2 ],
      {
        wrapper: (c, o) => new Wrapper(c, o)
      }
    )
    expect(await wrapped.run(1)).to.equal(9)

    const wrappedWithConfig = new Workflow(
      [ add1, add2 ],
      {
        wrapper: (c, o) => new Wrapper(c, o),
        wrapperConfig: {
          logInput: true
        }
      }
    )
    expect(await wrappedWithConfig.run(1)).to.equal(9)
  })
})