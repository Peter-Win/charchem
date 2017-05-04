/**
 * Chemical element or Atom
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import ChemSubObj from './ChemSubObj'

export default class ChemAtom extends ChemSubObj
{
	/**
	 * @constructor
	 * @param {int} atomicNumber
	 * @param {string} id
	 * @param {number} mass
	 */
	constructor(atomicNumber, id, mass) {
		super()
		this.n = atomicNumber		// Atomic number
		this.id = id	// Symbol of a chemical element: H, He, Li, Be...
		this.M = mass		// Atomic mass in Daltons
	}

	/**
	 * Call 'atom' method of visitor
	 * @param {Object} visitor
	 */
	walk(visitor) {
		if (visitor.atom)
			return visitor.atom(this);
	}
}