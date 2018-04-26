/**
 * Ellipse
 * Can be stroked or filled
 *  org->+------+
 *       |      dy
 *       +--dx--+
 *
 * Created by PeterWin on 13.05.2017.
 */
'use strict'
import GrFigure from './GrFigure'

export default class GrEllipse extends GrFigure
{
	/**
	 * @constructor
	 * @param {number} dx	width of ellipse
	 * @param {number} dy	height of ellipse
	 * @param {string} fillColor
	 * @param {string} strokeColor	// stroke color
	 * @param {number=} strokeWidth	// stroke width
	 * @param {string=} style
	 */
	constructor(dx, dy, fillColor, strokeColor, strokeWidth = 0, style) {
		super()
		this.dx = dx
		this.dy = dy
		this.type = GrEllipse.T
		this.color = strokeColor
		this.width = strokeWidth
		this.fillColor = fillColor
		this.style = style
		if (strokeColor && strokeWidth) {
			let w = strokeWidth	// должно быть width/2, но тогда не отсекаются края
			this.bounds.A.init(-w, -w)
			this.bounds.B.init(dx + w, dy + w)
		} else {
			this.bounds.B.init(dx, dy)
		}
	}
}
GrEllipse.T = 'E'
