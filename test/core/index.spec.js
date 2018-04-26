/**
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

const {expect} = require('chai')
const {isAbsK, massRound, MenTbl, MenTblArray} = require('../../src/core')

describe('Common core functions', () => {

	it('isAbsK', () => {
		expect(isAbsK(1)).to.be.false
		expect(isAbsK(0)).to.be.false
		expect(isAbsK(-1)).to.be.false
		expect(isAbsK(0.5)).to.be.false

		expect(isAbsK('n')).to.be.true
		expect(isAbsK('300-400')).to.be.true
		expect(isAbsK('3*n-1')).to.be.true
	})

	it('massRound', () => {
		expect(massRound(1)).to.be.equal(1)
		expect(massRound(1.000001)).to.be.equal(1)
		expect(massRound(0.999999)).to.be.equal(1)
		expect(massRound(1000.125)).to.be.equal(1000.125)	// 3 digits after.dot
		expect(massRound(1000.12528)).to.be.equal(1000.125)
	})

	it('Periodic table', () => {
		expect(MenTbl.H.n).to.be.equal(1)
		expect(MenTbl.He.n).to.be.equal(2)
		expect(MenTbl.Md.n).to.be.equal(101)
		expect(MenTbl.Md.M).to.be.equal(258)

		expect(MenTblArray[0].id).to.be.equal('H')
		expect(MenTblArray[1].id).to.be.equal('He')
		expect(MenTblArray[100].id).to.be.equal('Md')
	})
})
