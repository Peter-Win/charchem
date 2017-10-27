/**
 * Created by PeterWin on 05.05.2017.
 */
'use strict'

const {expect} = require('chai')
const {ChainSys, SubChain, Chain} = require('../../src/compiler/chainSys')
const ChemBond = require('../../src/core/ChemBond')
const ChemNode = require('../../src/core/ChemNode')
const Point = require('../../src/math/Point')

describe('SubChain', () => {
	it('addNode / delNode', () => {
		// create sub chain
		const subChain = new SubChain()

		// add node
		const node0 = new ChemNode()
		subChain.addNode(node0)
		expect(node0.sc).to.be.equal(subChain.index)
		expect(subChain.getNodes()).to.have.lengthOf(1)
		expect(subChain.getNodes()[0]).to.be.equal(node0)

		// add second node
		const node1 = new ChemNode()
		subChain.addNode(node1)
		expect(subChain.getNodes()).to.have.lengthOf(2)
		expect(subChain.getNodes()[1]).to.be.equal(node1)

		// delete second node
		subChain.delNode(node0)
		expect(subChain.getNodes()).to.have.lengthOf(1)
		// delete again - no effect
		subChain.delNode(node0)
		expect(subChain.getNodes()).to.have.lengthOf(1)

		subChain.delNode(node1)
		expect(subChain.getNodes()).to.have.lengthOf(0)

		const subChain2 = new SubChain()
		expect(subChain.index).to.not.be.equal(subChain2.index)
	})

	it('setCh: set chain number', () => {
		const subChain = new SubChain()
		subChain.addNode(new ChemNode())
		subChain.addNode(new ChemNode())
		subChain.getNodes().forEach(node => expect(node.ch).to.be.equal(0))
		// set chain number
		subChain.setCh(22)
		subChain.getNodes().forEach(node => expect(node.ch).to.be.equal(22))
	})

	it('findByPt', () => {
		const subChain = new SubChain()
		const node0 = new ChemNode(new Point(1, 1))
		subChain.addNode(node0)
		const node1 = new ChemNode(new Point(2, 2))
		subChain.addNode(node1)

		expect(subChain.findByPt(new Point(1, 1))).to.be.equal(node0)
		expect(subChain.findByPt(new Point(2, 2))).to.be.equal(node1)
		expect(subChain.findByPt(new Point(3, 3))).to.not.be.ok
	})

	it('add nodes list', () => {
		const subChain = new SubChain()
		const node0 = new ChemNode(new Point(1, 1))
		subChain.addNode(node0)
		subChain.setCh(36)

		const list = [new ChemNode(new Point()), new ChemNode(new Point(1, 1))]
		subChain.add(list, new Point(2, 0))

		expect(subChain.getNodes()).to.have.lengthOf(3)
		subChain.getNodes().forEach(node => {
			expect(node.ch).to.be.equal(node0.ch)
			expect(node.sc).to.be.equal(node0.sc)
		})
		expect(list[0].pt).to.be.eql({x: 2, y: 0})
		expect(list[1].pt).to.be.eql({x: 3, y: 1})
	})
})

// ------------------- Chain

