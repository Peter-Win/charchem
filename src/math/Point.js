/**
 * 2D Point (or vector) object
 * Created by PeterWin on 26.04.2017.
 */
'use strict'

export default class Point {

	/**
	 * Constructor of 2D point
	 * @param {number=} x	X coordinate
	 * @param {number=} y	Y coordinate
	 */
	constructor(x, y) {
		if (x === undefined) {
			this.x = this.y = 0
		} else {
			this.x = x
			// if y is undefined, then assumed Point(11) -> {x:11, y:11}
			this.y = y === undefined ? x : y
		}
	}

	/**
	 * Comparison with zero, given errors of less than one thousandth
	 * @param {number} value
	 * @returns {boolean}
	 */
	static is0(value) {
		return Math.abs(value) < 0.001
	}

	/**
	 * Reusing a point instance with new values
	 * @param {number} x
	 * @param {number} y
	 */
	init(x, y) {
		this.x = x
		this.y = y
	}

	/**
	 * Copying a point from another object
	 * @param {Point} pt
	 */
	from(pt) {
		this.x = pt.x
		this.y = pt.y
	}

	/**
	 * Point cloning
	 * @const
	 * @returns {Point}
	 */
	clone() {
		return new Point(this.x, this.y)
	}

	/**
	 * Comparison of two points
	 * @const
	 * @param {Point} pt
	 * @returns {boolean}
	 */
	eq(pt) {
		return Point.is0(this.x - pt.x) && Point.is0(this.y - pt.y)
	}

	//=================== addition

	/**
	 * Point operator += (x, y)
	 * add internal numbers
	 * @param x
	 * @param y
	 * @returns {Point}
	 */
	addin(x, y) {
		this.x += x
		this.y += y
		return this
	}

	/**
	 * Point operator += (Point)
	 * add internal (Point)
	 * @param {Point} pt
	 * @returns {Point}
	 */
	addi(pt) {
		this.x += pt.x
		this.y += pt.y
		return this
	}

	/**
	 * Point operator + (x, y)
	 * add external numbers
	 * @const
	 * @param {number} x
	 * @param {number} y
	 */
	addxn(x, y) {
		return new Point(this.x + x, this.y + y)
	}


	/**
	 * Point operator + (Point)
	 * add external (Point)
	 * @const
	 * @param pt
	 * @returns {Point}
	 */
	addx(pt) {
		return new Point(this.x + pt.x, this.y + pt.y)
	}

	// ================== subtraction

	/**
	 * Point operator -= (x, y)
	 * subtraction internal numbers
	 * @param {number} x
	 * @param {number} y
	 * @returns {Point}
	 */
	subin(x, y) {
		this.x -= x
		this.y -= y
		return this
	}

	/**
	 * Point operator - (Point)
	 * subtraction internal (Point)
	 * @param {Point} pt
	 * @returns {Point}
	 */
	subi(pt) {
		this.x -= pt.x
		this.y -= pt.y
		return this
	}

	/**
	 * Point operator - (x, y)
	 * @const
	 * @param {number} x
	 * @param {number} y
	 * @returns {Point}
	 */
	subxn(x, y) {
		return new Point(this.x - x, this.y - y)
	}

	/**
	 * Point operator - (Point)
	 * sub external (Point)
	 * @const
	 * @param {Point} pt
	 * @returns {Point}
	 */
	subx(pt) {
		return new Point(this.x - pt.x, this.y - pt.y)
	}

	/**
	 * min internal numbers
	 * @param {number} x
	 * @param {number} y
	 * @returns {Point}
	 */
	minin(x, y) {
		this.x = Math.min(this.x, x)
		this.y = Math.min(this.y, y)
		return this
	}

	/**
	 * min internal (Point)
	 * @param {Point} pt
	 * @returns {Point}
	 */
	mini(pt) {
		return this.minin(pt.x, pt.y)
	}

