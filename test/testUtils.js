/**
 * Created by PeterWin on 08.05.2017.
 */


const precision = 0.001

/**
 * Get nodes list from expression
 * @param {ChemExpr} expr Expression or Agent
 * @returns {ChemNode[]} list of nodes
 */
const extractNodes = expr => {
	let nodes = []
	expr.walk({
		nodePre: node => {
			nodes.push(node)
		},
	})
	return nodes
}

/**
 * Get bonds list
 * @param {ChemExpr} expr Expression or Agent
 * @returns {ChemBond[]} bondst list
 */
const extractBonds = expr => {
	let bonds = []
	expr.walk({
		bond: bondObj => {
			bonds.push(bondObj)
		},
	})
	return bonds
}

const extractItems = expr => {
	let items = []
	expr.walk({
		itemPre: item => {
			items.push(item)
		},
	})
	return items
}

const extractOps = expr => {
	let ops = []
	expr.walk({
		operation: op => {
			ops.push(op)
		},
	})
	return ops
}

module.exports = {
	precision,
	extractNodes,
	extractBonds,
	extractItems,
	extractOps,
}
