/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
const {expect} = require('chai')
const {GrLines} = require('../../../src/drawSys/figures/GrLines')
const {Point} = require('../../../src/math/Point')

describe('GrLines', () => {
	it('add', () => {
		let figure = new GrLines('black')
		figure.add(new Point(1))
		figure.add(new Point(5, -1))
		figure.add(new Point(3, 4))
		// bounds: 1, -1, 5, 4 grow 1
		expect(figure.bounds).to.be.eql({A:{x:0, y:-2}, B:{x:6, y:5}})
		expect(figure.points).to.have.lengthOf(3)
	})

	it('addxy', () => {
		let figure = new GrLines()
		figure.addxy(1, 1)
		figure.addxy(5, -1)
		figure.addxy(3, 4)
		expect(figure.bounds).to.be.eql({A:{x:0, y:-2}, B:{x:6, y:5}})
		expect(figure.points).to.have.lengthOf(3)
	})

	it('addA', () => {
		let figure = new GrLines()
		figure.addA([
			1, 1, 1,
			5, -1, 0,
			3, 4, 0,
		])
		expect(figure.bounds).to.be.eql({A:{x:0, y:-2}, B:{x:6, y:5}})
		expect(figure.points).to.have.lengthOf(3)
	})

	it('makeRect', () => {
		let figure = GrLines.makeRect(new Point(10, 15), new Point(20, 25))
		expect(figure.bounds).to.be.eql({A:{x:9, y:14}, B:{x:21, y:26}})
		expect(figure.points).to.have.lengthOf(5)
		expect(figure.points[0]).to.be.eql({x:10, y:15, mv:1})
		expect(figure.points[1]).to.be.eql({x:20, y:15, mv:0})
		expect(figure.points[2]).to.be.eql({x:20, y:25, mv:0})
		expect(figure.points[3]).to.be.eql({x:10, y:25, mv:0})
		expect(figure.points[4]).to.be.eql({x:10, y:15, mv:0})
	})
})
