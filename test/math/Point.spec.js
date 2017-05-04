/**
 * Created by PeterWin on 26.04.2017.
 */
"use strict"

import Point from '../../src/math/Point'
import {expect} from 'chai'

describe('Point construction', () => {

	it('Default constructor', () => {
		let pt = new Point()
		expect(pt).to.be.eql({x:0, y:0})
	})

	it('Constructor with two params', () => {
		let pt = new Point(11, 22)
		expect(pt).to.be.eql({x:11, y:22})
	})

	it('Constructor with single param', () => {
		let pt = new Point(12)
		expect(pt).to.be.eql({x:12, y:12})
	})
})

describe('Point utilites', () => {

	it('Comparison with zero', () => {
		let zero = 1.000001 - 1
		expect(zero).to.be.not.equal(0)
		expect(Point.is0(zero)).to.be.true

		let noZero = 1.1 - 1
		expect(Point.is0(noZero)).to.be.false
	})

	it('Initialization', () => {
		let pt = new Point(11, 22)
		pt.init(33, 44)
		expect(pt).to.be.eql({x:33, y:44})
	})

	it('Copying a point from another object', () => {
		let src = new Point(11, 22)
		let dst = new Point()
		dst.from(src)
		expect(dst).to.be.eql({x:11, y:22})
	})

	it('Point cloning', () => {
		const src = new Point(11, 22)
		const dst = src.clone()
		expect(dst).to.be.eql({x:11, y:22})
	})

	it('Point equals', () => {
		const a = new Point(11, 22)
		const b = new Point(11.0005, 21.9995)
		expect(a.eq(b)).to.be.true
		expect(a.eq(new Point())).to.be.false
	})
})