	/**
	 * max internal numbers
	 * @param {number} x
	 * @param {number} y
	 * @return {Point}
	 */
	maxin(x, y) {
		this.x = Math.max(this.x, x)
		this.y = Math.max(this.y, y)
		return this
	}

	/**
	 * max internal (Point)
	 * @param {Point} pt
	 * @return {Point}
	 */
	maxi(pt) {
		return this.maxin(pt.x, pt.y)
	}

	/**
	 * negative internal: pt = -pt
	 * @returns {Point}
	 */
	negi() {
		this.x = -this.x
		this.y = -this.y
		return this
	}

	/**
	 * negative external
	 * Point operator - () const
	 * @const
	 * @returns {Point}
	 */
	negx() {
		return new Point(-this.x, -this.y)
	}

	/**
	 * internal multiply by koefficient
	 * Point operator *= (number)
	 * @param {number} k
	 * @returns {Point}
	 */
	muli(k) {
		this.x *= k
		this.y *= k
		return this
	}

	/**
	 * external multiply by koefficient
	 * Point operator * (number) const
	 * @const
	 * @param k
	 * @returns {Point}
	 */
	mulx(k) {
		return new Point(this.x * k, this.y * k)
	}

	/**
	 * square of length
	 * @const
	 * @returns {number}
	 */
	lengthSqr() {
		return this.x * this.x + this.y * this.y
	}

	/**
	 * Length
	 * @const
	 * @returns {number}
	 */
	length() {
		return Math.sqrt(this.lengthSqr())
	}

	/**
	 * Square of distance to point, defined by numbers
	 * @const
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	distSqrn(x, y) {
		let dx = this.x - x, dy = this.y - y
		return dx * dx + dy * dy
	}

	/**
	 * Square of distance to point
	 * @const
	 * @param {Point} pt
	 * @returns {number}
	 */
	distSqr(pt) {
		return this.distSqrn(pt.x, pt.y)
	}

	/**
	 * Distance to point
	 * @const
	 * @param pt
	 * @returns {number}
	 */
	dist(pt) {
		return Math.sqrt(this.distSqr(pt))
	}

	/**
	 * Make unit vector from angle (in radians)
	 * @param {number} radAngle		angle in radians, for ex: Math.PI/2
	 * @returns {Point}
	 */
	fromRad(radAngle) {
		this.x = Math.cos(radAngle)
		this.y = Math.sin(radAngle)
		return this
	}

	/**
	 * Make unit vector from angle (in degrees)
	 * @param {number} degAngle
	 * @returns {Point}
	 */
	fromDeg(degAngle) {
		return this.fromRad(Math.PI * degAngle / 180)
	}

	/**
	 * Transpose internal
	 * @returns {Point}
	 */
	transponi() {
		let tmp = this.x
		this.x = this.y
		this.y = tmp
		return this
	}

	/**
	 * Transpose external
	 * @const
	 * @returns {Point}
	 */
	transponx() {
		return new Point(this.y, this.x)
	}

	/**
	 * Rounding and casting to string
	 * @param {number} value
	 * @returns {string}
	 */
	static toa(value) {
		return (Math.round(value * 1000) / 1000).toString()
	}

	/**
	 * Make string from point
	 * @const
	 * @returns {string}
	 */
	toString() {
		return `{${Point.toa(this.x)}, ${Point.toa(this.y)}}`
	}

	/**
	 * Calculate the angle from vector
	 *  *----> X
	 *  | *
	 *  |   *
	 *  v     *
	 *  Y
	 *  (10,10) -> Pi/4 (45º); (10, -10) -> -Pi/4 (-45º)
	 * @const
	 * @returns {number} angle in radians, in range from -Pi to Pi
	 */
	polarAngle() {
		if (this.x === 0) {
			if (this.y === 0) {
				return 0
			}
			return this.y > 0 ? Math.PI / 2 : -Math.PI / 2
		}
		return Math.atan2(this.y, this.x)
	}

}
