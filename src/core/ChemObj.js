/**
 * Base class for all chemical objects
 * Supports information about the position of the object in the source description (usually after the preprocessor)
 * Created by PeterWin on 28.04.2017.
 */
'use strict'

class ChemObj
{
	/**
	 * @constructor
	 * @param {number=} a	Start position in description
	 * @param {number=} b	Finish position in description
	 */
	constructor(a = 0, b = 0) {
		this.pA = a
		this.pB = b
	}

	setPos(start, stop) {
		this.pA = start
		this.pB = stop
	}
}

module.exports = ChemObj