describe('Chain', () => {

	it('findByPt', () => {
		const chain = new Chain()
		expect(chain.findByPt(new Point(1, 1))).to.not.be.ok

		const node0 = new ChemNode(new Point(1, 1))
		const node1 = new ChemNode(new Point(2, 2))
		chain.addNode(node0)
		chain.addNode(node1)

		expect(chain.getCurSC()).to.be.ok
		expect(chain.getCurSC().getNodes()).to.have.lengthOf(2)
		expect(node1.sc).to.be.equal(chain.getCurSC().index)
		expect(node1.ch).to.be.equal(chain.index)

		expect(chain.findByPt(new Point(2, 2))).to.be.equal(node1)
	})

	it('closeSC: close subChain', () => {
		// Create chain with 1 sub-chain and 2 nodes
		const chain = new Chain()
		const node0 = new ChemNode(new Point(1, 1))
		const node1 = new ChemNode(new Point(2, 2))
		chain.addNode(node0)
		chain.addNode(node1)

		// node0 and node1 now in same subChain
		expect(node0.sc).to.be.equal(node1.sc)

		// make second sub-chain
		chain.closeSC(node1)
		// node0 and node1 now in different subChains
		expect(node0.sc).to.not.be.equal(node1.sc)
		expect(node1.pt).to.be.eql({x: 0, y: 0})	// and coordinates of node1 set to {0,0}

		// closeSC without node
		chain.closeSC()
		expect(chain.getCurSC()).to.not.be.ok

		// check count of sub-chains
		const keys = Object.keys(chain.getLst())
		expect(keys).to.have.lengthOf(2)
	})

	it('getSC: get subChain', () => {
		const chain = new Chain()
		const node0 = new ChemNode(new Point(1, 1))
		const node1 = new ChemNode(new Point(2, 2))
		chain.addNode(node0)
		chain.closeSC(node1)

		const subChain0 = chain.getSC(node0.sc)
		const subChain1 = chain.getSC(node1.sc)
		expect(subChain0).to.not.be.equal(subChain1)

		expect(chain.getSC(node1.sc + 1)).to.not.be.ok
	})

	it('setCur: set current subChain', () => {
		const chain = new Chain()
		const node0 = new ChemNode(new Point())
		const node1 = new ChemNode(new Point())
		chain.addNode(node0)	// add node to chain
		const subChain0 = chain.getCurSC()	// save subChain
		chain.closeSC()			// close current subChain
		chain.addNode(node1)	// add node1

		expect(chain.getCurSC()).to.not.be.equal(subChain0)

		chain.setCur(chain.getSC(node0.sc))	// set current subChain from node0
		expect(chain.getCurSC()).to.be.equal(subChain0)
	})

	it('delSC: delete subChain', () => {
		const chain = new Chain()
		const node0 = new ChemNode()
		chain.addNode(node0)
		const subChainIndex = chain.getCurSC().index

		expect(chain.delSC(subChainIndex)).to.have.deep.property('[0]', node0)
		expect(chain.getSC(subChainIndex)).to.not.be.ok
		expect(chain.delSC(subChainIndex)).to.not.be.ok
	})

	it('addLst', () => {
		const chain = new Chain()
		const node0 = new ChemNode(), node1 = new ChemNode()
		const subChain0 = new SubChain(), subChain1 = new SubChain()
		subChain0.addNode(node0)
		subChain1.addNode(node1)
		chain.addLst([subChain0, subChain1])
		expect(node0.ch).to.be.equal(chain.index)
		expect(node1.ch).to.be.equal(chain.index)
		expect(chain.getSC(node0.sc)).to.be.ok
		expect(chain.getSC(node1.sc)).to.be.ok
	})
})

// -------------------------- Chain Sys

