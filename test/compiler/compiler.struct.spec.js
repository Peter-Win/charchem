/**
 * Testing of structures
 * Created by PeterWin on 07.05.2017.
 */
'use strict'

const {expect} = require('chai')
const {chemCompiler} = require('../../src/compiler/main')
const ChemSys = require('../../src/ChemSys')
const {extractBonds, extractNodes, precision} = require('../testUtils')
const {MenTbl} = require('../../src/core/MenTbl')

const Q32 = Math.sqrt(3) / 2

describe('Structural features of compiler', () => {

	it('Square', () => {
		let expr = chemCompiler('-|`-`|')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.calcMass(expr)).to.be.closeTo(56.108, precision)
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H8')

		let nodes = extractNodes(expr)
		expect(nodes[0].pt).to.be.eql({x: 0, y: 0})
		expect(nodes[1].pt.x).to.be.closeTo(1, precision)
		expect(nodes[1].pt.y).to.be.closeTo(0, precision)
		expect(nodes[2].pt.x).to.be.closeTo(1, precision)
		expect(nodes[2].pt.y).to.be.closeTo(1, precision)
		expect(nodes[3].pt.x).to.be.closeTo(0, precision)
		expect(nodes[3].pt.y).to.be.closeTo(1, precision)
	})

	it('Benzol', () => {
		let expr = chemCompiler('/\\\\|`//`\\`||')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.calcMass(expr)).to.be.closeTo(78.114, precision)
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C6H6')
	})

	it('Branch', () => {
		let expr = chemCompiler('-<|>-')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(4)
		expect(nodes[0].pt).to.be.eql({x: 0, y: 0})
		expect(nodes[1].pt).to.be.eql({x: 1, y: 0})
		expect(nodes[2].pt).to.be.eql({x: 1, y: 1})
		expect(nodes[3].pt).to.be.eql({x: 2, y: 0})
	})

	it('Branch (* *)', () => {
		let expr = chemCompiler('-(*|*)-')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(4)
		expect(nodes[0].pt).to.be.eql({x: 0, y: 0})
		expect(nodes[1].pt).to.be.eql({x: 1, y: 0})
		expect(nodes[2].pt).to.be.eql({x: 1, y: 1})
		expect(nodes[3].pt).to.be.eql({x: 2, y: 0})
	})

	it('Smart slope to 60 degr', () => {
		let expr = chemCompiler('-\\`/`-`\\/-/`\\`-`/\\')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C10H16')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(136.238, precision)

		let nodes = extractNodes(expr)
		expect(nodes[0].pt).to.be.eql({x: 0, y: 0})
		expect(nodes[1].pt).to.be.eql({x: 1, y: 0})
		expect(nodes[2].pt.x).to.be.closeTo(1.5, precision)
		expect(nodes[2].pt.y).to.be.closeTo(Q32, precision)
	})

	it('Smart slope to 60 degr (with previous correction)', () => {
		let expr = chemCompiler('\\`/')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes[1].pt.x).to.be.closeTo(0.5, precision)
		expect(nodes[1].pt.y).to.be.closeTo(Q32, precision)
		expect(nodes[2].pt.x).to.be.closeTo(0, precision)
		expect(nodes[2].pt.y).to.be.closeTo(2 * Q32, precision)
	})

	it('Bonds composition to make double bond', () => {
		let expr = chemCompiler('/`/')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C2H4')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(28.054, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(1)
		expect(bonds[0].N).to.be.equal(2)
	})

	it('Polygonal bonds', () => {
		let expr = chemCompiler('|_q3_qq3')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H4')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(40.065, precision)

		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(3)
		expect(nodes[0].pt).to.be.eql({x: 0, y: 0})
		expect(nodes[1].pt.x).to.be.closeTo(0, precision)
		expect(nodes[1].pt.y).to.be.closeTo(1, precision)
		expect(nodes[2].pt.x).to.be.closeTo(Q32, precision)
		expect(nodes[2].pt.y).to.be.closeTo(0.5, precision)
	})

	it('Simple polygonal bonds _p,_q', () => {
		let expr = chemCompiler('-_p_q')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(4)
		let pt = nodes[2].pt.subx(nodes[1].pt)
		expect(pt.polarAngle() * 180 / Math.PI).to.be.closeTo(72, precision)
		pt = nodes[3].pt.subx(nodes[2].pt)
		expect(pt.polarAngle() * 180 / Math.PI).to.be.closeTo(0, precision)
	})

	//       H(4) H(6)
	//       |    |
	//  H(0)-C(1)-C(2)-H(3)
	//       |    |
	//       H(5) H(7)
	it('Chains merge', () => {
		let expr = chemCompiler('H-C-C-H; H|#2|H; H|#3|H')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C2H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(30.07, precision)

		let nodes = extractNodes(expr)
		expect(nodes[0].sc).to.not.be.equal(nodes[1].sc)
		expect(nodes[1].sc).to.not.be.equal(nodes[2].sc)
		expect(nodes[2].sc).to.not.be.equal(nodes[3].sc)
		expect(nodes[4].sc).to.be.equal(nodes[1].sc)
		expect(nodes[5].sc).to.be.equal(nodes[1].sc)
		expect(nodes[6].sc).to.be.equal(nodes[2].sc)
		expect(nodes[7].sc).to.be.equal(nodes[2].sc)
	})

	it('Relative reference', () => {
		let expr = chemCompiler('-|;#-2-')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)
	})

	it('Named reference', () => {
		//  H3C-CH:ax-CH3
		//      |
		//      CH3
		let expr = chemCompiler('-:ax|;#ax-')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)
	})

	it('Atom reference', () => {
		let expr = chemCompiler('O\\`|_#O')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C2H4O')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(44.053, precision)

		expr = chemCompiler('H-C-H;H|#C|H')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('CH4')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(MenTbl.C.M + MenTbl.H.M * 4, precision)
	})

	it('Set center atom of item', () => {
		let expr = chemCompiler('|`OCH3')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C2H6O')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(46.069, precision)
		// find O item
		let item = null, lastAtom
		expr.walk({
			atom: elem => {
				lastAtom = elem.id
			},
			itemPost: obj => {
				if (lastAtom === 'O')
					item = obj
			},
		})
		expect(item).to.have.property('bCenter', true)
	})

	it('Ring bond', () => {
		let expr = chemCompiler('/\\|`/`\\`|_o')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C6H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(78.114, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(7)	// 6 simple bonds + 1 ring bond
		let ring = bonds[6]
		expect(ring.nodes).to.have.lengthOf(6)	// ring bond connect 6 nodes
		expect(ring.N).to.be.equal(1)
	})

	it('_s', () => {
		let expr = chemCompiler('/\\</>|`/`\\`|_s(S:)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C7H8')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(92.141, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(8)	// 6 simple bonds of benzol + 1 branch bond + 1 ring bond
		let ring = bonds[7]
		expect(ring.nodes).to.have.lengthOf(6)	// ring bond connect 6 nodes
		expect(ring.N).to.be.equal(1)
		expect(ring.style).to.be.equal(':')
	})
	it('_s with parameters', () => {
		let expr = chemCompiler('_(A-60,L1.4)_p6_p6_p6_p6_p6_s(#2:3;6:5;2,N.5)')
		// indexes 6;5 will be sorted
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C6H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(82.146, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(7)	// 6 simple bonds + 1 ring bond
		let ring = bonds[6]
		expect(ring.nodes).to.have.lengthOf(4)	// ring bond connect 4 nodes
		expect(ring.N).to.be.equal(0.5)
	})
	it('unclosed _s', () => {
		let expr = chemCompiler('`/`\\`|/\\_s()')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C6H8')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(80.13, precision)
	})

	it('Curved bond', () => {
		let expr = chemCompiler('/\\_m(y1)_m(x-$3)_(y-1)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(42.081, precision)
	})

	it('Use c character', () => {
		let expr = chemCompiler('//c/')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(42.081, precision)
	})
})

describe('Short bonds descriptions', () => {

	it('Doubles and triples', () => {
		let expr = chemCompiler('//\\///\\')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(4)
		expect(bonds[0]).to.have.property('N', 2)
		expect(bonds[2]).to.have.property('N', 3)
	})

	it('Coordinate bonds ->', () => {
		let expr = chemCompiler('|vv-vvv|v')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].arr0).to.be.ok
		expect(bonds[0].arr1).to.be.empty
		expect(bonds[1].arr0).to.be.ok
		expect(bonds[1].arr1).to.be.ok
		expect(bonds[2].arr0).to.be.empty
		expect(bonds[2].arr1).to.be.ok

		// invalid case
		expr = chemCompiler('/vvvv')
		bonds = extractBonds(expr)
		expect(bonds[0].arr0).to.be.ok
		expect(bonds[0].arr1).to.be.ok
	})

	it('Cross double bond', () => {
		let expr = chemCompiler('//x')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].align).to.be.equal('x')
	})

	it('Invisible bond', () => {
		let expr = chemCompiler('H^+\\0O`^-/H')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('H2O')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(18.015, precision)
		let bonds = extractBonds(expr)
		expect(bonds[0].N).to.be.equal(0)
	})

	it('w, d', () => {
		let expr = chemCompiler('/w\\ww/d\\dd')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].w0).to.be.equal(0)
		expect(bonds[0].w1).to.be.equal(1)
		expect(bonds[1].w0).to.be.equal(1)
		expect(bonds[1].w1).to.be.equal(0)
		expect(bonds[2].w0).to.be.equal(0)
		expect(bonds[2].w1).to.be.equal(-1)
		expect(bonds[3].w0).to.be.equal(-1)
		expect(bonds[3].w1).to.be.equal(0)
	})

	it('Racemic bond', () => {
		let expr = chemCompiler('/~')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].style).to.be.equal('~')
	})
})

