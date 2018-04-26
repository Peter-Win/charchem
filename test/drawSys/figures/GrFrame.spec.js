/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
const {expect} = require('chai')
const {GrLines} = require('../../../src/drawSys/figures/GrLines')
const {GrFigure} = require('../../../src/drawSys/figures/GrFigure')
const {GrFrame} = require('../../../src/drawSys/figures/GrFrame')
const {Point} = require('../../../src/math/Point')
const {Rect} = require('../../../src/math/Rect')

describe('GrFrame', () => {

	it('addFr - add frame', () => {
		let mainFrame = new GrFrame()
		let subFrame = new GrFrame()
		mainFrame.addFr(subFrame)
		expect(mainFrame.frames).to.have.lengthOf(1)
		expect(mainFrame.frames[0]).to.be.equal(subFrame)
	})

	it('addFig - add figure', () => {
		let frame = new GrFrame()
		frame.addFig(GrLines.makeRect(new Point(2), new Point(3)), true)	// do not update
		let figure = GrLines.makeRect(new Point(1), new Point(5))
		frame.addFig(figure)
		expect(frame.bounds).to.be.eql({A:{x:0, y:0}, B:{x:6, y:6}}) // 1,1,5,5 grow by 1
		expect(frame.figs).to.have.lengthOf(2)
		expect(frame.figs[1]).to.be.equal(figure)
	})

	it('add', () => {
		let mainFrame = new GrFrame()
		let subFrame = new GrFrame()
		let rect = GrLines.makeRect(new Point(2), new Point(8), 'blue', 0.25)
		mainFrame.add(subFrame)
		mainFrame.add(rect)
		expect(mainFrame.bounds).to.be.eql({A:{x:1.875, y:1.875}, B:{x:8.125, y:8.125}})
		expect(mainFrame.frames).to.have.lengthOf(1)
		expect(mainFrame.frames[0]).to.be.equals(subFrame)
		expect(mainFrame.figs).to.have.lengthOf(1)
		expect(mainFrame.figs[0]).to.be.equals(rect)
	})

	//   012345
	// 0 ......
	// 1 ...///   / = 3,1,5,3
	// 2 .\\X//   \ = 1,3,3,4
	// 3 .\\X//   U = 1,1,5,4
	// 4 .\\\..
	it('uf: updateFigure', () => {
		let fig1 = new GrFigure()
		fig1.bounds.init(3, 1, 5, 3)
		let fig2 = new GrFigure()
		fig2.bounds.init(1, 3, 3, 4)

		let frame = new GrFrame()
		frame.uf(fig1, 1)
		frame.uf(fig2)
		expect(frame.bounds).to.be.eql({A:{x:1, y:1}, B:{x:5, y:4}})
	})

	it('update', () => {
		let fig1 = new GrFigure()
		fig1.bounds.init(3, 1, 5, 3)
		let fig2 = new GrFigure()
		fig2.bounds.init(1, 3, 3, 4)

		let subFrame1 = new GrFrame()
		subFrame1.irc = new Rect(0, 2, 3, 3)
		let subFrame2 = new GrFrame()
		subFrame2.irc = new Rect(0, 0, 2, 2)
		subFrame2.org.init(4, 2) // => {4, 2, 6, 4}
		let subFrame3 = new GrFrame()

		let frame = new GrFrame()
		frame.add(fig1, 1)
		frame.add(fig2, 1)
		frame.add(subFrame1, 1)
		frame.add(subFrame2, 1)
		frame.add(subFrame3)
		expect(frame.bounds.toArray()).to.be.eql([0, 0, 0, 0])

		frame.update()
		expect(frame.bounds.toArray()).to.be.eql([1, 1, 5, 4])
		expect(frame.irc.toArray()).to.be.eql([0, 2, 6, 4])
	})

	it('moveChilds', () => {
		let frame = new GrFrame()

		let fig = new GrFigure()
		frame.add(fig)
		fig.bounds.init(0, 0, 2, 2)

		let subFrame = new GrFrame()
		subFrame.bounds.init(1, 1, 3, 3)
		frame.add(subFrame)

		frame.moveChilds(new Point(1, 1))
		frame.update()
		expect(frame.bounds.toArray()).to.be.eql([1, 1, 4, 4])
	})
})
