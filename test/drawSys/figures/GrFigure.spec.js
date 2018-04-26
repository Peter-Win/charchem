/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'

const {expect} = require('chai')
const {GrFigure} = require('../../../src/drawSys/figures/GrFigure')
const {Point} = require('../../../src/math/Point')

describe('GrFigure', () => {

	it('updateBounds', () => {
		let figure = new GrFigure()
		figure.updateBounds(new Point(11, 12), true)
		figure.updateBounds(new Point(9, 10))
		figure.updateBounds(new Point(10, 8))

		expect(figure.bounds).to.be.eql({A: {x: 9, y: 8}, B: {x: 11, y: 12}})
	})

	it('updateBounds with delta', () => {
		let figure = new GrFigure()
		figure.updateBounds(new Point(), true)
		figure.updateBounds(new Point(1, 2), false, 0.5)
		figure.updateBounds(new Point(-1, 1), false, 0.5)
		figure.updateBounds(new Point(1, -2), false, 0.5)

		expect(figure.bounds).to.be.eql({A: {x: -1.5, y: -2.5}, B: {x: 1.5, y: 2.5}})
	})

	it('get Irc', () => {
		let figure = new GrFigure()
		figure.updateBounds(new Point(4, 4), true)
		figure.updateBounds(new Point(8, 8))
		expect(figure.getIrc()).to.be.eql({A:{x:4, y:4}, B:{x:8, y:8}})
		figure.irc = figure.bounds.clone()
		figure.irc.grow(1)
		expect(figure.getIrc()).to.be.eql({A:{x:3, y:3}, B:{x:9, y:9}})
	})
})
