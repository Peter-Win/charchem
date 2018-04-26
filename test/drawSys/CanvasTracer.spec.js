/**
 * Created by PeterWin on 15.05.2017.
 */
const {expect} = require('chai')
const {CanvasTracer} = require('../../src/drawSys/CanvasTracer')
const {GrFontProps} = require('../../src/drawSys/GrFontProps')

// тест отключен, т.к. в среде Node.js отсутствует document, который необходим для создания canvas
xdescribe('CanvasTracer', () => {
	it('setFont', () => {
		let props = new GrFontProps('Arial', 16, true, false)
		let tracer = new CanvasTracer(100, 100)
		tracer.setFont(props)
		let canvasFont = tracer.ctx.font
		tracer.close()

		expect(canvasFont).to.be.equal('bold 16px Arial')
	})
})
