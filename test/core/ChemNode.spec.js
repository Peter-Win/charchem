/**
 * Created by PeterWin on 30.04.2017.
 */

const expect = require('chai').expect
const ChemNode = require('../../src/core/ChemNode')
const ChemCharge = require('../../src/core/ChemCharge')
const ChemNodeItem = require('../../src/core/ChemNodeItem')
const MenTbl = require('../../src/core').MenTbl

describe('ChemNode', () => {

	it('chargeVal', () => {
		let node = new ChemNode()
		expect(node.chargeVal()).to.be.equal(0)

		node.charge = ChemCharge.create('2-')
		expect(node.chargeVal()).to.be.equal(-2)
	})

	it('walk', () => {
		// let's construct H3C node
		let node = new ChemNode()
		let itemH = new ChemNodeItem(MenTbl.H)
		itemH.n = 3
		node.items.push(itemH, new ChemNodeItem(MenTbl.C))

		// first visitor return result from itemPre
		let result = node.walk({
			nodePre: () => 'PRE',
			nodePost: () => 'POST',
		})
		expect(result).to.be.equal('PRE')

		// second visitor is very simple text maker
		result = node.walk(new function () {
			let text = ''
			this.atom = elem => {
				text += elem.id
			}
			this.itemPost = item => {
				if (item.n !== 1) text += item.n
			}
			this.nodePost = () => text
		})
		expect(result).to.be.equal('H3C')

		// third visitor search count of
		let lastAtom
		result = node.walk({
			atom: atom => {lastAtom = atom.id},
			itemPost: item => lastAtom === 'H' ? item.n : 0,
			nodePost: () => 0,
		})
		expect(result).to.be.equal(3)

		// dummy visitors for full coverage
		node.walk({})
		node.walk({
			nodePre: () => {},
		})
	})
})