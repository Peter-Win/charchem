/**
 * Created by PeterWin on 28.04.2017.
 */
'use strict'

import { expect } from 'chai'
import ChemSys, { esc } from '../src/ChemSys'
import { MenTbl } from '../src/core'

describe('ChemSys', () => {
	it('Check library version', () => {
		const config = require('../package.json')
		const sysVersion = ChemSys.verStr()
		// result of ChemSys.verStr() must be equal to version field in package.json
		expect(sysVersion).to.be.equal(config.version)
	})

	it('esc', () => {
		expect(esc('<b>')).to.be.equal('&lt;b&gt;')
		expect(esc(1)).to.be.equal('')
	})

	it('findElem', () => {
		let O = ChemSys.findElem('O')
		expect(O).to.be.equal(MenTbl.O)
		let D = ChemSys.findElem('D')
		// Deiterium
		expect(D).to.have.property('n', 1)
		expect(D).to.have.property('M', 2)
	})

	it('makeHtml', () => {
		let expr = ChemSys.compile('H2SO4')
		expect(ChemSys.makeHtml(expr)).to.be.equal('H<sub>2</sub>SO<sub>4</sub>')
	})

	it('isEmptyNode', () => {
		const getNode = src => ChemSys.compile(src).walk({
			nodePre: node => node
		})
		expect(ChemSys.isEmptyNode(getNode('{}'))).to.be.ok
		expect(ChemSys.isEmptyNode(getNode('{R}'))).to.not.be.ok
		expect(ChemSys.isEmptyNode(getNode('{Et}'))).to.not.be.ok
		expect(ChemSys.isEmptyNode(getNode('""-'))).to.be.ok
		expect(ChemSys.isEmptyNode(getNode('"A"-'))).to.not.be.ok
	})

	it('isAbstract', () => {
		expect(ChemSys.isAbstract(ChemSys.compile("CH3-(CH2)'n'-CH3"))).to.be.ok
		expect(ChemSys.isAbstract(ChemSys.compile('CH3-(CH2)3-CH3'))).to.not.be.ok
	})

	it('calcMass', () => {
		let expr = ChemSys.compile('Br2')
		expect(ChemSys.calcMass(expr)).to.be.equal(MenTbl.Br.M * 2)
	})

	it('makeBrutto', () => {
		let expr1 = ChemSys.compile('/\\\\|`//`\\`||')
		let expr2 = ChemSys.makeBrutto(expr1)
		expect(expr2.html('text')).to.be.equal('C6H6')
	})

	it('makeBruttoKey', () => {
		let expr = ChemSys.compile('SO4^2-')
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('O4S^2-')
		expect(ChemSys.makeBruttoKey(expr, true)).to.be.equal('O4S')
	})
})
