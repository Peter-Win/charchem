/**
 * Created by PeterWin on 28.04.2017.
 */

const {expect} = require('chai')
const {ChemCharge} = require('../../src/core/ChemCharge')

describe('ChemCharge', () => {

	it('Invalid value', () => {
		expect(ChemCharge.create()).to.be.null
		expect(ChemCharge.create('')).to.be.null
		expect(ChemCharge.create(null)).to.be.null
		expect(ChemCharge.create('bla-bla')).to.be.null
	})

	it('One or more minuses: O^--', () => {
		const ch = ChemCharge.create('-')
		expect(ch.val).to.be.equal(-1)

		const ch2 = ChemCharge.create('--')
		expect(ch2.val).to.be.equal(-2)

		const ch3 = ChemCharge.create('---')
		expect(ch3.val).to.be.equal(-3)
	})

	it('One or more pluses: Zn^++', () => {
		const ch = ChemCharge.create('+')
		expect(ch.val).to.be.equal(1)

		const ch2 = ChemCharge.create('++')
		expect(ch2.val).to.be.equal(2)

		const ch3 = ChemCharge.create('+++')
		expect(ch3.val).to.be.equal(3)
	})

	it('A number with a plus or minus front: S^+6, O^-2', () => {
		expect(ChemCharge.create('-1').val).to.be.equal(-1)
		expect(ChemCharge.create('+1').val).to.be.equal(1)
		expect(ChemCharge.create('-2').val).to.be.equal(-2)
		expect(ChemCharge.create('+2').val).to.be.equal(2)
		expect(ChemCharge.create('-6').val).to.be.equal(-6)
		expect(ChemCharge.create('+6').val).to.be.equal(6)
	})

	it('A number with plus or minus behind: Ca^2+, PO4^3-', () => {
		expect(ChemCharge.create('1-').val).to.be.equal(-1)
		expect(ChemCharge.create('1+').val).to.be.equal(1)
		expect(ChemCharge.create('2-').val).to.be.equal(-2)
		expect(ChemCharge.create('2+').val).to.be.equal(2)
		expect(ChemCharge.create('6-').val).to.be.equal(-6)
		expect(ChemCharge.create('6+').val).to.be.equal(6)
	})

	it('Rounded + and -', () => {
		const chm = ChemCharge.create('-o')
		expect(chm.val).to.be.equal(-1)
		expect(chm.tx).to.be.equal('-')
		expect(chm.bRound).to.be.true

		const chp = ChemCharge.create('+o')
		expect(chp.val).to.be.equal(1)
		expect(chp.tx).to.be.equal('+')
		expect(chp.bRound).to.be.true
	})

	it('Roman numbers', () => {
		const ch1 = ChemCharge.create('i')	// I
		expect(ch1.val).to.be.equal(1)
		expect(ch1.tx).to.be.equal('I')

		const ch4 = ChemCharge.create('iv')	// IV
		expect(ch4.val).to.be.equal(4)
		expect(ch4.tx).to.be.equal('IV')

		const ch6 = ChemCharge.create('vi')	// VI
		expect(ch6.val).to.be.equal(6)
		expect(ch6.tx).to.be.equal('VI')
	})
})