/**
 * Created by PeterWin on 29.04.2017.
 */

import {expect} from 'chai'
import ChemRadical from '../../src/core/ChemRadical'

describe('ChemRadical', () => {

	it('Init radicals map', () => {
		ChemRadical.initMap()
		expect(Object.keys(ChemRadical.Map)).to.not.be.empty

		let methyl = ChemRadical.Map.Me
		expect(methyl.label).to.be.equal('Me')
		expect(methyl.items).to.have.lengthOf(2)
		let indexH = methyl.items.findElem('H')
		expect(indexH).to.be.at.least(0)
		expect(methyl.items[indexH]).to.have.property('n', 3)
		let indexC = methyl.items.findElem('C')
		expect(indexC).to.be.at.least(0)
		expect(methyl.items[indexC]).to.have.property('n', 1)

		let ethyl = ChemRadical.Map.Et
		expect(ethyl).to.have.property('label', 'Et')
		expect(ethyl.items).to.have.lengthOf(2)
		indexH = ethyl.items.findElem('H')
		expect(indexH).to.be.at.least(0)
		expect(ethyl.items[indexH]).to.have.property('n', 5)
		indexC = ethyl.items.findElem('C')
		expect(indexC).to.be.at.least(0)
		expect(ethyl.items[indexC]).to.have.property('n', 2)
	})

	it('Walk', () => {
		let ethyl = ChemRadical.Map.Et
		expect(ethyl).to.be.ok
		// radical return value
		expect(ethyl.walk({radical: obj => obj.label})).to.be.equal('Et')
		// Empty visitor
		expect(ethyl.walk({})).to.be.undefined
	})
})