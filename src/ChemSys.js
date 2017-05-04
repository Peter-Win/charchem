/**
 * Created by PeterWin on 27.04.2017.
 */
"use strict"

import {MenTbl} from './core'
import {chemCompiler} from './compiler'
import ChemAtom from './core/ChemAtom'

// Extended elements list
const extElems = {
	D: new ChemAtom(1, 'D', 2)	// Deiterium - $M(2)H
}


const ChemSys = new function ()
{
	this.ver = function() {
		// This values must be equal to version in package.json
		return [1, 1, 2]
	}
	this.verStr = function() {
		return this.ver().join('.')
	}

	// Roman numerals for the designation of charges
	this.RomanNum = {i:1, ii:2, iii:3, iv:4, v:5, vi:6, vii:7, viii:8}

	// Compiler
	this.compile = chemCompiler

	/**
	 * Search for an element by its symbolic designation
	 * If found, then result ChemAtom, else undefined
	 * @param {string} id
	 * @returns {ChemAtom|undefined}
	 */
	this.findElem = function(id) {
		return MenTbl[id] || extElems[id];
	}

};

export default ChemSys