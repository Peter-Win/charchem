/**
 * Item of node
 * This is shell, containing internal object. Usually, ChemAtom
 * NodeItem have koefficient and charge
 * Created by PeterWin on 29.04.2017.
 */
'use strict'

const ChemObj = require('../../src/core/ChemObj')

class ChemNodeItem extends ChemObj
{
	/**
	 * @constructor
	 * @param {ChemSubObj} obj Atom, Radical, Comment or Custom
	 */
	constructor(obj) {
		super()
		/**
		 * sub object
		 * @type {ChemSubObj}
		 */
		this.obj = obj

		/**
		 * Koefficient. Can be string for abstract component H'n'
		 * @type {number|string}
		 */
		this.n = 1

		/**
		 * Charge
		 * @type {number}
		 */
		this.charge = 0

		/**
		 * Special mass.
		 * If specified, then ignore mass of sub object
		 * @type {number}
		 */
		this.M = 0

		//this.atomNum = 0;	//0/1 - признак вывода атомного номера (для ядерных реакций)
		//this.color = 0;	// общий цвет
		//this.atomColor = 0;	// цвет атомов
		//this.bCenter = 0;	// Необяз. признак приоритетности элемента, задаваемый при помощи обратного апострофа: H3C`O|
		//this.dots = [];
		//this.dashes = [];
	}

	walk(visitor) {
		let res
		if (visitor.itemPre) {
			res = visitor.itemPre(this)
			if (res)
				return res
		}
		res = this.obj.walk(visitor)
		if (visitor.itemPost)
			res = visitor.itemPost(this) || res
		return res
	}
}

module.exports = ChemNodeItem