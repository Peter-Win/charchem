/**
 * Created by PeterWin on 01.05.2017.
 */

const expect = require('chai').expect
const ChemAgent = require('../../src/core/ChemAgent')
const ChemNode = require('../../src/core/ChemNode')
const ChemNodeItem = require('../../src/core/ChemNodeItem')
const ChemBond = require('../../src/core/ChemBond')
const MenTbl = require('../../src/core').MenTbl

describe('ChemAgent', ()=> {
	const createItem = (node, id, n = 1) => {
		let item = new ChemNodeItem()
		item.n = n
		item.obj = MenTbl[id]
		node.items.push(item)
	}
	const createNode = (agent) => {
		let node = new ChemNode()
		agent.nodes.push(node)
		agent.cmds.push(node)
		return node
	}
	const createBond = (agent) => {
		let bond = new ChemBond()
		bond.tx = '-'
		agent.cmds.push(bond)
	}
	it('walk', () => {
		// Construct CH3-CH2-OH
		let agent = new ChemAgent()
		let node = createNode(agent)
		createItem(node, 'C')
		createItem(node, 'H', 3)
		createBond(agent)
		node = createNode(agent)
		createItem(node, 'C')
		createItem(node, 'H', 2)
		createBond(agent)
		node = createNode(agent)
		createItem(node, 'O')
		createItem(node, 'H')

		// first visitor return in agentPre
		let result = agent.walk({
			agentPre: () => 'SUCCESS',
			agentPost: () => 'FAIL',	// this line is not call
		})
		expect(result).to.be.equal('SUCCESS')

		// second visitor make text
		let tmp = ''
		result = agent.walk({
			atom: obj => {tmp += obj.id},
			itemPost: obj => {tmp += obj.n === 1 ? '' : obj.n},
			bond: obj => {tmp += obj.tx},
			agentPost: () => tmp,
		})
		expect(result).to.be.equal('CH3-CH2-OH')

		// third visitor find first H and return his count
		result = agent.walk({
			agentPre: () => {}, // dummy for coverage
			atom: obj => {tmp = obj.id},
			itemPost: obj => {
				if (tmp === 'H') return obj.n
			},
			agentPost: () => {},	// dummy for coverage
		})
		expect(result).to.be.equal(3)

		// dummy visitor for coverage
		agent.walk({})
	})
})
