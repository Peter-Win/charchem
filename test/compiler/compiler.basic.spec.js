/**
 * Created by PeterWin on 06.05.2017.
 */

const {expect} = require('chai')
const {chemCompiler} = require('../../src/compiler/main')
const {ChemSys} = require('../../src/ChemSys')
const {Lang} = require('../../src/Lang')
const {MenTbl} = require('../../src/core/MenTbl')
const {precision, extractNodes} = require('../testUtils')

describe('Basic compiler cases', () => {
	it('B', () => {
		const expr = chemCompiler('B')
		expect(expr.isOk()).to.be.ok
	})
	// simple substance
	it('H2O', () => {
		const expr = chemCompiler('H2O')
		expect(expr.isOk()).to.be.ok

		const text = ChemSys.makeHtml(expr)
		expect(text).to.be.equal('H<sub>2</sub>O')
	})

	// equation
	it('2H2 + O2 = 2H2O', () => {
		const expr = chemCompiler('2H2 + O2 = 2H2O')
		expect(expr.text()).to.be.equal('2H2 + O2 = 2H2O')
	})

	// charge
	it('SO4^2-', () => {
		const expr = chemCompiler('SO4^2-')
		expect(expr.html()).to.be.equal('SO<sub>4</sub><sup>2-</sup>')
	})

	// simple bond
	it('H-Cl', () => {
		const expr = chemCompiler('H-Cl')
		expect(expr.getMessage()).to.be.empty
		expect(expr.text()).to.be.equal('H-Cl')
		expect(ChemSys.isAbstract(expr)).to.be.not.ok
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('HCl')
	})

	// Abstract item
	it('{R}-OH', () => {
		const expr = chemCompiler('{R}-OH')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('R-OH')
		expect(ChemSys.isAbstract(expr)).to.be.ok
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('HO{R}')
	})

	// Radical
	it('{Me}-OH', () => {
		let expr = chemCompiler('{Me}-OH')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('Me-OH')
		expect(ChemSys.isAbstract(expr)).to.not.be.ok
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('CH4O')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(32.042, precision)
	})

	// Simple brackets
	it('K3[Fe(CN)6]', () => {
		let expr = chemCompiler('K3[Fe(CN)6]')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html()).to.be.equal('K<sub>3</sub>[Fe(CN)<sub>6</sub>]')
	})

	it('Abstract coefficient of bracket', () => {
		let expr = chemCompiler('CH3-(CH2)\'n\'-COOH')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('CH3-(CH2)n-COOH')
		expect(ChemSys.isAbstract(expr)).to.be.ok
	})

	it('Abstract coefficient of agent', () => {
		let expr = chemCompiler("'n'Br2")
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.isAbstract(expr)).to.be.ok
		expect(expr.html()).to.be.equal('<b>n</b>Br<sub>2</sub>')
	})

	it('Comment in operation', () => {
		let expr = chemCompiler('CaCO3 "2000^oC"-->"-[Delta]" CaO + CO2')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('CaCO3 2000°C—→-Δ CaO + CO2')
	})

	it('Comment in agent', () => {
		Lang.init('en')
		let expr = chemCompiler('"`Cl` -- "Cl2", [Omega]"')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('Chlorine -- Cl2, Ω')
		expect(ChemSys.isAbstract(expr)).to.not.be.ok	// Not abstract, just comment
		expect(ChemSys.calcMass(expr)).to.be.equal(MenTbl.Cl.M * 2)
	})

	it('Use multiplier: CuSO4*5H2O', () => {
		let expr = chemCompiler('CuSO4*5H2O')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('CuSO4*5H2O')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(159.606 + 5 * 18.015, precision)
	})
	it('Poly multiplier: C*3O*15H', () => {
		// TODO: Коэффициент перед С воспринимается как кожффициент агента, а не С
		let expr = chemCompiler('C*3O*15H*Br')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('C*3O*15H*Br')
		let m = MenTbl.C.M + 3 * MenTbl.O.M + 15 * MenTbl.H.M + MenTbl.Br.M
		expect(ChemSys.calcMass(expr)).to.be.closeTo(m, precision)
		expect(ChemSys.calcCharge(expr)).to.be.equal(0)
	})

	it('Oxidation', () => {
		let expr = chemCompiler('H2(+)S(+6)O(-2)4')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('H[sup]+[/sup][sub]2[/sub]S[sup]+6[/sup]O[sup]-2[/sup][sub]4[/sub]')
		let nodes = extractNodes(expr)
		let items = nodes[0].items
		expect(items[0].charge).to.have.property('val', 1)
		expect(items[1].charge).to.have.property('val', 6)
		expect(items[2].charge).to.have.property('val', -2)
	})

	it('Use # for spaces', () => {
		let expr = ChemSys.compile('O`^-# -S')
		expect(expr.getMessage()).to.be.empty
		expect(expr.text()).to.be.equal('-O-S')
	})
})
