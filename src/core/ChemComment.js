/**
 * Comment
 * For example "Anion"-SO4^2-
 * Created by PeterWin on 29.04.2017.
 */

const {ChemSubObj} = require('./ChemSubObj')

class ChemComment extends ChemSubObj
{
	/**
	 * @constructor
	 * @param {string} text of comment
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

module.exports = {ChemComment}
