/**
 * Created by PeterWin on 28.04.2017.
 */

import {expect} from 'chai'
import ChemAtom from '../../src/core/ChemAtom'
import {MenTbl} from '../../src/core'

describe('ChemAtom', () => {

	it('Walk', () => {
		const Au = MenTbl.Au
		let id='', n=0, mass=0
		Au.walk({})	// need to coverage

		Au.walk({
			atom: obj => {
				id += obj.id
				n += obj.n
				mass += obj.M
			}
		})
		expect(id).to.be.equal('Au')
		expect(n).to.be.equal(79)
		expect(mass).to.be.equal(196.967)
	})

	it('Constructor', () => {
		const D = new ChemAtom(1, 'D', 2)
		expect(D.n).to.be.equal(1)
		expect(D.id).to.be.equal('D')
		expect(D.M).to.be.equal(2)
	})
})