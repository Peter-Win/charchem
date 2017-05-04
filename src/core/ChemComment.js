/**
 * Comment
 * For example "Anion"-SO4^2-
 * Created by PeterWin on 29.04.2017.
 */
"use strict"

import ChemSubObj from './ChemSubObj'

export default class ChemComment extends ChemSubObj
{
	/**
	 * @constructor
	 * @param {string} text
	 */
	constructor(text) {
		super()
		this.tx = text
	}

	walk(visitor) {
		if (visitor.comm)
			return visitor.comm(this)
	}
}