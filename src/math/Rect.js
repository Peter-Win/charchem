/**
 * Rectangle object
 * Created by PeterWin on 26.04.2017.
 */
'use strict'

import Point from './Point'

export default class Rect
{
	/**
	 * Rect() or Rect(0,0, 10, 20) or Rect(new Point(0,0), new Point(10,20))
	 * @param {number|Point=} a
	 * @param {number|Point=} b
	 * @param {number=} Bx
	 * @param {number=} By
	 */
	constructor(a = new Point(), b = new Point(), Bx, By) {
		if (typeof a === 'number' && typeof b === 'number') {
			this.A = new Point(a, b)
			this.B = new Point(Bx, By)
		} else {
			this.A = a
			this.B = b
		}
	}

	toString() {
		return `{${this.l}, ${this.t}, ${this.r}, ${this.b}}`
	}

	/**
	 * Make deep copy of Rect
	 * @const
	 * @returns {Rect}
	 */
	clone() {
		return new Rect(this.A.clone(), this.B.clone())
	}

	/**
	 * Init rect from another rect.
	 * It's work faster, then clone(), because not create new instances of rect and points
	 * @param {Rect} rc
	 */
	from(rc) {
		this.A.from(rc.A)
		this.B.from(rc.B)
	}

	/**
	 * Init rect by number coordinates
	 * @param {number} xa
	 * @param {number} ya
	 * @param {number} xb
	 * @param {number} yb
	 */
	init(xa, ya, xb, yb) {
		this.A.init(xa, ya)
		this.B.init(xb, yb)
	}

	/**
	 * Set or get left top corner point
	 * Point is not cloned!
	 * @param {Point=} pt
	 * @returns {Point}
	 */
	LT(pt) {
		if (pt) {
			this.A = pt
		}
		return this.A
	}

	/**
	 * Set or get right bottom corner point
	 * Point is not cloned!
	 * @param {Point=} pt
	 * @returns {Point}
	 */
	RB(pt) {
		if (pt) {
			this.B = pt
		}
		return this.B
	}

	/**
	 * Get right top corner point
	 * @const
	 * @returns {Point}
	 */
	RT() {
		return new Point(this.B.x, this.A.y)
	}

	/**
	 * Get left bottom corner point
	 * @returns {Point}
	 * @const
	 */
	LB() {
		return new Point(this.A.x, this.B.y)
	}

	/**
	 * Set minimal value for left top corner
	 * @param {Point} pt
	 */
	minLT(pt) {
		this.A.mini(pt)
	}

	/**
	 * Set maximal value for right bottom corner
	 * @param {Point} pt
	 */
	maxRB(pt) {
		this.B.maxi(pt)
	}

	/**
	 * Get left position
	 * @const
	 * @returns {number}
	 * @deprecated	Use l property
	 */
	L() {
		return this.A.x
	}

	/**
	 * Get right position
	 * @const
	 * @returns {number}
	 * @deprecated	Use r property
	 */
	R() {
		return this.B.x
	}

	/**
	 * Get top position
	 * @const
	 * @returns {number}
	 * @deprecated	Use t property
	 */
	T() {
		return this.A.y
	}

	/**
	 * Get bottom position
	 * @const
	 * @returns {number}
	 * @deprecated Use b property
	 */
	Bot() {
		return this.B.y
	}

	/**
	 * get left position
	 * @returns {number}
	 */
	get l() {
		return this.A.x
	}

	/**
	 * set left position
	 * @param {number} x
	 */
	set l(x) {
		this.A.x = x
	}

	/**
	 * get right position
	 * @returns {number}
	 */
	get r() {
		return this.B.x
	}

	/**
	 * set right position
	 * @param {number} x
	 */
	set r(x) {
		this.B.x = x
	}

	/**
	 * get top position
	 * @returns {number}
	 */
	get t() {
		return this.A.y
	}

	/**
	 * set top position
	 * @param {number} y
	 */
	set t(y) {
		this.A.y = y
	}

	/**
	 * get bottom position
	 * @returns {number}
	 */
	get b() {
		return this.B.y
	}

	/**
	 * set bottom position
	 * @param {number} y
	 */
	set b(y) {
		this.B.y = y
	}

	/**
	 * Calculate width of rect
	 * @returns {number}
	 * @const
	 */
	get W() {
		return this.B.x - this.A.x
	}

	/**
	 * Calculate height of rect
	 * @returns {number}
	 * @const
	 */
	get H() {
		return this.B.y - this.A.y
	}

	/**
	 * calculate x position of rect center
	 * @returns {number}
	 */
	get cx() {
		return (this.A.x + this.B.x) / 2
	}

	/**
	 * calculate y position of rect center
	 * @returns {number}
	 */
	get cy() {
		return (this.A.y + this.B.y) / 2
	}

	/**
	 * Calculate size of rect.
	 * @returns {Point}	x = width of rect, y = height of rect
	 */
	size() {
		return this.B.subx(this.A)
	}

	/**
	 * get center point of rect
	 * @returns {Point}
	 */
	center() {
		return this.A.addx(this.B).muli(0.5)
	}

	/**
	 * Is this rect empty
	 * @returns {boolean}	true, if width and height == 0
	 */
	is0() {
		return this.A.eq(this.B)
	}

	/**
	 * Move rect by delta
	 * @param {Point} delta
	 */
	move(delta) {
		this.A.addi(delta)	// A += delta
		this.B.addi(delta)
	}

	/**
	 * Move rect by delta, defined by x, y
	 * @param {number} x
	 * @param {number} y
	 */
	moven(x, y) {
		this.A.addin(x, y)
		this.B.addin(x, y)
	}

	/**
	 * rect (10, 10, 20, 20) -> grow(10) -> (0,0, 30, 30)
	 * grow(10) or grow(10, 20) or grow({x:10, y:20}) or grow(Point)
	 * @param {Point|number} x
	 * @param {number=} y
	 */
	grow(x, y) {
		if (typeof x === 'object' && ('x' in x) && ('y' in x)) {
			y = x.y
			x = x.x
		} else if (y === undefined) {
			y = x
		}
		let a = this.A, b = this.B
		a.x -= x
		a.y -= y
		b.x += x
		b.y += y
	}

	/**
	 * Unite with another rect
	 * If this rect is empty, then it init from rc
	 * @param rc
	 */
	unite(rc) {
		if (this.is0()) {
			this.from(rc)
		} else {
			this.A.mini(rc.LT())
			this.B.maxi(rc.RB())
		}
	}

	toArray() {
		return [this.l, this.t, this.r, this.b]
	}
}
