/**
 * Created by PeterWin on 29.04.2017.
 */

import {expect} from 'chai'
import ChemComment from '../../src/core/ChemComment'

describe('ChemComment', () => {

	it('Walk', () => {
		let commentItem = new ChemComment('Hello!')
		expect(commentItem.walk({ comm: obj => obj.tx })).to.be.equal('Hello!')
		expect(commentItem.walk({})).to.be.undefined
	})
})