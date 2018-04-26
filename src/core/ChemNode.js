/**
 * Node is a part of reagent.
 * For example, CH3-CH2-OH contains 3 nodes
 * Created by PeterWin on 30.04.2017.
 */

const {Point} = require('../math/Point')

class ChemNode
{
	constructor(pt = new Point()) {
		this.index = null	// index of node in CAgent.nodes array
		this.pt = pt	// node coordinates in subchain
		this.ch = 0		// chain number
		this.sc = 0		// subchain number
		this.bAuto = false	// auto node
		this.fixed = false	// fixed node

		/**
		 * node charge
		 * @type {ChemCharge}
		 */
		this.charge = null

		/**
		 * Example: node CH4 contains 2 items
		 * @type {ChemNodeItem[]}
		 */
		this.items = []

		/**
		 * bonds, what contains this node
		 * @type {ChemBond[]}
		 */
		this.bonds = []
	}

	/**
	 * get number charge value
	 * @returns {number} charge value
	 */
	chargeVal() {
		return this.charge ? this.charge.val : 0
	}

	walk(visitor) {
		let res, i = 0, lst = this.items
		if (visitor.nodePre) {
			res = visitor.nodePre(this)
			if (res)
				return res
		}
		while (i < lst.length && !res) {
			res = lst[i++].walk(visitor)
		}
		if (visitor.nodePost)
			res = visitor.nodePost(this) || res
		return res
	}

	/**
	 * Detect empty node
	 * @param {ChemNode} node object
	 * @returns {boolean} true, if empty node
	 */
	static isEmptyNode(node) {
		let bNonEmpty = 0
		const onComment = obj => {
			if (obj.tx !== '')
				return (bNonEmpty = 1)
		}
		const nonEmpty = () =>
			(bNonEmpty = 1)

		node.walk({
			atom: nonEmpty,
			radical: nonEmpty,
			custom: onComment,
			comm: onComment,
		})
		return !bNonEmpty
	} // isEmptyNode

}

module.exports = {ChemNode}
