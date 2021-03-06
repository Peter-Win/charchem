/**
 * Created by PeterWin on 01.05.2017.
 */

const {expect} = require('chai')
const {ChemOp} = require('../../src/core/ChemOp')

describe('ChemOp', () => {
	it('walk', () => {
		let op = new ChemOp('-->', '→', true)
		let result = op.walk({
			operation: op => op.srcText,
		})
		expect(result).to.be.equal('-->')

		// dummy walk for coverage
		expect(op.walk({})).to.be.undefined
	})
})

