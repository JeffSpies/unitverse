import { expect } from 'chai'
import { Get } from './get'
import { Workflow } from './workflow'
import { Wrapper } from './wrapper'

describe('get', async () => {
  const obj = {
    a: 1,
    b: {
      c: 2,
      d: 3
    }
  }
  it ('basic works', async () => {
    const task = new Get('a')
    expect(task.run(obj)).to.equal(1)
  })
  it ('nested works', async () => {
    const task = new Get('b.c')
    expect(task.run(obj)).to.equal(2)
  })
  it ('default parameter', async () => {
    const task = new Get('d', 10)
    expect(task.run(obj)).to.equal(10)
  })
  it ('wrapped', async () => {
    const task = new Get('b.c')
    const wrapped =  new Wrapper(task, {
      logInput: true,
      logOutput: true
    })
    expect(await wrapped.run(obj)).to.equal(2)
  })
  it ('wrapped with Workflow', async () => {
    const workflow = new Workflow([
      new Get('b.d')
    ],{
      Wrapper,
      WrapperConfig: {
        logInput: true,
        logOutput: true
      }
    })
    expect(await workflow.run(obj)).to.equal(3)
  })
})
