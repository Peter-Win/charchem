/**
 * Chemical expression
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import ChemObj from './ChemObj'

export default class ChemExpr extends ChemObj
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
		this.src = '';

		/**
		 * Entities: reagents and operations
		 * @type {Array}
		 */
		this.ents = []
	}

	/**
	 * Check for success. If false, then an error.
	 * @returns {boolean}
	 */
	isOk() {
		return !this.error
	}

	/**
	 * Extended error message. Empty string, if not error
	 * @returns {string}
	 */
	getMessage() {
		return this.error ? this.error.getMessage() : ''
	}

	/**
	 * Bypass the whole structure
	 * @param {Object} visitor
	 * @returns {*}
	 */
	walk(visitor) {
		let res, entity, entitiesList=this.ents,
			pre = visitor.entityPre,
			post = visitor.entityPost

		for (entity of entitiesList) {
			if (pre)
				res = visitor.entityPre(entity);

			res = res || entity.walk(visitor);

			if (post)
				res = visitor.entityPost(entity) || res;

			if (res)
				return res;
		}
	}

	/**
	 * Convert expression to html
	 * This shell for TextMaker visitor
	 * @returns {string}
	 */
	html() {
		if (this.isLinear()) {
			var textMaker = new TextMaker();
			this.walk(textMaker);
			return textMaker.res();
		} else {
			return '';
		}
	}

	/**
	 * Get source code for object
	 * (Text after preprocess)
	 * @returns {string}
	 */
	getObjSrc(obj) {
		return this.src.slice(obj.pA, obj.pB);
	}

}
