/**
 * Functions
 * Created by PeterWin on 08.05.2017.
 */
'use strict'

const precision = 0.001

import { expect } from 'chai'
import ChemSys from '../../src/ChemSys'
import { extractBonds, extractNodes, extractItems } from '../testUtils'

describe('functions', () => {

	it('atomColor', () => {
		let expr = ChemSys.compile('$atomColor(rgb(255,0,0))H2O$atomColor() + Na')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('[color=rgb(255,0,0)]H[/color][sub]2[/sub][color=rgb(255,0,0)]O[/color] + Na')
	})

	it('atomColor1', () => {
		let expr = ChemSys.compile('$atomColor1(red)H2O')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('[color=red]H[/color][sub]2[/sub]O')
	})

	it('color', () => {
		let expr = ChemSys.compile('CH3-CH2$color(red)-OH')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('CH[sub]3[/sub]-CH[sub]2[/sub][color=red]-[/color][color=red]O[/color][color=red]H[/color]')
		let bonds = extractBonds(expr)
		expect(bonds[1]).to.have.property('color', 'red')
	})

	it('dashes', () => {
		let expr = ChemSys.compile('$dashes(|.|)Br')
		expect(expr.getMessage()).to.be.empty
		let items = extractItems(expr)
		expect(items[0].dashes).to.be.eql([0, 180])
	})

	it('dblAlign', () => {
		let expr = ChemSys.compile('$dblAlign(R)//$dblAlign(M)//$dblAlign(L)//$dblAlign()//')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(4)
		expect(bonds[0]).to.have.property('align', 'r')
		expect(bonds[1]).to.have.property('align', 'm')
		expect(bonds[2]).to.have.property('align', 'l')
		expect(bonds[3]).to.have.property('align', '')
	})

	it('dots', () => {
		let expr = ChemSys.compile('$dots(TBLR)Br')
		expect(expr.getMessage()).to.be.empty
		let items = extractItems(expr)
		expect(items[0].dots).to.be.eql([22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5])
	})

	it('itemColor', () => {
		let expr = ChemSys.compile('$itemColor(blue)H-O-$itemColor()H')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('[color=blue]H[/color]-[color=blue]O[/color]-H')
	})

	it('itemColor1', () => {
		let expr = ChemSys.compile('$itemColor1(blue)H-O-H')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('BB')).to.be.equal('[color=blue]H[/color]-O-H')
	})

	it('M: mass of next element', () => {
		let expr = ChemSys.compile('$M(16)O2')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.calcMass(expr)).to.be.equal(32)
		expect(expr.html()).to.be.equal('<sup>16</sup>O<sub>2</sub>')
	})

	it('nM: mass and atom number', () => {
		let expr = ChemSys.compile('$nM(235)U')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html()).to.be.equal('<span class="echem-mass-and-num">235<br/>92</span>U')
	})

	it('L', () => {
		let expr = ChemSys.compile('$L(2)/\\$L()|')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes[1].pt.y).to.be.closeTo(-1, precision)
		expect(nodes[1].pt.x).to.be.closeTo(Math.sqrt(3), precision)
		expect(nodes[2].pt.y).to.be.closeTo(0, precision)
		expect(nodes[2].pt.x).to.be.closeTo(2 * Math.sqrt(3), precision)
		expect(nodes[3].pt.y).to.be.closeTo(1, precision)
	})

	it('slope', () => {
		let expr = ChemSys.compile('$slope(45)/\\$slope()/\\')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		const Q2 = Math.sqrt(2)
		const Q22 = Q2 / 2
		const Q3 = Math.sqrt(3)
		const Q32 = Q3 / 2
		expect(nodes[1].pt.x).to.be.closeTo(Q22, precision)
		expect(nodes[1].pt.y).to.be.closeTo(-Q22, precision)
		expect(nodes[2].pt.x).to.be.closeTo(Q2, precision)
		expect(nodes[2].pt.y).to.be.closeTo(0, precision)
		expect(nodes[3].pt.x).to.be.closeTo(Q2 + Q32, precision)
		expect(nodes[3].pt.y).to.be.closeTo(-0.5, precision)
		expect(nodes[4].pt.x).to.be.closeTo(Q2 + Q3, precision)
		expect(nodes[4].pt.y).to.be.closeTo(0, precision)
	})

	it('ver', () => {
		let expr = ChemSys.compile('$ver(0.1)H2')
		let ver = ChemSys.ver()
		expect(expr.getMessage()).to.be.empty
		expr = ChemSys.compile('$ver(1.0)H2')
		expect(expr.getMessage()).to.be.empty
		expr = ChemSys.compile(`$ver(${ver[0] + 1}.0)H2`)
		expect(expr.getMessage()).to.be.ok
		expr = ChemSys.compile(`$ver(${ver[0]}.${ver[1] + 1})H2`)
		expect(expr.getMessage()).to.be.ok
		expr = ChemSys.compile('$ver(1)H2')	// ignore invalid params
		expect(expr.getMessage()).to.be.empty
	})


	it('Use constant in functions', () => {
		const L = 1.5
		let expr = ChemSys.compile('_(x%L:1.5)_(y%L)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes[1].pt.x).to.be.closeTo(L, precision)
		expect(nodes[2].pt.y).to.be.closeTo(L, precision)
	})

	it('Ignore unknown function', () => {
		let expr = ChemSys.compile('H2$xxx()O')
		expect(expr.getMessage()).to.be.empty
		expect(expr.html('text')).to.be.equal('H2O')
	})
})
