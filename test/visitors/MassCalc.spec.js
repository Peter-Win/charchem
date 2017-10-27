/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
const expect = require('chai').expect
const MassCalc = require('../../src/visitors/MassCalc')
const ChemSys = require('../../src/ChemSys')
const {MenTbl} = require('../../src/core')
const {precision, extractNodes} = require('../testUtils')

describe('MassCalc', () => {
	it('getList for 1 agent in expression', () => {
		let expr = ChemSys.compile('2H2')
		let visitor = new MassCalc()
		expr.walk(visitor)
		let list = visitor.getList()
		expect(list).to.have.lengthOf(1)
		expect(list[0]).to.be.closeTo(MenTbl.H.M * 2, precision)
	})

	it('getList for 2 agents in expression', () => {
		let expr = ChemSys.compile('2H2 + O2')
		let visitor = new MassCalc()
		expr.walk(visitor)
		let list = visitor.getList()
		expect(list).to.have.lengthOf(2)
		expect(list[0]).to.be.closeTo(MenTbl.H.M * 2, precision)
		expect(list[1]).to.be.closeTo(MenTbl.O.M * 2, precision)
	})

	it('getList for node', () => {
		let expr = ChemSys.compile('CH3-OH')
		let nodes = extractNodes(expr)
		let visitor = new MassCalc()
		nodes[0].walk(visitor)
		let list = visitor.getList()
		expect(list).to.have.lengthOf(1)
		expect(list[0]).to.be.closeTo(MenTbl.C.M + MenTbl.H.M * 3, precision)
	})
})
