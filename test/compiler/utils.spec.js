/**
 * Created by PeterWin on 08.05.2017.
 */
import { expect } from 'chai'
import { dashes, dots } from '../../src/compiler/utils'

const toNum = s => {
	s = +s
	if (isNaN(s))
		throw Error('Invalid value')
	return s
}

describe('dashes', () => {

	it('<>', () => {
		let list = dashes(['<>'], [0], toNum)
		expect(list).to.be.eql([45, 135, 225, 315])
	})

	it('|_-|', () => {
		let list = dashes(['|_-|'], [0], toNum)
		expect(list).to.be.eql([0, 90, 180, 270])
	})

	it('|.|', () => {
		let list = dashes(['|.|'], [0], toNum)
		expect(list).to.be.eql([0, 180])
	})

	it('/./', () => {
		let list = dashes(['/./'], [0], toNum)
		expect(list).to.be.eql([45, 225])
	})

	it('\\.\\', () => {
		let list = dashes(['\\.\\'], [0], toNum)
		expect(list).to.be.eql([135, 315])
	})

	it('Numbers', () => {
		let list = dashes(['10', '100', '175'], [0], toNum)
		expect(list).to.be.eql([10, 100, 175])
	})
})

describe('dots', () => {

	it('Full cycle: LRUB', () => {
		let list = dots(['LRUB'], [0], toNum)
		expect(list).to.be.eql([22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5])
	})
	it('Left & down: LdRdTlBl', () => {
		let list = dots(['LdRdTlBl'], [0], toNum)
		expect(list).to.be.eql([22.5, 112.5, 157.5, 247.5])
	})
	it('Right and top: LtRtTrBr', () => {
		let list = dots(['LtRtTrBr'], [0], toNum)
		expect(list).to.be.eql([67.5, 202.5, 292.5, 337.5])
	})
	it('Inversion', () => {
		let list = dots(['!LtRtTrBr'], [0], toNum)
		expect(list).to.be.eql([22.5, 112.5, 157.5, 247.5])
	})
	it('Numbers', () => {
		let list = dots(['0', '90', '180', '270'], [0], toNum)
		expect(list).to.be.eql([0, 90, 180, 270])
	})
	it('Invalid params', () => {
		expect(() => dots(['xxx'], [0], toNum)).to.throw(Error)
	})
	it('Invalid composition Lr', () => {
		let list = dots(['Lr'], [0], toNum)
		expect(list).to.be.eql([157.5, 202.5])	// Ups... invalid suffix r is ignored
	})
})