describe('Operations with points', () => {

	it('addin: Point operator += (x, y)', () => {
		let pt = new Point(11, 22)
		pt.addin(1, -1)
		expect(pt).to.be.eql({x:12, y:21})
	})

	it('addi: Point operator += (Point)', () => {
		let pt = new Point(11, 22)
		let delta = new Point(1, -1)
		pt.addi(delta)
		expect(pt).to.be.eql({x:12, y:21})
	})

	it('addxn: Point operator + (x, y)', () => {
		const src = new Point(11, 22)
		const dst = src.addxn(2, -2)
		expect(dst).to.be.eql({x:13, y:20})
	})

	it('addx: Point operator + (Point)', () => {
		const src = new Point(11, 22)
		const delta = new Point(2, -2)
		const dst = src.addx(delta)
		expect(dst).to.be.eql({x:13, y:20})
	})

	it('subin: Point operator -= (x, y)', () => {
		let pt = new Point(11, 22)
		pt.subin(1, 2)
		expect(pt).to.be.eql({x:10, y:20})
	})

	it('subi: Point operator -= (Point)', () => {
		let pt = new Point(11, 22)
		pt.subi(new Point(1, 2))
		expect(pt).to.be.eql({x:10, y:20})
	})

	it('subxn: Point operator - (x,y)', () => {
		const src = new Point(11, 22)
		const dst = src.subxn(1, 2)
		expect(dst).to.be.eql({x:10, y:20})
	})

	it('subx: Point operator - (Point)', () => {
		const src = new Point(11, 22)
		const delta = new Point(1, 2)
		const dst = src.subx(delta)
		expect(dst).to.be.eql({x:10, y:20})
	})

	it('mini: internal min', () => {
		let pt = new Point(11, 22)
		pt.mini(new Point(100, 0))
		expect(pt).to.be.eql({x:11, y:0})

		pt.init(11, 22)
		pt.mini(new Point(0, 100))
		expect(pt).to.be.eql({x:0, y:22})
	})

	it('maxi: internal max', () => {
		let pt = new Point(11, 22)
		pt.maxi(new Point(100, 0))
		expect(pt).to.be.eql({x:100, y:22})

		pt.init(11, 22)
		pt.maxi(new Point(0, 100))
		expect(pt).to.be.eql({x:11, y:100})
	})

	it('negi: negative internal', () => {
		let pt = new Point(11, 22)
		let pt1 = pt.negi()
		expect(pt).to.be.eql({x:-11, y:-22})
		expect(pt1).to.be.equal(pt)	// same object
	})

	it('negx: negative external', () => {
		let pt = new Point(11, 22)
		let pt1 = pt.negx()
		expect(pt).to.be.eql({x:11, y:22})
		expect(pt1).to.be.eql({x:-11, y:-22})
	})

	it('muli: internal multiply by koefficient', () => {
		let pt = new Point(11, 33)
		let pt1 = pt.muli(2)
		expect(pt).to.be.eql({x:22, y:66})
		expect(pt1).to.be.equal(pt)	// same objects
	})

	it('mulx: external multiply by koefficient', () => {
		const pt = new Point(11, 33)
		let pt1 = pt.mulx(2)
		expect(pt).to.eql({x:11, y:33})
		expect(pt1).to.eql({x:22, y:66})
	})

	it('length', () => {
		const pt = new Point(3, 4)
		const L = pt.length()
		expect(L).to.be.equal(5)
	})

	it('distance', () => {
		const a = new Point(10, 20)
		const b = new Point(20, 20)
		expect(a.dist(b)).to.be.equal(10)
	})

	const precision = 0.001

	it('fromRadians', () => {
		let pt = new Point()
		pt.fromRad(0)
		expect(pt.x).to.be.closeTo(1, precision)
		expect(pt.y).to.be.closeTo(0, precision)

		pt.fromRad(Math.PI/2)
		expect(pt.x).to.be.closeTo(0, precision)
		expect(pt.y).to.be.closeTo(1, precision)

		pt.fromRad(Math.PI)
		expect(pt.x).to.be.closeTo(-1, precision)
		expect(pt.y).to.be.closeTo(0, precision)

		pt.fromRad(Math.PI/6)
		expect(pt.x).to.be.closeTo(Math.sqrt(3)/2, precision)
		expect(pt.y).to.be.closeTo(0.5, precision)
	})

	it('fromDeg', () => {
		let pt = new Point()
		pt.fromDeg(0)
		expect(pt.x).to.be.closeTo(1, precision)
		expect(pt.y).to.be.closeTo(0, precision)

		pt.fromDeg(90)
		expect(pt.x).to.be.closeTo(0, precision)
		expect(pt.y).to.be.closeTo(1, precision)

		pt.fromDeg(180)
		expect(pt.x).to.be.closeTo(-1, precision)
		expect(pt.y).to.be.closeTo(0, precision)

		pt.fromDeg(30)
		expect(pt.x).to.be.closeTo(Math.sqrt(3)/2, precision)
		expect(pt.y).to.be.closeTo(0.5, precision)
	})

	it('transponi', () => {
		let pt = new Point(11, 22)
		let pt1 = pt.transponi()
		expect(pt).to.be.equal(pt1)
		expect(pt).to.be.eql({x:22, y:11})
	})

	it('transponx', () => {
		const pt = new Point(11, 22)
		let pt1 = pt.transponx()
		expect(pt).to.be.eql({x:11, y:22})
		expect(pt1).to.be.eql({x:22, y:11})
	})

	it('toString', () => {
		const pt = new Point(11, 22)
		expect(pt.toString()).to.be.equal('{11, 22}')
	})

	const toDeg = rad => rad*180/Math.PI

	it('polarAngle', () => {
		let pt = new Point(0, 0)
		expect(pt.polarAngle()).to.be.equal(0)

		pt.init(10, 0)
		expect(pt.polarAngle()).to.be.equal(0)

		pt.init(0, 10)
		expect(toDeg(pt.polarAngle())).to.be.equal(90)
		pt.init(0, -10)
		expect(toDeg(pt.polarAngle())).to.be.equal(-90)
		pt.init(-10, 0)
		expect(toDeg(pt.polarAngle())).to.be.closeTo(180, precision)
		pt.init(10, 10)
		expect(toDeg(pt.polarAngle())).to.be.closeTo(45, precision)
		pt.init(-10, 10)
		expect(toDeg(pt.polarAngle())).to.be.closeTo(135, precision)
		pt.init(-10, -10)
		expect(toDeg(pt.polarAngle())).to.be.closeTo(-135, precision)
		pt.init(10, -10)
		expect(toDeg(pt.polarAngle())).to.be.closeTo(-45, precision)
	})
})


