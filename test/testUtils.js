/**
 * Created by PeterWin on 08.05.2017.
 */

export const precision = 0.001

/**
 * Get nodes list from expression
 * @param {ChemExpr} expr
 * @returns {ChemNode[]}
 */
export const extractNodes = expr => {
	let nodes = []
	expr.walk({
		nodePre: node => {
			nodes.push(node)
		}
	})
	return nodes
}

/**
 *
 * @param {ChemExpr} expr
 * @returns {ChemBond[]}
 */
export const extractBonds = expr => {
	let bonds = []
	expr.walk({
		bond: bondObj => {
			bonds.push(bondObj)
		}
	})
	return bonds
}

export const extractItems = expr => {
	let items = []
	expr.walk({
		itemPre: item => {
			items.push(item)
		}
	})
	return items
}

export const extractOps = expr => {
	let ops = []
	expr.walk({
		operation: op => {
			ops.push(op)
		}
	})
	return ops
}