/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
const expect = require('chai').expect
const ChemSys = require('../../src/ChemSys')

describe('TextMaker', () => {
	it('Reverse nodes direction', () => {
		let expr = ChemSys.compile('OH`-CH2`-CH3')
		expect(expr.text()).to.be.equal('CH3-CH2-OH')
	})

	it('Invisible bonds', () => {
		let expr = ChemSys.compile('H^+-0OH^-')
		expect(expr.html()).to.be.equal('H<sup>+</sup> OH<sup>-</sup>')
		expect(expr.text()).to.be.equal('H+ OH-')
	})

	it('Use $nM to abstract item', () => {
		let expr = ChemSys.compile('$nM(){U}')
		expect(expr.text()).to.be.equal('U')
	})
})
