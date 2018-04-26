/**
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

const {expect} = require('chai')
const {Lang} = require('../src/Lang')

describe('Lang', () => {

	it('Translate', () => {
		let locale = Lang.curLang
		Lang.curLang = 'en'
		expect(Lang.tr('Md')).to.be.equal('Mendelevium')
		expect(Lang.tr('Md', 0, 'ru')).to.be.equal('Менделеевий')
		Lang.curLang = locale
	})

	it('Add dictionary', () => {
		const msgKey = 'Hello!'

		expect(Lang.tr(msgKey, 0, 'ru')).to.be.equal(msgKey)
		expect(Lang.tr(msgKey, 0, 'it')).to.be.equal(msgKey)

		let locDict = {
			ru: {[msgKey]: 'Привет!'},
			it: {[msgKey]: 'Ciao!'},
			cs: {[msgKey]: 'Ahoj!'},
		}
		Lang.addDict(locDict)
		let locale = Lang.curLang
		Lang.curLang = 'en'

		expect(Lang.tr(msgKey)).to.be.equal('Hello!')
		expect(Lang.tr(msgKey, 0, 'en-US')).to.be.equal('Hello!')
		expect(Lang.tr(msgKey, 0, 'ru')).to.be.equal('Привет!')
		expect(Lang.tr(msgKey, 0, 'it')).to.be.equal('Ciao!')
		expect(Lang.tr(msgKey, 0, 'cs')).to.be.equal('Ahoj!')

		expect(Lang.tr('H')).to.be.equal('Hydrogen')	// The previous values did not change.

		Lang.curLang = locale
	})

	it('China dialect', () => {
		let oldLocale = Lang.curLang
		Lang.init('en')
		Lang.addDict({
			'zh': {$Native: '中文（简体）'},		// Chinese (Simplified)
			'zh-tw': {$Native: '中文（繁體）'},	// traditional Chinese
		})
		expect(Lang.tr('$Native', 0, 'zh-tw')).to.be.equal('中文（繁體）')	// Chinese - Taiwan
		expect(Lang.tr('$Native', 0, 'zh')).to.be.equal('中文（简体）')	// Chinese (Simplified)
		expect(Lang.tr('$Native', 0, 'zh-cn')).to.be.equal('中文（简体）')	// Chinese - China
		expect(Lang.tr('$Native', 0, 'zh-cn')).to.be.equal('中文（简体）')	// Chinese - Singapore
		expect(Lang.tr('$Native')).to.be.equal('English')	// Current language not changed
		Lang.init(oldLocale)
	})

	it('init', () => {
		Lang.init({browserLanguage:'ru'})
		expect(Lang.tr('Li')).to.be.equal('Литий')

		Lang.init({userLanguage: 'en'})
		expect(Lang.tr('C')).to.be.equal('Carbon')

		Lang.init({})
		expect(Lang.tr('N')).to.be.equal('Nitrogen')

		Lang.init()
		expect(Lang.tr('O')).to.be.equal('Oxygen')

		Lang.init('RU-RU')	// RU-RU transformed to ru
		expect(Lang.tr('F')).to.be.equal('Фтор')

		Lang.init('my')	// Myanmar language is not supported -> use English
		expect(Lang.tr('Na')).to.be.equal('Sodium')
	})
})

