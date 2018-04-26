/**
 * Created by PeterWin on 10.05.2017.
 */
const {expect} = require('chai')
const {ChemSys} = require('../../src/ChemSys')
const {extractOps} = require('../testUtils')
const {ChemComment} = require('../../src/core/ChemComment')

describe('Compiler errors', () => {

	// Attantion! This case can be fixed in future versions of CharChem
	it('Function is not implemented', () => {
		let expr = ChemSys.compile('( K )')
		expect(expr.isOk()).to.be.false
	})

	it('Invalid middle point', () => {
		let expr = ChemSys.compile('|_m(x1)')
		let msg = expr.getMessage()
		expect(msg).to.have.string('Invalid middle point')
		expect(expr.error.params).to.have.property('pos', 2)
		expect(expr.error.params).to.have.property('pos1', 7)
	})

	it('Comment is not closed', () => {
		//                          1234567890
		let expr = ChemSys.compile('Br-"hello')
		expect(expr.isOk()).to.be.false
		expect(expr.error.msgId).to.have.string('Comment is not closed')
		expect(expr.error).to.have.deep.property('params.pos', 4)
	})

	it('It is necessary to close the bracket', () => {
		//                          1234567
		let expr = ChemSys.compile('$color(rgb(255,0,0)He')
		expect(expr.error.msgId).to.have.string('It is necessary to close the bracket')
		expect(expr.error.params).to.have.property('pos', 7)
	})

	it('Abstract koefficient is not closed', () => {
		//                          123456789
		let expr = ChemSys.compile("HO-(CH2)'n-CH3")
		expect(expr.isOk()).to.be.false
		expect(expr.error).to.have.deep.property('params.pos', 9)
		expect(expr.error.msgId).to.have.string('Abstract koefficient is not closed')
	})

	it('Unclosed bracket in oxidation definition', () => {
		//                          12345678
		let expr = ChemSys.compile('H(+1)2O(-2')
		expect(expr.isOk()).to.be.false
		expect(expr.error).to.have.deep.property('params.pos', 8)
		expect(expr.error.msgId).to.have.string('It is necessary to close the bracket')
	})

	it('Incorrect Greek letters in comments', () => {
		const testCase = comm => {
			let expr = ChemSys.compile(`CaCO3 "${comm}"--> CaO + CO2`)
			expect(expr.isOk()).to.be.ok	// Its not error
			let ops = extractOps(expr)
			expect(ops).to.have.lengthOf(2)
			expect(ops[0].commentPre).to.be.an.instanceof(ChemComment)
			expect(ops[0].commentPre).to.have.property('tx')
			return ops[0].commentPre.tx
		}
		expect(testCase('-[Delta]')).to.be.equal('-Δ')	// typical case
		expect(testCase('-[Delta')).to.be.equal('-[Delta')	// bracket did not closed
		expect(testCase('-[Something]')).to.be.equal('-[Something]')	// non-greek letter name in brackets
	})

	it('Incorrect translation phrases', () => {
		const testCase = comment => {
			let expr = ChemSys.compile('H{X}"' + comment + '"')
			expect(expr.isOk()).to.be.ok	// Its not error
			let commObj = expr.walk({
				comm: obj => obj,
			})
			expect(commObj).to.be.an.instanceOf(ChemComment)
			return commObj.tx
		}
		expect(testCase(', X = `Cl`, `Br`')).to.be.equal(', X = Chlorine, Bromine')	// correct case
		expect(testCase(', X = `Cl`, `Br')).to.be.equal(', X = Chlorine, Br')	// Expected last grave apostrof
		expect(testCase(', X = `Cl`, `Br1`')).to.be.equal(', X = Chlorine, Br1')	// No phrase with this key = Br1
	})

	it('Undefined variable', () => {
		//                          12345
		let expr = ChemSys.compile('_(x%Len)')	// Undefined variable len
		expect(expr.isOk()).to.be.false
		expect(expr.getMessage()).to.be.equal('Undefined variable Len')
		expect(expr.error.params).to.have.property('pos', 5)
	})

	it('Invalid operation', () => {
		//                          123
		let expr = ChemSys.compile('H ++')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.error.msgId).to.have.string('Unknown element character')
	})

	it('Branch error', () => {
		//                          1 2
		let expr = ChemSys.compile('\\<|/')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 2)
		expect(expr.error.msgId).to.have.string('It is necessary to close the branch')
	})

	it('Unclosed bracket', () => {
		let expr = ChemSys.compile('[')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 1)
		expect(expr.error.msgId).to.have.string('It is necessary to close the bracket')
	})

	it('Unclosed branch in brackets', () => {
		//                          123456789
		let expr = ChemSys.compile('--(C<||O)3--')	// assumed --(C<||O>)3--, but ) is lost
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 9)
		expect(expr.error.params).to.have.property('pos0', 5)
		expect(expr.error.msgId).to.have.string('Cant close bracket before branch')
	})

	it('Unclosed brackets in branch', () => {
		//                          1 23456789012
		let expr = ChemSys.compile('\\<|[CH23|OH>/')	// assumed \\<|[CH2]3|OH>/, but ] is lost
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 12)
		expect(expr.error.params).to.have.property('pos0', 4)
		expect(expr.error.msgId).to.have.string('Cant close branch before bracket')
	})

	it('Russian element character', () => {
		let expr = ChemSys.compile('Я')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 1)
		expect(expr.error.msgId).to.have.string('Russian element character')
	})

	it('Russian element character', () => {
		let expr = ChemSys.compile('Я')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 1)
		expect(expr.error.msgId).to.have.string('Russian element character')
	})

	it('Non-latin element character', () => {
		let expr = ChemSys.compile('Σ')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 1)
		expect(expr.error.msgId).to.have.string('Non-latin element character')
	})

	it('Invalid bracket close', () => {
		//                          1234
		let expr = ChemSys.compile('CH2]3')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 4)
		expect(expr.error.msgId).to.have.string('Invalid bracket close')
	})

	it('Invalid branch close', () => {
		//                          1234
		let expr = ChemSys.compile('CH2>3')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 4)
		expect(expr.error.msgId).to.have.string('Invalid branch close')
	})

	it('Expected ) instead of ]', () => {
		//                          12345
		let expr = ChemSys.compile('(CH2]3')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 5)
		expect(expr).to.have.deep.property('error.params.pos0', 1)
		expect(expr.getMessage()).to.have.string('Expected ) instead of ]')
	})

	it('Invalid middle point', () => {
		//                          123
		let expr = ChemSys.compile('|_m_m_(x-1)')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string("Expected '(' after _m")
	})

	it('Cant create ring', () => {
		//                          12
		let expr = ChemSys.compile('/_o')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 2)
		expect(expr.getMessage()).to.have.string('Cant create ring')
	})
	it('Cant close ring', () => {
		//                          12 34
		let expr = ChemSys.compile('/\\|_o')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 4)
		expect(expr.getMessage()).to.have.string('Cant close ring')
	})
	it('Invalid node reference', () => {
		let expr = ChemSys.compile('_#3')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string('Invalid node reference')

		expr = ChemSys.compile('_#-3')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string('Invalid node reference')

		expr = ChemSys.compile('_#a')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string('Invalid node reference \'a\'')
	})

	it('Unknown element', () => {
		let expr = ChemSys.compile('H-Ab')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string("Unknown element 'Ab'")
	})

	it('Function without brackets', () => {
		let expr = ChemSys.compile('H$color|O')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.getMessage()).to.have.string("Expected '(' after $")
	})

	it('Abstract element is not closed', () => {
		//                          1234
		let expr = ChemSys.compile('HO-{R-OH')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 4)
		expect(expr.error.msgId).to.have.string('Abstract element is not closed')
	})
	it('Expected node declaration before charge', () => {
		//                          12
		let expr = ChemSys.compile('-^+')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 2)
		expect(expr.error.msgId).to.have.string('Expected node declaration before charge')
	})
	it('Invalid charge declaration', () => {
		//                          123
		let expr = ChemSys.compile('H^')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 3)
		expect(expr.error.msgId).to.have.string('Invalid charge declaration')
	})
	it("Expected '(' after s", () => {
		//                          12345
		let expr = ChemSys.compile('|-_s')
		expect(expr.isOk()).to.be.false
		expect(expr).to.have.deep.property('error.params.pos', 5)
		expect(expr.getMessage()).to.have.string("Expected '(' after s")
	})
})
