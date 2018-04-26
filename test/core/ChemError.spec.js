/**
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

const expect = require('chai').expect
const ChemError = require('../../src/core/ChemError')
const Lang = require('../../src/Lang')

describe('ChemError', () => {

	it('Language test', () => {
		let locDict = {en:{}, ru:{}}
		const msgKey = 'Expected [must] instead of [have]'
		locDict.en[msgKey] = 'Expected [must] instead of [have] in position [pos]'
		locDict.ru[msgKey] = 'Требуется [must] вместо [have] в позиции [pos]'
		Lang.addDict(locDict)
		let err = new ChemError(msgKey, {must:')', have:']', pos:5})
		let locale = Lang.curLang
		Lang.curLang = 'en'
		expect(err.getMessage()).to.be.equal('Expected ) instead of ] in position 5')
		Lang.curLang = 'ru'
		expect(err.getMessage()).to.be.equal('Требуется ) вместо ] в позиции 5')
		Lang.curLang = locale
	})

	it('Parent test', () => {
		let err = new ChemError('Hello!')
		expect(err).to.be.an.instanceOf(Error)
	})

})