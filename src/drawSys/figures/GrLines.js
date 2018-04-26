/**
 * Polygonal chain
 * Any point can have mv property
 * mv = 1 - moveTo
 * mv = 2 - medium point for Bezier curve
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
import GrFigure from './GrFigure'
import Point from '../../math/Point'

class GrLines extends GrFigure
{
	/**
	 *
	 * @param {string=} color
	 * @param {number=} width	if width == 0, then used minimal thick. Usually, 1 pixel
	 * @param {string=} style
	 */
	constructor(color = null, width = 0, style = null) {
		super()
		this.type = GrLines.T
		this.color = color	// can be undefined
		this.style = style
		this.width = width	// can be undefined
		this.fillColor = 0	// can be undefined
		this.points = []
		// this.join = 'round' | bevel | miter
		// this.cap = 'butt' | 'round' | 'square'
	}

	/**
	 * Add point
	 * void add(const ChemPoint& pos, bool bMove=false);
	 * @param {Point} pos
	 * @param {number=} bMove
	 */
	add(pos, bMove = 0) {
		pos.mv = bMove
		this.points.push(pos)
		this.updateBounds(pos, this.points.length === 1, (this.width || 2) / 2)
	}

	/**
	 * Add point by coordinates
	 * @param {number} x
	 * @param {number} y
	 * @param {number=} bMove	1: moveTo, 2: mid point for curve
	 */
	addxy(x, y, bMove = 0) {
		this.add(new Point(x, y), bMove)
	}

	/**
	 * Add array of values. Every point defined by 3 values: x, y, mv
	 * example: figure.addA([0,0,1, 10,10,0])
	 * @param {number[]} array
	 */
	addA(array) {
		let i = 0, n = array.length
		while (i < n) {
			this.addxy(array[i++], array[i++], array[i++])
		}
	}

	/**
	 * Create rectangle figure
	 * @param {Point} a
	 * @param {Point} b
	 * @param {string=} color
	 * @param {number=} width
	 * @param {string=} style
	 * @returns {GrLines}
	 */
	static makeRect(a, b, color = null, width = 0, style = null) {
		let figure = new GrLines(color, width, style)
		figure.addA([a.x, a.y, 1, b.x, a.y, 0, b.x, b.y, 0, a.x, b.y, 0, a.x, a.y, 0])
		return figure
	}
}
GrLines.T = 'L'

export default GrLines
