/**
 * Chemical operation
 *     commentPre
 * CaCO3 --> CaO + CO2
 *     commentPost
 * Created by PeterWin on 01.05.2017.
 */

const ChemObj = require('../../src/core/ChemObj')

class ChemOp extends ChemObj
{
	/**
	 * @constructor
	 * @param {string=} srcText for example ->
	 * @param {string=} dstText for ex →
	 * @param {boolean=} bEq	default: false. sign of equation operation (=, ->, <=>)
	 * @return {void}
	 */
	constructor(srcText, dstText, bEq) {
		super()
		this.srcText = srcText
		this.dstText = dstText
		this.eq = !!bEq
		//this.commentPre=0;	// ChemComment objects
		//this.commentPost=0;
	}

	walk(visitor) {
		if (visitor.operation)
			return visitor.operation(this)
	}
}

module.exports = ChemOp