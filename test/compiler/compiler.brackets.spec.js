/**
 * Created by PeterWin on 09.05.2017.
 */

const {expect} = require('chai')
const {ChemSys} = require('../../src/ChemSys')
const {precision} = require('../testUtils')
const {MenTbl} = require('../../src/core/MenTbl')

describe('Brackets', () => {

	it('Sulfate anion', () => {
		let expr = ChemSys.compile('$ver(1.0)[S<_(A-90,N2m)O><_(A20,N2)O><`/O`^-><_(A70,w+)O^->]^2-')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('O4S^2-')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(96.06, precision)
		expect(ChemSys.calcCharge(expr)).to.be.equal(-2)
	})

	it('Ammonium sulfate', () => {
		let expr = ChemSys.compile('$ver(1.0)[N<`|H><`/H><_(A20,d+)H><_(A70,w+)H>]2^+_(x3.7,N0)[S<_(A-90,N2m)O><_(A20,N2)O><`/O`^-><_(A70,w+)O^->]^2-')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('H8N2O4S')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(132.138, precision)
		expect(ChemSys.calcCharge(expr)).to.be.equal(0)
	})

	//      +- CH2   CH2 -+      CH3 - CH2-CO-CH2 - CH2-CO-CH2 - CH2-CO-CH2 - CH3
	//      | /  \  /   \ |      1     2   3  4     5   6  7     8   9  10    11
	// H3C /|     C       |\CH3  H: 3 +  2    + 2   + 2     + 2  + 2    + 2  + 3 = 18
	//      |     ||      |
	//      +-    O      -+ 3
	it('Polymer', () => {
		let expr = ChemSys.compile('$ver(1.0)/[\\|O`|/]3\\')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C11H18O3')
		let m = MenTbl.C.M * 11 + MenTbl.H.M * 18 + MenTbl.O.M * 3
		expect(ChemSys.calcMass(expr)).to.be.closeTo(m, precision)

		// without auto nodes on ends
		expr = ChemSys.compile('$ver(1.0)H3C/[\\|O`|/]3\\CH3')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C11H18O3')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(m, precision)
	})

	it('Nested brackets', () => {
		let expr = ChemSys.compile('--[(CO)2-CH2]3--')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C11H12O6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(240.211, precision)
	})
	// (Fe(OH))2CO3 - iron(II) hydroxocarbonate
	it('Brackets without bonds', () => {
		let expr = ChemSys.compile('(Fe(OH))2CO3')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('CH2Fe2O5')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(205.719, precision)
		expect(ChemSys.calcCharge(expr)).to.be.equal(0)
	})

})
