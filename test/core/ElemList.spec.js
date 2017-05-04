/**
 * Created by PeterWin on 29.04.2017.
 */
"use strict"

import {expect} from 'chai'
import ElemList, {ElemRec} from '../../src/core/ElemList'
import {MenTbl} from '../../src/core'
import ChemRadical from '../../src/core/ChemRadical'

describe('ElemList', () => {

	it('Constructor', () => {
		let elemList = new ElemList()
		expect(elemList.length).to.be.equal(0)
		expect(elemList.charge).to.be.equal(0)
	})

	it('findElem', () => {
		let elemList = new ElemList()
		elemList.push(new ElemRec(MenTbl.H, 2))
		elemList.push(new ElemRec(MenTbl.O))

		expect(elemList.findElem(MenTbl.H)).to.be.equal(0)
		expect(elemList.findElem(MenTbl.O)).to.be.equal(1)
		expect(elemList.findElem(MenTbl.He)).to.be.equal(-1)

		expect(elemList.findElem('H')).to.be.equal(0)
		expect(elemList.findElem('O')).to.be.equal(1)
		expect(elemList.findElem('He')).to.be.equal(-1)
	})

	it('findCustom', () => {
		let elemList = new ElemList()
		elemList.push(new ElemRec({id:'First', elem:null, n:1}))
		elemList.push(new ElemRec({id:'Second', elem:null, n:1}))

		expect(elemList.length).to.be.equal(2)
		expect(elemList.findCustom('First')).to.be.equal(0)
		expect(elemList.findCustom('Second')).to.be.equal(1)
		expect(elemList.findCustom('Third')).to.be.equal(-1)
	})

	it('findKey', () => {
		let elemList = new ElemList()
		elemList.push(new ElemRec(MenTbl.H))
		elemList.push(new ElemRec({id:'R', elem:null, n:1}))

		expect(elemList.findKey('H')).to.be.equal(0)
		expect(elemList.findKey('{R}')).to.be.equal(1)
		expect(elemList.findKey('R')).to.be.equal(-1)
		expect(elemList.findKey('{H}')).to.be.equal(-1)
	})

	it('findRec', () => {
		let elemList = new ElemList()
		elemList.push(new ElemRec(MenTbl.H))
		elemList.push(new ElemRec({id:'R', elem:null, n:1}))

		expect(elemList.findRec({id:'H', elem:MenTbl.H, n:1})).to.be.equal(0)
		expect(elemList.findRec({id:'R', elem:null, n:1})).to.be.equal(1)
		expect(elemList.findRec({id:'H', elem:null, n:1})).to.be.equal(-1)
		expect(elemList.findRec(new ElemRec('H'))).to.be.equal(0)
		expect(elemList.findRec(new ElemRec('He'))).to.be.equal(-1)
	})

	it('addElemRec', () => {
		let elemList = new ElemList()
		elemList.addElemRec(new ElemRec(MenTbl.H))
		elemList.addElemRec(new ElemRec(MenTbl.O))
		elemList.addElemRec(new ElemRec('H'))

		expect(elemList).to.have.lengthOf(2)
		expect(elemList[0].n).to.be.equal(2)
		expect(elemList[0].id).to.be.equal('H')
		expect(elemList[1].n).to.be.equal(1)
		expect(elemList[1].id).to.be.equal('O')
	})

	it('addElem', () => {
		let elemList = new ElemList()
		elemList.addElem('H', 3)
		elemList.addElem(MenTbl.O, 2)
		elemList.addElem(new ElemRec('O', 3), 4)	// 2 + 3*4 = 14

		expect(elemList).to.have.lengthOf(2)
		expect(elemList[0].id).to.be.equal('H')
		expect(elemList[0].n).to.be.equal(3)
		expect(elemList[1].id).to.be.equal('O')
		expect(elemList[1].n).to.be.equal(14)
	})

	it('addCustom', () => {
		let elemList = new ElemList()
		elemList.addCustom('R', 2)
		elemList.addElem('O')
		elemList.addCustom('R', 3)
		elemList.addCustom('R1', 4)

		expect(elemList[0]).to.have.property('id', 'R')
		expect(elemList[0]).to.have.property('n', 5)
		expect(elemList[1]).to.have.property('id', 'O')
		expect(elemList[1]).to.have.property('n', 1)
		expect(elemList[2]).to.have.property('id', 'R1')
		expect(elemList[2]).to.have.property('n', 4)
	})

	it('addList', () => {
		let list1 = new ElemList()
		list1.addElem('H', 2)
		list1.addElem('O')

		let list2 = new ElemList()
		list2.addElem('S')
		list2.addElem('O', 3)

		list1.addList(list2)

		expect(list2).to.have.lengthOf(2)
		expect(list2[0]).to.have.property('id','S')
		expect(list2[0]).to.have.property('n', 1)
		expect(list2[1]).to.have.property('id','O')
		expect(list2[1]).to.have.property('n', 3)
	})

	it('addRadical', () => {
		ChemRadical.initMap()
		let list = new ElemList()
		list.addRadical(ChemRadical.Map.Me)
		expect(list).to.have.lengthOf(2)
		expect(list[0]).to.have.property('id','C')
		expect(list[0]).to.have.property('n', 1)
		expect(list[1]).to.have.property('id','H')
		expect(list[1]).to.have.property('n', 3)
	})

	it('scale', () => {
		ChemRadical.initMap()
		let list = new ElemList()
		let methyl = ChemRadical.Map.Me
		list.addRadical(methyl)

		list.scale(1)
		list.scale(3)

		expect(list[list.findElem('H')].n).to.be.equal(9)
		expect(methyl.items[methyl.items.findElem('H')].n).to.be.equal(3)	// source radical not changed
	})

	it('toString', () => {
		let list1 = new ElemList()
		list1.addElem('C', 2)
		list1.addElem('H', 6)

		expect(list1.toString()).to.be.equal('C2H6')

		let list2 = new ElemList()
		list2.addElem('S')
		list2.addElem('O', 4)
		list2.charge = -2
		expect(list2+'').to.be.equal('SO4^2-')

		let list3 = new ElemList()
		list3.addCustom('M',2)
		list3.addElem('S')
		list3.addCustom('CoA')
		list3.charge = 1
		expect(list3+'').to.be.equal('{M}2S{CoA}^+')
	})

	it('sortByHill', () => {
		let list = new ElemList()
		let elems = ['U', 'W', 'C', 'H', 'O', 'B']
		elems.forEach(item => list.addElem(item))
		expect(list+'').to.be.equal('UWCHOB')
		list.sortByHill()
		expect(list+'').to.be.equal('CHBOUW')

		let list2 = new ElemList()
		list2.addCustom('R1')
		list2.addElem('O')
		list2.addCustom('R')
		list2.sortByHill()
		expect(list2+'').to.be.equal('O{R}{R1}')

		let list3 = new ElemList()
		list3.push(new ElemRec({id:'R',elem:null,n:1}))
		list3.push(new ElemRec(MenTbl.H), new ElemRec(MenTbl.O), new ElemRec(MenTbl.H))
		list3.push(new ElemRec({id:'R',elem:null,n:1}))
		list3.sortByHill()
		expect(list3+'').to.be.equal('HHO{R}{R}')
	})
})
