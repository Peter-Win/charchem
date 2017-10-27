const expect = require('chai').expect
const ChemObj = require('../../src/core/ChemObj')

describe('ChemObj', () => {
	it('ChemObj with positions', () => {
		const obj = new ChemObj(11, 22)
		expect(obj.pA).to.be.equal(11)
		expect(obj.pB).to.be.equal(22)
	})
	it('setPos', () => {
		const obj = new ChemObj()
		obj.setPos(12, 23)
		expect(obj.pA).to.be.equal(12)
		expect(obj.pB).to.be.equal(23)
	})
})