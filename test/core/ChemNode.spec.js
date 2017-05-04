/**
 * Created by PeterWin on 30.04.2017.
 */

import {expect} from 'chai'
import ChemNode from '../../src/core/ChemNode'
import ChemCharge from '../../src/core/ChemCharge'
import ChemNodeItem from '../../src/core/ChemNodeItem'
import {MenTbl} from '../../src/core'

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
			nodePre: item => 'PRE',
			nodePost: item => 'POST'
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
			this.nodePost = node => text
		})
		expect(result).to.be.equal('H3C')

		// third visitor search count of
		let lastAtom
		result = node.walk({
			atom: atom => {lastAtom = atom.id},
			itemPost: item => lastAtom === 'H' ? item.n : 0,
			nodePost: node => 0
		})
		expect(result).to.be.equal(3)

		// dummy visitors for full coverage
		node.walk({})
		node.walk({
			nodePre: () => {}
		})
	})
})