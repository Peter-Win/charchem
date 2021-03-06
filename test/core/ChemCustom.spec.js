/**
 * Created by PeterWin on 29.04.2017.
 */

const {expect} = require('chai')
const {ChemCustom} = require('../../src/core/ChemCustom')

describe('ChemCustom', () => {
	it('Walk', () => {
		let subItem = new ChemCustom('Aryl')
		let text = subItem.walk({
			custom: obj => obj.tx,
		})
		subItem.walk({})	// to full coverage
		expect(text).to.be.equal('Aryl')
	})
})