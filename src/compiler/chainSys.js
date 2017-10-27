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
function SubChain() {
	this.index = SubChain.s_next++
	/**
	 * private node list
	 * @type {ChemNode[]}
	 */
	const nodes = []

	/**
	 * Get nodes for this SubChain
	 * @returns {ChemNode[]} nodes list
	 */
	this.getNodes = () => nodes

	/**
	 * Set chain number for all nodes
	 * @param {number} nChain chain number
	 * @return {void}
	 */
	this.setCh = nChain =>
		nodes.forEach(node => node.ch = nChain)

	/**
	 * Find node by coordinates
	 * @param {Point} pt point
	 * @returns {ChemNode|null} node or null, if not found
	 */
	this.findByPt = pt =>
		nodes.find(node => node.pt.eq(pt)) || null

	/**
	 * Add node to sub chain
	 * @param {ChemNode} node node
	 * @return {void}
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
	 * @param {ChemNode[]} srcNodes nodes list
	 * @param {Point} delta delta
	 * @return {void}
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

function Chain() {
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
	 * @param {Point} pt coordinates
	 * @returns {ChemNode|null} node or null, if not found
	 */
	this.findByPt = pt => !curSC ? null : curSC.findByPt(pt)

	/**
	 * Add node to chain and it current subChain
	 * if current subChain is null, then create new subChain
	 * @param {ChemNode} node node
	 * @return {void}
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
	 * @param {ChemNode=} node for remove
	 * @return {void}
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
	 * @param {number} n index of subChain
	 * @returns {SubChain|null} subChain
	 */
	this.getSC = n => subChains[n]

	/**
	 * Get current subChain
	 * @returns {SubChain|null} current subChain or null
	 */
	this.getCurSC = () => curSC

	/**
	 * Set current subChain
	 * @param {SubChain} subChain subChain
	 * @return {void}
	 */
	this.setCur = subChain => {
		curSC = subChain
	}

	/**
	 * Delete subChain
	 * @param {number} index of deleted subChain
	 * @returns {ChemNode[]|undefined} nodes of deleted subChain
	 */
	this.delSC = index => {
		const subChain = subChains[index]
		if (subChain) {
			delete subChains[index]
			return subChain.getNodes()
		}
	}

	/**
	 * add subChains list
	 * @param {Object<number,SubChain>} subChainsMap map
	 * @return {void}
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

class ChainSys {
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
	 * @param {ChemNode} node added node
	 * @return {void}
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
	 * @param {Point} pt coordinates
	 * @returns {ChemNode|null} node or null, if not found
	 */
	findByPt(pt) {
		return this.curCh ? this.curCh.findByPt(pt) : null
	}

	/**
	 * Close the current sub-chain and move node to the new one
	 * @param {ChemNode} node node
	 * @return {void}
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
	 * @param {ChemNode} node node
	 * @return {void}
	 */
	setCur(node) {
		let ch = this.curCh = this.chains[node.ch]
		ch.setCur(ch.getSC(node.sc))
	}

	/**
	 * get current sub-chain
	 * @returns {SubChain|null} sub-chain
	 */
	getCurSC() {
		return this.curCh ? this.curCh.getCurSC() : null
	}

	/**
	 * Merge
	 * sub-cain srcSc deleted from it chain
	 * @param {ChemNode} srcNode source node
	 * @param {ChemNode} dstNode destination node
	 * @param {ChemBond} bond bond
	 * @return {void}
	 */
	merge(srcNode, dstNode, bond) {
		const nSrcCh = srcNode.ch, nSrcSc = srcNode.sc,
			nDstCh = dstNode.ch, nDstSc = dstNode.sc
		if (nSrcSc === nDstSc)
			return
		const
			srcCh = this.chains[nSrcCh],
			dstCh = this.chains[nDstCh]
			//srcSc = srcCh.getSC(nSrcSc),
		const dstSc = dstCh.getSC(nDstSc)

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

module.exports = {
	SubChain,
	Chain,
	ChainSys,
}