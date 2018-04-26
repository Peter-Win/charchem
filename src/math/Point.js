/**
 * 2D Point (or vector) object
 * Created by PeterWin on 26.04.2017.
 */
'use strict'

class Point {

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
	 * @param {number} value	checked value
	 * @returns {boolean}	true, if zero or close to zero
	 */
	static is0(value) {
		return Math.abs(value) < 0.001
	}

	/**
	 * Reusing a point instance with new values
	 * @param {number} x	new x
	 * @param {number} y	new y
	 * @return {Point} return this point object with new x, y values
	 */
	init(x, y) {
		this.x = x
		this.y = y
		return this
	}

	/**
	 * Copying a point from another object
	 * @param {Point} pt another point (not modified)
	 * @return {void}
	 */
	from(pt) {
		this.x = pt.x
		this.y = pt.y
	}

	/**
	 * Point cloning
	 * @const
	 * @returns {Point} new Point object with same x, y
	 */
	clone() {
		return new Point(this.x, this.y)
	}

	/**
	 * Comparison of two points
	 * @const
	 * @param {Point} pt	second point (non-modified)
	 * @returns {boolean}	true, if points are closed together
	 */
	eq(pt) {
		return Point.is0(this.x - pt.x) && Point.is0(this.y - pt.y)
	}

	//=================== addition

	/**
	 * Point operator += (x, y)
	 * add internal numbers
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @returns {Point} this point object (modified)
	 */
	addin(x, y) {
		this.x += x
		this.y += y
		return this
	}

	/**
	 * Point operator += (Point)
	 * add internal (Point)
	 * @param {Point} pt	added point (const)
	 * @returns {Point} this point object (modified)
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
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @return {Point} new Point object = this + (X,Y)
	 */
	addxn(x, y) {
		return new Point(this.x + x, this.y + y)
	}


	/**
	 * Point operator + (Point)
	 * add external (Point)
	 * @const
	 * @param {Point} pt another Point object (const)
	 * @returns {Point} new Point object = this + another
	 */
	addx(pt) {
		return new Point(this.x + pt.x, this.y + pt.y)
	}

	// ================== subtraction

	/**
	 * Point operator -= (x, y)
	 * subtraction internal numbers
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @returns {Point} this modified Point object
	 */
	subin(x, y) {
		this.x -= x
		this.y -= y
		return this
	}

	/**
	 * Point operator - (Point)
	 * subtraction internal (Point)
	 * @param {Point} pt another Point object (const)
	 * @returns {Point} this modified Point object
	 */
	subi(pt) {
		this.x -= pt.x
		this.y -= pt.y
		return this
	}

	/**
	 * Point operator - (x, y)
	 * @const
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @returns {Point} new Point object = this - (X,Y)
	 */
	subxn(x, y) {
		return new Point(this.x - x, this.y - y)
	}

	/**
	 * Point operator - (Point)
	 * sub external (Point)
	 * @const
	 * @param {Point} pt another Point const object
	 * @returns {Point} new Point object = this - another
	 */
	subx(pt) {
		return new Point(this.x - pt.x, this.y - pt.y)
	}

	/**
	 * min internal numbers
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @returns {Point} this modified Point object
	 */
	minin(x, y) {
		this.x = Math.min(this.x, x)
		this.y = Math.min(this.y, y)
		return this
	}

	/**
	 * min internal (Point)
	 * @param {Point} pt another const Point
	 * @returns {Point} this modified Point object
	 */
	mini(pt) {
		return this.minin(pt.x, pt.y)
	}

	/**
	 * max internal numbers
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @return {Point} this modified Point object
	 */
	maxin(x, y) {
		this.x = Math.max(this.x, x)
		this.y = Math.max(this.y, y)
		return this
	}

	/**
	 * max internal (Point)
	 * @param {Point} pt another const Point
	 * @return {Point} new Point = max(this, another)
	 */
	maxi(pt) {
		return this.maxin(pt.x, pt.y)
	}

	/**
	 * negative internal: pt = -pt
	 * @returns {Point} this modified Point
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
	 * @returns {Point} new Point = -this
	 */
	negx() {
		return new Point(-this.x, -this.y)
	}

	/**
	 * internal multiply by koefficient
	 * Point operator *= (number)
	 * @param {number} k Coefficient
	 * @returns {Point} this modified Point
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
	 * @param {number} k Coefficient
	 * @returns {Point} new Point object
	 */
	mulx(k) {
		return new Point(this.x * k, this.y * k)
	}

	/**
	 * square of length
	 * @const
	 * @returns {number} square of vector length
	 */
	lengthSqr() {
		return this.x * this.x + this.y * this.y
	}

	/**
	 * Length
	 * @const
	 * @returns {number} vector length
	 */
	length() {
		return Math.sqrt(this.lengthSqr())
	}

	/**
	 * Square of distance to point, defined by numbers
	 * @const
	 * @param {number} x X-value
	 * @param {number} y Y-value
	 * @returns {number} distance between this point and (x,y)
	 */
	distSqrn(x, y) {
		let dx = this.x - x, dy = this.y - y
		return dx * dx + dy * dy
	}

	/**
	 * Square of distance to point
	 * @const
	 * @param {Point} pt another Point
	 * @returns {number} square of distance between this and another
	 */
	distSqr(pt) {
		return this.distSqrn(pt.x, pt.y)
	}

	/**
	 * Distance to point
	 * @const
	 * @param {Point} pt another const Point
	 * @returns {number} distance between this and another
	 */
	dist(pt) {
		return Math.sqrt(this.distSqr(pt))
	}

	/**
	 * Make unit vector from angle (in radians)
	 * @param {number} radAngle		angle in radians, for ex: Math.PI/2
	 * @returns {Point} this modified Point object
	 */
	fromRad(radAngle) {
		this.x = Math.cos(radAngle)
		this.y = Math.sin(radAngle)
		return this
	}

	/**
	 * Make unit vector from angle (in degrees)
	 * @param {number} degAngle angle in degrees
	 * @returns {Point} this modified Point object
	 */
	fromDeg(degAngle) {
		return this.fromRad(Math.PI * degAngle / 180)
	}

	/**
	 * Transpose internal
	 * @returns {Point} this modified Point object
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
	 * @returns {Point} new Point object
	 */
	transponx() {
		return new Point(this.y, this.x)
	}

	/**
	 * Rounding and casting to string
	 * @param {number} value number
	 * @returns {string} string
	 */
	static toa(value) {
		return String(Math.round(value * 1000) / 1000)
	}

	/**
	 * Make string from point
	 * @const
	 * @returns {string} = "(x, y)"
	 */
	toString() {
		return `(${Point.toa(this.x)}, ${Point.toa(this.y)})`
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

module.exports = {Point}
