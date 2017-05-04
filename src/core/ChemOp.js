/**
 * Chemical operation
 *     commentPre
 * CaCO3 --> CaO + CO2
 *     commentPost
 * Created by PeterWin on 01.05.2017.
 */

import ChemObj from './ChemObj'

export default class ChemOp extends ChemObj
{
	/**
	 * @constructor
	 * @param {string=} srcText, for example ->
	 * @param {string=} dstText, for ex →
	 * @param {boolean=false} bEq	sign of equation operation (=, ->, <=>)
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