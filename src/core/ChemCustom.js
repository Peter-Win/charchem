/**
 * Abstract component
 * For example: {R}-OH
 * Created by PeterWin on 29.04.2017.
 */
"use strict"

import ChemSubObj from './ChemSubObj'

export default class ChemCustom extends ChemSubObj
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
