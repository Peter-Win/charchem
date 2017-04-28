/**
 * Created by PeterWin on 27.04.2017.
 */

import {expect} from 'chai'
import {isAbsK} from '../../src/core'

describe('isAbsK', () => {
	expect(isAbsK(1)).to.be.false
	expect(isAbsK(0)).to.be.false
	expect(isAbsK(-1)).to.be.false
	expect(isAbsK(0.5)).to.be.false

	expect(isAbsK('n')).to.be.true
	expect(isAbsK('300-400')).to.be.true
	expect(isAbsK('3*n-1')).to.be.true
})