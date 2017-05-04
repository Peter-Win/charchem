/**
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import {expect} from 'chai'

import ChemSys from '../src/ChemSys'

describe('ChemSys', () => {
	it('Check library version', () => {
		const config = require('../package.json')
		const sysVersion = ChemSys.verStr()
		// result of ChemSys.verStr() must be equal to version field in package.json
		expect(sysVersion).to.be.equal(config.version)
	})
})