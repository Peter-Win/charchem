/**
 * Created by PeterWin on 01.05.2017.
 */
'use strict'

const {expect} = require('chai')
const {ChemBond} = require('../../src/core/ChemBond')
const {Point} = require('../../src/math/Point')
const {ChemNode} = require('../../src/core/ChemNode')

describe('ChemBond', ()=> {

	it('walk', ()=> {
		let bond = new ChemBond()
		let result = bond.walk({}) || bond.walk({bond: () => 'SUCCESS'})
		expect(result).to.be.equal('SUCCESS')
	})

	it('calcPt', () => {
		let bond = new ChemBond()
		bond.nodes[0] = new ChemNode(new Point(1, 1))
		bond.pt = new Point(1, 0)
		expect(bond.calcPt()).to.be.eql({x:2, y:1})

		bond.pt.init(0, 1)
		expect(bond.calcPt()).to.be.eql({x:1, y:2})
	})

	it('other', () => {
		let bond = new ChemBond()
		let node0 = bond.nodes[0] = new ChemNode(new Point(1, 1))
		let node1 = bond.nodes[1] = new ChemNode(new Point(2, 2))
		let node2 = new ChemNode(new Point(3, 3))

		// 2 nodes
		expect(bond.other(node0)).to.be.equal(node1)
		expect(bond.other(node1)).to.be.equal(node0)
		expect(bond.other(node2)).to.be.null

		// not 2 nodes
		bond.nodes[2] = node2
		expect(bond.other(node0)).to.be.null
		expect(bond.other(node1)).to.be.null
		expect(bond.other(node2)).to.be.null
	})
})
