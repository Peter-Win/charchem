/**
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import {expect} from 'chai'

import ChemExpr from '../../src/core/ChemExpr'
import ChemOp from '../../src/core/ChemOp'

describe('ChemExpr', () => {

	// This low-lewel functions test. Don't repeat this in your project
	it('Low level', () => {
		let expr = new ChemExpr()
		expect(expr.isOk()).to.be.true	// Because err is null
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
})