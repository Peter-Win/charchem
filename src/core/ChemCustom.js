/**
 * Abstract component
 * For example: {R}-OH
 * Created by PeterWin on 29.04.2017.
 */
'use strict'

const ChemSubObj = require('./ChemSubObj')

class ChemCustom extends ChemSubObj
{
	/**
	 * @constructor
	 * @param {string} text		Text content of abstract component
	 */
	constructor(text) {
		super()
		this.tx = text
	}

	walk(visitor) {
		if (visitor.custom)
			return visitor.custom(this)
	}
}

module.exports = ChemCustom