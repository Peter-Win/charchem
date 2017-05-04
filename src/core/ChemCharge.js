/**
 * Chemical charge
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import ChemSys from '../ChemSys'

export default class ChemCharge
{
	/**
	 * Attention!
	 * Do not try to call the constructor directly! Use a static function ChemCharge.create()
	 * @constructor
	 */
	constructor() {
		/**
		 * Text description, for example: '2+'
		 * @type {string}
		 */
		this.tx = ''

		/**
		 * number value, for example: 2
		 * @type {number}
		 */
		this.val = 0

		/**
		 * ⁺N
		 * @type {boolean}
		 */
		this.bLeft = false

		/**
		 * A sign of drawing a charge inside a circle
		 * @type {boolean}
		 */
		this.bRound = false
	}

	/**
	 * Create charge object from text description
	 * @param {string} text	Examples: - + -- ++
	 * @returns {ChemCharge|null}
	 */
	static create(text) {

		const makeCharge = (value, bRound, tx) => {
			let charge = new ChemCharge()
			charge.tx = tx || text
			charge.val = +value
			charge.bRound = !!bRound
			return charge
		}

		if (text && typeof text === 'string') {
			text = text.replace(/–/g,'-')	// Replace similar characters
			let len = text.length
			if (/^-+$/.test(text))	// One or more minuses:	O^--
				return makeCharge(-len)

			if (/^\++$/.test(text))	// One or more pluses: Zn^++
				return makeCharge(len)

			if (/(^|(^[-+]))\d+$/.test(text))	// A number with a plus or minus front: S^+6, O^-2
				return makeCharge(text)

			if (/^\d+[-+]$/.test(text))		// A number with plus or minus behind: Ca^2+, PO4^3-
				return makeCharge(text.charAt(len-1)+text.slice(0, -1));

			if (text=='+o') {
				return makeCharge(1,1,'+');
			}
			if (text=='-o') {
				return makeCharge(-1,1,'-');
			}
			var v = ChemSys.RomanNum[text];
			if (v) {
				text = text.toUpperCase();
				return makeCharge(v);
			}
		}
		return null
	}
}
