/**
 * Chains system.
 * This is a part of CharChem compiler
 * Created 2015-05-26 by PeterWin
 */
'use strict'

/**
 * Create instance of sub chain
 * @constructor
 */
export function SubChain() {
	this.index = SubChain.s_next++
	/**
	 * private node list
	 * @type {ChemNode[]}
	 */
	let nodes = []

	/**
	 * Get nodes for this SubChain
	 * @returns {ChemNode[]}
	 */
	this.getNodes = () => nodes

	/**
	 * Set chain number for all nodes
	 * @param {number} nChain
	 */
	this.setCh = nChain =>
		nodes.forEach(node => node.ch = nChain)

	/**
	 * Find node by coordinates
	 * @param {Point} pt
	 * @returns {ChemNode|null}
	 */
	this.findByPt = pt =>
		nodes.find(node => node.pt.eq(pt)) || null

	/**
	 * Add node to sub chain
	 * @param {ChemNode} node
	 */
	this.addNode = node => {
		nodes.push(node)
		node.sc = this.index
	}

	this.delNode = function (node) {
		let i = nodes.length
		while (i > 0) {
			i--
			if (node === nodes[i]) {
				nodes.splice(i, 1)
				return
			}
		}
	}

	/**
	 * Add nodes list to NON-EMPTY SubChain!
	 * Coordiantes of added nodes moves to delta
	 * @param {ChemNode[]} srcNodes
	 * @param {Point} delta
	 */
	this.add = function (srcNodes, delta) {
		let node0 = nodes[0]	// SubChain must be non-empty!
		srcNodes.forEach(node => {
			node.pt.addi(delta)
			node.ch = node0.ch
			node.sc = node0.sc
			nodes.push(node)
		})
	}
}
SubChain.s_next = 1

// =========================================================
// Chain

export function Chain() {
	this.index = Chain.s_next++
	/**
	 * Current subChain
	 * @type {SubChain}
	 */
	let curSC = null

	/**
	 * Map of subChains by index
	 * @type {Object<number,SubChain>}
	 */
	let subChains = {}

	this.getLst = () => subChains

	/**
	 * Find node by coordinates in current subChain
	 * @param {Point} pt
	 * @returns {ChemNode|null}
	 */
	this.findByPt = pt => !curSC ? null : curSC.findByPt(pt)

	/**
	 * Add node to chain and it current subChain
	 * if current subChain is null, then create new subChain
	 * @param {ChemNode} node
	 */
	this.addNode = node => {
		if (!curSC) {
			curSC = new SubChain()
			subChains[curSC.index] = curSC
		}
		node.ch = this.index
		curSC.addNode(node)
	}

	/**
	 * Close current subChain and remove specified node into new subChain
	 * @param {ChemNode=} node
	 */
	this.closeSC = (node = null) => {
		if (curSC && node)
			curSC.delNode(node)
		curSC = null
		if (node) {
			this.addNode(node)
			node.pt.init(0, 0)
		}
	}

	/**
	 * get specified subChain
	 * @param {number} n
	 * @returns {SubChain|null}
	 */
	this.getSC = n => subChains[n]

	/**
	 * Get current subChain
	 * @returns {SubChain|null}
	 */
	this.getCurSC = () => curSC

	/**
	 * Set current subChain
	 * @param {SubChain} subChain
	 */
	this.setCur = subChain => {
		curSC = subChain
	}

	/**
	 * Delete subChain
	 * @param {number} index
	 * @returns {ChemNode[]|undefined}
	 */
	this.delSC = index => {
		let subChain = subChains[index]
		if (subChain) {
			delete subChains[index]
			return subChain.getNodes()
		}
	}

	/**
	 * add subChains list
	 * @param {Object<number,SubChain>} subChainsMap
	 */
	this.addLst = subChainsMap => {
		for (let key in subChainsMap) {
			let subChain = subChainsMap[key]
			subChains[subChain.index] = subChain
			subChain.setCh(this.index) // Assign a new chain number to the sub-chain nodes (the number of the sub-chain remains)
		}
	}
}
Chain.s_next = 1

// ==========================================================
// Chain system

export default class ChainSys {
	constructor() {
		/**
		 * Current chain
		 * @type {Chain}
		 */
		this.curCh = null

		/**
		 * Chains map
		 * @type {Object<number,Chain>}
		 */
		this.chains = {}
	}

	/**
	 * Add node to ChainSys
	 * @param {ChemNode} node
	 */
	addNode(node) {
		if (!this.curCh) {
			let chain = this.curCh = new Chain()
			this.chains[chain.index] = chain
		}
		this.curCh.addNode(node)
	}

	/**
	 * Search for an existing node by coordinates in the current chain and the current sub-chain
	 * @param pt
	 * @returns {*}
	 */
	findByPt(pt) {
		return this.curCh ? this.curCh.findByPt(pt) : null
	}

	/**
	 * Close the current sub-chain and move node to the new one
	 * @param {ChemNode} node
	 */
	closeSC(node) {
		if (this.curCh)
			this.curCh.closeSC(node)
	}

	closeChain() {
		this.curCh = 0
	}

	/**
	 * Set current chain by node, that owns it
	 * @param {ChemNode} node
	 */
	setCur(node) {
		let ch = this.curCh = this.chains[node.ch]
		ch.setCur(ch.getSC(node.sc))
	}

	/**
	 * get current sub-chain
	 * @returns {SubChain|null}
	 */
	getCurSC() {
		return this.curCh ? this.curCh.getCurSC() : null
	}

	/**
	 * Merge
	 * sub-cain srcSc deleted from it chain
	 * @param {ChemNode} srcNode
	 * @param {ChemNode} dstNode
	 * @param {ChemBond} bond
	 */
	merge(srcNode, dstNode, bond) {
		let nSrcCh = srcNode.ch, nSrcSc = srcNode.sc,
			nDstCh = dstNode.ch, nDstSc = dstNode.sc
		if (nSrcSc === nDstSc)
			return
		let
			srcCh = this.chains[nSrcCh],
			dstCh = this.chains[nDstCh]
			//srcSc = srcCh.getSC(nSrcSc),
		let dstSc = dstCh.getSC(nDstSc)

		// Для жесткой связи нужно присоединить исходную подцепь к конечной
		if (!bond.soft) {
			let pos1 = bond.calcPt()
			let delta = dstNode.pt.subx(pos1)
			dstSc.add(srcCh.delSC(nSrcSc), delta)
		}
		// Переместить все подцепи из srcCh в dstCh
		dstCh.addLst(srcCh.getLst())

		// Удалить исходную цепь
		delete this.chains[nSrcCh]
		// Сменить текущую цепь и подцепь
		this.curCh = dstCh
		dstCh.setCur(dstSc)
	}
}