describe('ChainSys', () => {

	it('findByPt', () => {
		const point11 = new Point(1, 1)
		const chainSys = new ChainSys()
		expect(chainSys.findByPt(point11)).to.not.be.ok

		const node0 = new ChemNode(point11)
		chainSys.addNode(node0)
		expect(chainSys.findByPt(point11)).to.be.equal(node0)
	})

	it('closeSC', () => {
		const chainSys = new ChainSys()
		// test invalid case
		expect(() => chainSys.closeSC(null)).to.not.throw()	// must be ignored without exception

		const node0 = new ChemNode()
		const node1 = new ChemNode()
		chainSys.addNode(node0)
		chainSys.addNode(node1)
		expect(node0.sc).to.be.equal(node1.sc)
		expect(node0.sc).to.be.ok

		chainSys.closeSC(node1)
		expect(node0.sc).to.not.be.equal(node1.sc)
		expect(node0.ch).to.be.equal(node1.ch)	// same chain
		expect(chainSys.getCurSC()).to.have.property('index', node1.sc)
	})

	it('closeChain, setCur', () => {
		const chainSys = new ChainSys()
		const node0 = new ChemNode(), node1 = new ChemNode()
		chainSys.addNode(node0)
		chainSys.closeChain()
		expect(chainSys.getCurSC()).to.not.be.ok

		chainSys.addNode(node1)
		expect(node0.ch).to.not.be.equal(node1.ch)

		chainSys.setCur(node0)
		expect(chainSys.getCurSC()).to.have.property('index', node0.sc)
	})

	const createBond = (node0, node1, dir) => {
		const bond = new ChemBond()
		bond.nodes[0] = node0
		bond.nodes[1] = node1
		bond.pt = dir ? dir : node1.pt.subx(node0.pt)
		return bond
	}

	/**
	 * Construct ChainSys from points
	 * @param {{x: number,y: number}[]} srcPoints list of points
	 * @returns {{chainSys: ChainSys, nodes: ChemNode[], bonds: ChemBond[]}} params
	 */
	const createChainSys = srcPoints => {
		const res = {
			chainSys: new ChainSys(),
			nodes: [],
			bonds: [],
			nodesMap: {},
		}
		srcPoints.forEach((ptDef, i) => {
			let pt = new Point(ptDef.x, ptDef.y)
			let node = new ChemNode(pt)
			res.nodes.push(node)
			if (ptDef.id)
				res.nodesMap[ptDef.id] = node
			if (ptDef.bNewCh) {
				res.chainSys.closeChain()
			} else if (ptDef.bSoft) {
				res.chainSys.closeSC()
			}
			res.chainSys.addNode(node)
			if (i > 0 && !ptDef.bNewCh) {
				res.bonds.push(createBond(res.nodes[i - 1], res.nodes[i]))
			}
			if (ptDef.bCycle) {
				res.bonds.push(createBond(res.nodes[i], res.nodes[0]))
			}
		})
		return res
	}

	// Merge simple case: _(x1,y1)`-`|
	// All points in same sub-chain
	it('Merge simple', () => {
		const {chainSys, nodes, bonds} = createChainSys([{x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1, bCycle: true}])

		// first and last nodes in same sub-chain before merge
		expect(nodes[0].sc).to.be.ok
		expect(nodes[0].sc).to.be.equal(nodes[2].sc)

		chainSys.merge(nodes[2], nodes[0], bonds[2])

		// first and last nodes in same sub-chain after merge
		expect(nodes[0].sc).to.be.equal(nodes[2].sc)
	})

	// Merge different chains with strong bond -;-|#2
	// Both sub-chains contains 2 nodes and 1 bond
	// sub-chains connect by bond between node3 -> node1
	it('Merge by strong bond', () => {
		const {chainSys, nodes} = createChainSys([
			{x: 0, y: 0},
			{x: 1, y: 0},
			{x: 0, y: 0, bNewCh: true},
			{x: 1, y: 0},
		])
		expect(Object.keys(chainSys.chains)).to.have.lengthOf(2)	// chain sys contains 2 chains
		expect(nodes[0].sc).to.be.ok
		expect(nodes[0].sc).to.be.equal(nodes[1].sc)	// node0 and 1 in same sub-chain
		expect(nodes[1].sc).to.not.be.equal(nodes[3].sc)	// node1 and 3 in different sub-chains
		expect(nodes[1].ch).to.not.be.equal(nodes[3].ch)	// node1 and 3 in different chains

		const bond = createBond(nodes[3], null, new Point(0, 1))	// connecting bond
		expect(bond.calcPt()).to.be.eql({x: 1, y: 1})
		chainSys.merge(nodes[3], nodes[1], bond)

		expect(Object.keys(chainSys.chains)).to.have.lengthOf(1)	// chain sys contains 1 chain
		expect(Object.keys(chainSys.curCh.getLst())).to.have.lengthOf(1)		// current chain contains 1 subchain
		expect(nodes[1].sc).to.be.equal(nodes[2].sc)	// and now node1 and 2 in same sub-chain
		expect(nodes[2].pt).to.be.eql({x: 0, y: -1})
		expect(nodes[3].pt).to.be.eql({x: 1, y: -1})
	})

	// Merge chains with soft bond: H|O;H-#2
	it('Merge by soft bond', () => {
		const {chainSys, nodes} = createChainSys([
			{x: 0, y: 0},
			{x: 0, y: 1},
			{x: 0, y: 0, bNewCh: true},
		])
		expect(Object.keys(chainSys.chains)).to.have.lengthOf(2)	// chain sys contains 2 chains
		expect(nodes[0].sc).to.be.ok
		expect(nodes[0].sc).to.be.equal(nodes[1].sc)	// node0 and 1 in same sub-chain
		expect(nodes[1].sc).to.not.be.equal(nodes[2].sc)	// node1 and 2 in different sub-chains
		expect(nodes[1].ch).to.not.be.equal(nodes[2].ch)	// node1 and 2 in different chains

		let bond = createBond(nodes[2], null, new Point(1, 0))
		bond.soft = true	// this is soft bond!
		chainSys.merge(nodes[2], nodes[1], bond)

		expect(Object.keys(chainSys.chains)).to.have.lengthOf(1)	// chain sys contains 1 chain
		expect(Object.keys(chainSys.curCh.getLst())).to.have.lengthOf(2)		// current chain contains 2 subchains
		expect(nodes[1].ch).to.be.equal(nodes[2].ch)	// and now node1 and 2 in same chain
		expect(nodes[1].sc).to.not.be.equal(nodes[2].sc)	// but node1 and 2 in different sub-chains	
	})

	// Complex case of merge: H-N=B; F-S-O|#3
	// F-S-O
	//     | <- connecting bond
	// H-N=B
	//
	//  Node  Chain SubCh => Chain SubCh
	//  0   H   1     1        1     1
	//  1   N   1     2        1     2
	//  2   B   1     3        1     3
	//  3   F   2     4        1     4
	//  4   S   2     5        1     5
	//  5   O   2     6        1     3*
	// O and B united in one sub-chain after merge
	it('merge complex', () => {
		const {chainSys, nodesMap} = createChainSys([
			{id: 'H'}, {id: 'N', bSoft: 1}, {id: 'B', bSoft: 1},
			{id: 'F', bNewCh: 1}, {id: 'S', bSoft: 1}, {id: 'O', bSoft: 1},
		])
		expect(Object.keys(chainSys.chains)).to.have.lengthOf(2)	// 2 chains
		expect(nodesMap.H.ch).to.be.equal(nodesMap.N.ch)	// 1st chain : H, N, B
		expect(nodesMap.N.ch).to.be.equal(nodesMap.B.ch)
		expect(nodesMap.B.ch).to.not.be.equal(nodesMap.F.ch)	// 2nd chain: F, S, O
		expect(nodesMap.F.ch).to.be.equal(nodesMap.S.ch)
		expect(nodesMap.S.ch).to.be.equal(nodesMap.O.ch)

		expect(nodesMap.H.sc).to.not.be.equal(nodesMap.N.sc)		// different subchains
		expect(nodesMap.N.sc).to.not.be.equal(nodesMap.B.sc)		// different subchains
		expect(nodesMap.B.sc).to.not.be.equal(nodesMap.F.sc)		// different subchains
		expect(nodesMap.F.sc).to.not.be.equal(nodesMap.S.sc)		// different subchains
		expect(nodesMap.S.sc).to.not.be.equal(nodesMap.O.sc)		// different subchains

		// create vertical strong bond from O to B
		const bond = createBond(nodesMap.O, nodesMap.B, new Point(0, 1))
		// merge
		chainSys.merge(nodesMap.O, nodesMap.B, bond)
		expect(Object.keys(chainSys.chains)).to.have.lengthOf(1)	// 1 chain after merge
		// O and B in same sub-chain
		expect(nodesMap.O.sc).to.be.equal(nodesMap.B.sc)
		// coordinates of O = {0, -1}
		expect(nodesMap.O.pt).to.be.eql({x: 0, y: -1})
		expect(nodesMap.F.pt).to.be.eql({x: 0, y: 0})
		expect(nodesMap.S.pt).to.be.eql({x: 0, y: 0})
		expect(nodesMap.B.pt).to.be.eql({x: 0, y: 0})
	})
})