describe('Universal bonds description', () => {

	it('x, y, w+', () => {
		let expr = chemCompiler('_(x1,y.5,w+)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(2)
		expect(nodes[1].pt).to.be.eql({x: 1, y: 0.5})
		let bonds = extractBonds(expr)
		expect(bonds[0]).to.have.property('w0', 0)
		expect(bonds[0]).to.have.property('w1', 1)
	})

	it('A, L, w-', () => {
		let expr = chemCompiler('_(A30,L2,w-)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(2)
		expect(nodes[1].pt.x).to.be.closeTo(Math.sqrt(3), precision)
		expect(nodes[1].pt.y).to.be.closeTo(1, precision)
		let bonds = extractBonds(expr)
		expect(bonds[0]).to.have.property('w0', 1)
		expect(bonds[0]).to.have.property('w1', 0)
	})

	it('Empty x and y: _(x)_(y)', () => {
		let expr = chemCompiler('_(x1,y)_(x,y1)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(3)
		expect(nodes[1].pt.x).to.be.closeTo(1, precision)
		expect(nodes[1].pt.y).to.be.closeTo(0, precision)
		expect(nodes[2].pt.x).to.be.closeTo(1, precision)
		expect(nodes[2].pt.y).to.be.closeTo(1, precision)
	})

	it('a, N', () => {
		let expr = chemCompiler('_(a-30)_(a60,N2)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(42.081, precision)
		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(3)
		expect(nodes[1].pt.x).to.be.closeTo(Q32, precision)
		expect(nodes[1].pt.y).to.be.closeTo(-0.5, precision)
		expect(nodes[2].pt.x).to.be.closeTo(Math.sqrt(3), precision)
		expect(nodes[2].pt.y).to.be.closeTo(0, precision)
		let bonds = extractBonds(expr)
		expect(bonds[1]).to.have.property('N', 2)
	})

	it('P, N2x', () => {
		let expr = chemCompiler('-_(P4,N2x)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(42.081, precision)

		let nodes = extractNodes(expr)
		expect(nodes).to.have.lengthOf(3)
		expect(nodes[2].pt.x).to.be.closeTo(1, precision)
		expect(nodes[2].pt.y).to.be.closeTo(1, precision)

		let bonds = extractBonds(expr)
		expect(bonds[1]).to.have.property('N', 2)
		expect(bonds[1]).to.have.property('align', 'x')
	})

	it('Polygonal bonds', () => {
		let expr = chemCompiler('_(P)_(P)_(P)_(P)_(Pa)')
		// _(Pa) - example of invalid value a of P parameter
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C5H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(70.135, precision)
		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(5)
	})

	it('CCW polygonal bond', () => {
		let expr = chemCompiler('-_(P-4,N2x)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C3H6')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(42.081, precision)

		let nodes = extractNodes(expr)
		expect(nodes[2].pt.x).to.be.closeTo(1, precision)
		expect(nodes[2].pt.y).to.be.closeTo(-1, precision)
	})

	it('d+, d2, d-', () => {
		let expr = chemCompiler('_(A-30,d+)_(x1,d2)_(A30,d-)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(3)
		expect(bonds[0]).to.have.property('w0', 0)
		expect(bonds[0]).to.have.property('w1', -1)
		expect(bonds[1]).to.have.property('w0', -1)
		expect(bonds[1]).to.have.property('w1', -1)
		expect(bonds[2]).to.have.property('w0', -1)
		expect(bonds[2]).to.have.property('w1', 0)
	})

	it('D+, D-', () => {
		let expr = chemCompiler('_(A-30,D+)_(x1)_(A30,D-)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(3)
		expect(bonds[0]).to.have.property('w0', 0)
		expect(bonds[0]).to.have.property('w1', -1)
		expect(bonds[1]).to.have.property('w0', -1)
		expect(bonds[1]).to.have.property('w1', -1)
		expect(bonds[2]).to.have.property('w0', -1)
		expect(bonds[2]).to.have.property('w1', 0)
	})

	it('Direct use standard width: w1, w0, w', () => {
		let expr = chemCompiler('_(A10,w2)_(A10,w1)O_(A10,w0)_(A90,w)')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0]).to.have.property('w0', 1)
		expect(bonds[0]).to.have.property('w1', 1)
		expect(bonds[1].w0).to.be.empty
		expect(bonds[1].w1).to.be.empty
		expect(bonds[2].w0).to.be.empty
		expect(bonds[2].w1).to.be.empty
		expect(bonds[3].w0).to.be.empty
		expect(bonds[3].w1).to.be.empty
	})

	it('Hydrogen bond', () => {
		let expr = chemCompiler('_(A-30,H)|h')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].style).to.be.equal(':')
		expect(bonds[1].style).to.be.equal(':')
	})

	it('Coordinated bonds', () => {
		let expr = chemCompiler('_(y1,C-)_(x1,C+)_(y-1,C)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(3)
		expect(bonds[0].arr0).to.be.ok
		expect(bonds[0].arr1).to.be.empty
		expect(bonds[1].arr0).to.be.ok
		expect(bonds[1].arr1).to.be.ok
		expect(bonds[2].arr0).to.be.empty
		expect(bonds[2].arr1).to.be.ok
	})

	it('Coordinated bonds with < >', () => {
		let expr = chemCompiler('_(y1,<)_(x1,<,>)_(y-1,>)')
		expect(expr.getMessage()).to.be.empty
		expect(ChemSys.makeBruttoKey(expr)).to.be.equal('C4H10')
		expect(ChemSys.calcMass(expr)).to.be.closeTo(58.124, precision)

		let bonds = extractBonds(expr)
		expect(bonds).to.have.lengthOf(3)
		expect(bonds[0].arr0).to.be.ok
		expect(bonds[0].arr1).to.be.empty
		expect(bonds[1].arr0).to.be.ok
		expect(bonds[1].arr1).to.be.ok
		expect(bonds[2].arr0).to.be.empty
		expect(bonds[2].arr1).to.be.ok
	})

	it('Racemic bond ~', () => {
		let expr = chemCompiler('_(x1,y1,~)')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].style).to.be.equal('~')
	})

	it('Bond styles and alignment', () => {
		let expr = chemCompiler('_(y1,S|:L)_(y1,S||M)_(y1,S:|R)_(y1,SI)')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].style).to.be.equal('|:')
		expect(bonds[0].align).to.be.equal('l')
		expect(bonds[1].style).to.be.equal('||')
		expect(bonds[1].align).to.be.equal('m')
		expect(bonds[2].style).to.be.equal(':|')
		expect(bonds[2].align).to.be.equal('r')
		expect(bonds[3].style).to.be.equal('I')
		expect(bonds[3].align).to.be.empty
	})

	//  0---1
	//       \
	//  4     2
	//    \  /
	//      3
	it('Use coordinates of another nodes by x, y', () => {
		let expr = chemCompiler('-\\`/_(x#1,y#-2)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		expect(nodes[4].pt.x).to.be.closeTo(nodes[0].pt.x, precision)
		expect(nodes[4].pt.y).to.be.closeTo(nodes[4 - 2].pt.y, precision)
	})

	//  0---1
	//       \
	//    4   2
	//     \ /
	//      3
	it('Use coordinates of another nodes by p', () => {
		let expr = chemCompiler('-\\`/_(p1;-1)')
		expect(expr.getMessage()).to.be.empty
		let nodes = extractNodes(expr)
		let midPt = nodes[0].pt.addx(nodes[3].pt).muli(0.5)
		expect(nodes[4].pt.x).to.be.closeTo(midPt.x, precision)
		expect(nodes[4].pt.y).to.be.closeTo(midPt.y, precision)
	})

	it('Use T argument', () => {
		let expr = chemCompiler('_(x1,T-)')
		expect(expr.getMessage()).to.be.empty
		let bonds = extractBonds(expr)
		expect(bonds[0].tx).to.be.equal('-')
	})
})
