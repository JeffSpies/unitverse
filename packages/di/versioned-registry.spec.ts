
import { VersionedRegistry } from './versioned-registry'

import chai from 'chai'
import { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

describe('VersionedRegistry', () => {
  let vr

  beforeEach(() => {
    vr = new VersionedRegistry()
  })

  describe('Basic functionality', () => {
    it ('The registry with default settings', () => {
      const id = 'test1'

      vr.registerVersion(id, '0.0.1', 1)
      expect(vr.get(id)).to.equal(1)
      vr.registerVersion(id, '0.0.2', 2)
      expect(vr.get(id)).to.equal(2)
      vr.registerVersion(id, '0.0.3', 3)
      vr.registerVersion(id, '0.0.4', 4)
      expect(vr.get(id)).to.equal(4)
      expect(vr.getVersion(id, '>0.0.2 <0.0.4')).to.equal(3)
    })
  })
})