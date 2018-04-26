/**
 * Created by PeterWin on 29.04.2017.
 */

const expect = require('chai').expect
const ChemNodeItem = require('../../src/core/ChemNodeItem')
const MenTbl = require('../../src/core').MenTbl

describe('ChemNodeItem', () => {

	it('Walk', () => {
		let nodeItem = new ChemNodeItem(MenTbl.Br)
		nodeItem.n = 2
		let text = '', mass = 0
		nodeItem.walk({
			itemPre: () => {
				text += '*'
			},
			atom: elem => {
				mass += elem.M
				text += elem.id
			},
			itemPost: item => {
				mass *= item.n
				text += item.n
			},
		})
		// dummy visitor (to full coverage)
		nodeItem.walk({})

		expect(text).to.be.equal('*Br2')
		expect(mass).to.be.equal(2 * 79.904)
	})

	it('Walk break', () => {
		let nodeItem = new ChemNodeItem(MenTbl.H)
		let result = nodeItem.walk({
			itemPre: () => 'SUCCESS',
			itemPost: () => 'FAIL',
		})
		// result formed by itemPre, and itemPost not called
		expect(result).to.be.equal('SUCCESS')
	})

})