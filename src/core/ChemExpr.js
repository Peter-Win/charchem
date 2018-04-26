/**
 * Chemical expression
 * Created by PeterWin on 28.04.2017.
 */
const {ChemObj} = require('../../src/core/ChemObj')
const {IsNonText} = require('../visitors/IsNonText')
const {TextMaker} = require('../visitors/TextMaker')

class ChemExpr extends ChemObj
{
	constructor() {
		super()

		/**
		 * Error
		 * @type {ChemError}
		 */
		this.error = null

		/**
		 * Source description
		 * @type {string}
		 */
		this.src0 = ''

		/**
		 * Description after preprocessing
		 * @type {string}
		 */
		this.src = ''

		/**
		 * Entities: reagents and operations
		 * @type {Array}
		 */
		this.ents = []
	}

	/**
	 * Check for success. If false, then an error.
	 * @returns {boolean} true, if valid expression
	 */
	isOk() {
		return !this.error
	}

	/**
	 * Extended error message. Empty string, if not error
	 * @returns {string} error message
	 */
	getMessage() {
		return this.error ? this.error.getMessage() : ''
	}

	/**
	 * Bypass the whole structure
	 * @param {Object} visitor visitor
	 * @returns {*} result
	 */
	walk(visitor) {
		let res, entity, entitiesList = this.ents,
			pre = visitor.entityPre,
			post = visitor.entityPost

		for (entity of entitiesList) {
			if (pre)
				res = visitor.entityPre(entity)

			res = res || entity.walk(visitor)

			if (post)
				res = visitor.entityPost(entity) || res

			if (res)
				return res
		}
	}

	/**
	 * Convert expression to html
	 * This shell for TextMaker visitor
	 * @param {Object<string,string>} rules default='html'|'text'|'BB' or rules object
	 * @returns {string} text formula, if possible. Else empty string
	 */
	html(rules) {
		if (this.isLinear()) {
			let textMaker = new TextMaker(rules)
			this.walk(textMaker)
			return textMaker.res()
		} else {
			return ''
		}
	}

	/**
	 * Convert expression to text
	 * This shell for TextMaker visitor
	 * @param {Object<string,string>} rules		default value='text', u can use ChemSys.rulesHTML
	 * @returns {string} text formula, if possible. Else empty string
	 */
	text(rules = 'text') {
		return this.html(rules)
	}

	/**
	 * Get source code for object
	 * (Text after preprocess)
	 * @param {ChemObj} obj Object
	 * @returns {string} source code of object
	 */
	getObjSrc(obj) {
		return this.src.slice(obj.pA, obj.pB)
	}

	// Является ли формула линейной (т.е. может быть представлена в виде html-текста)
	// добавлена для удобства и совместимости с предыдущей версией
	isLinear() {
		const isNonText = new IsNonText()
		this.walk(isNonText)
		return !isNonText.ok
	}

}

module.exports = {ChemExpr}
