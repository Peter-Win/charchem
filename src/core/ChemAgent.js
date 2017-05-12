/**
 * Created by PeterWin on 01.05.2017.
 */
'use strict'

export default class ChemAgent
{
	constructor() {
		/**
		 * Nodes
		 * @type {ChemNode[]}
		 */
		this.nodes = []

		/**
		 * Bonds
		 * @type {ChemBond[]}
		 */
		this.bonds = []

		/**
		 * Commands: nodes, bonds, brackets. Order same as in description
		 * Команды: узлы, связи, скобки в том порядке, в котором они следуют в описании
		 * @type {Array}
		 */
		this.cmds = []

		/**
		 * Quantity coefficient
		 * @type {number|string}
		 */
		this.n = 1

		/**
		 * Index of expression part. For expression H2 + O2 = H2O, H2 and O2 in part 0. H2O in part 1
		 * Номер части выражения, в которой находится агент. Если выражение H2 + O2 = H2O, то H2=O2=0, H2O=1
		 * @type {number}
		 */
		this.part = 0

	}

	walk(visitor) {
		let res, cmd, list = this.cmds
		if (visitor.agentPre) {
			res = visitor.agentPre(this)
			if (res)
				return res
		}
		for (cmd of list) {
			res = cmd.walk(visitor)
			if (res)
				break
		}
		if (visitor.agentPost)
			res = visitor.agentPost(this) || res
		return res
	}

}
