/**
 * Created by PeterWin on 28.04.2017.
 */
'use strict'

const {expect} = require('chai')

const ChemExpr = require('../../src/core/ChemExpr')
const ChemOp = require('../../src/core/ChemOp')
const ChemSys = require('../../src/ChemSys')

describe('ChemExpr', () => {

	// This low-lewel functions test. Don't repeat this in your project
	it('Low level', () => {
		let expr = new ChemExpr()
		expect(expr.isOk()).to.be.ok	// Because err is null
	})

	it('getMessage', () => {
		// good case
		let expr = ChemSys.compile('H')
		expect(expr.getMessage()).to.be.empty

		// bad case
		expr = ChemSys.compile('A')
		expect(expr.getMessage()).to.not.be.empty
	})

	it('getObjSrc', () => {
		const opText = '-->'
		let expr = new ChemExpr()
		expr.src = opText
		let op = new ChemOp(opText, opText)
		op.pA = 0
		op.pB = opText.length

		let code = expr.getObjSrc(op)
		expect(code).to.be.equal(opText)
	})

	it('html', () => {
		// linear case
		let expr = ChemSys.compile('H2SO4')
		let html = expr.html()
		expect(html).to.be.equal('H<sub>2</sub>SO<sub>4</sub>')

		// non-linear case
		expr = ChemSys.compile('/\\')
		expect(expr.html()).to.be.empty
	})
})
