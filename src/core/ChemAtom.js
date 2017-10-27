/**
 * Chemical element or Atom
 * Created by PeterWin on 28.04.2017.
 */
'use strict'

const ChemSubObj = require('./ChemSubObj')

class ChemAtom extends ChemSubObj
{
	/**
	 * @constructor
	 * @param {int} atomicNumber number of atom
	 * @param {string} id	Symbol of a chemical element: H, He, Li, Be...
	 * @param {number} mass		atomic mass in Daltons
	 */
	constructor(atomicNumber, id, mass) {
		super()
		this.n = atomicNumber		// Atomic number
		this.id = id	// Symbol of a chemical element: H, He, Li, Be...
		this.M = mass		// Atomic mass in Daltons
	}

	/**
	 * Call 'atom' method of visitor
	 * @param {Object} visitor visitor
	 * @return {void}
	 */
	walk(visitor) {
		if (visitor.atom)
			return visitor.atom(this)
	}
}

module.exports = ChemAtom