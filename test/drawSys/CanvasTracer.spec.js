/**
 * Created by PeterWin on 15.05.2017.
 */
'use strict'
import { expect } from 'chai'
import CanvasTracer from '../../src/drawSys/CanvasTracer'
import GrFontProps from '../../src/drawSys/GrFontProps'

describe('CanvasTracer', () => {
	it('setFont', () => {
		let props = new GrFontProps('Arial', 16, true, false)
		let tracer = new CanvasTracer(100, 100)
		tracer.setFont(props)
		let canvasFont = tracer.ctx.font
		tracer.close()

		expect(canvasFont).to.be.equal('bold 16px Arial')
	})
})
