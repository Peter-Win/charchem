/**
 * Created by PeterWin on 26.04.2017.
 */
'use strict'

const expect = require('chai').expect
const Point = require('../../src/math/Point')
const Rect = require('../../src/math/Rect')

describe('Rect initialization', () => {

	it('Constructor', () => {
		const rc1 = new Rect()
		expect(rc1).to.be.eql({A:{x:0, y:0}, B:{x:0, y:0}})

		const rc2 = new Rect(10, 20, 30, 40)
		expect(rc2).to.be.eql({A:{x:10, y:20}, B:{x:30, y:40}})

		const rc3 = new Rect(rc1.A, rc2.B)
		expect(rc3).to.be.eql({A:{x:0, y:0}, B:{x:30, y:40}})
	})

	it('clone', () => {
		const rc1 = new Rect(11, 22, 33, 44)
		const rc2 = rc1.clone()
		expect(rc1).to.not.be.equal(rc2)
		expect(rc2).to.be.eql({A:{x:11, y:22}, B:{x:33, y:44}})
	})

	it('from', () => {
		const rc1 = new Rect(11, 22, 33, 44)
		let rc2 = new Rect()
		rc2.from(rc1)
		rc2.A.x--; rc2.B.y++
		expect(rc2).to.be.eql({A:{x:10, y:22}, B:{x:33, y:45}})
		expect(rc1).to.be.eql({A:{x:11, y:22}, B:{x:33, y:44}})	// rc1 not changed!
	})

	it('init', () => {
		let rc = new Rect()
		rc.init(11, 22, 33, 44)
		expect(rc).to.be.eql({A:{x:11, y:22}, B:{x:33, y:44}})
	})
})

const precision = 0.0001

describe('Rect operations', () => {
	it('LT: Left top corner', () => {
		let rc = new Rect(11, 22, 33, 44)
		expect(rc.LT()).to.be.equal(rc.A)
		const pt = new Point(55, 66)
		expect(rc.LT(pt)).to.be.equal(pt)	// same objects
		expect(rc.A).to.be.eql({x:55, y:66})
	})

	it('RB: Right bottom corner', () => {
		let rc = new Rect(11, 22, 33, 44)
		expect(rc.RB()).to.be.equal(rc.B)
		const pt = new Point(55, 66)
		expect(rc.RB(pt)).to.be.equal(pt)
		expect(rc.RB()).to.be.eql({x:55, y:66})
	})

	it('RT: Right top corner', () => {
		const rc = new Rect(11, 22, 33, 44)
		expect(rc.RT()).to.be.eql({x:33, y:22})
	})

	it('LB: Left bottom corner', () => {
		const rc = new Rect(11, 22, 33, 44)
		expect(rc.LB()).to.be.eql({x:11, y:44})
	})

	it('minLT: Set minimal value for left top', () => {
		let rc1 = new Rect(11, 22, 33, 44)
		let rc2 = rc1.clone()
		rc1.minLT(new Point(100, 0))
		expect(rc1).to.be.eql({A:{x:11, y:0}, B:{x:33, y:44}})
		rc2.minLT(new Point(0, 100))
		expect(rc2).to.be.eql({A:{x:0, y:22}, B:{x:33, y:44}})
	})

	it('maxRB: Set maxinum for right bottom', () => {
		let rc1 = new Rect(11, 22, 33, 44)
		let rc2 = rc1.clone()
		rc1.maxRB({x:100, y:0})
		expect(rc1).to.be.eql({A:{x:11, y:22}, B:{x:100, y:44}})
		rc2.maxRB({x:0, y:100})
		expect(rc2).to.be.eql({A:{x:11, y:22}, B:{x:33, y:100}})
	})

	it('Left, Right, Top and Bottom', () => {
		const rc = new Rect(11, 22, 33, 44)
		expect(rc.L()).to.be.equal(11)
		expect(rc.R()).to.be.equal(33)
		expect(rc.T()).to.be.equal(22)
		expect(rc.Bot()).to.be.equal(44)
	})

	it('Left, Right, Top and Bottom properties', () => {
		const rc1 = new Rect(11, 22, 33, 44)
		let rc2 = rc1.clone()

		expect(rc1.l).to.be.equal(11)
		expect(rc1.r).to.be.equal(33)
		expect(rc1.t).to.be.equal(22)
		expect(rc1.b).to.be.equal(44)

		rc2.l = 55
		rc2.r = 66
		rc2.t = 77
		rc2.b = 88
		expect(rc2).to.be.eql({A:{x:55, y:77}, B:{x:66, y:88}})
	})

	it('Width, Height and center values', () => {
		const rc = new Rect(2, 4, 22, 44)
		expect(rc.W).to.be.equal(20)
		expect(rc.H).to.be.equal(40)
		expect(rc.cx).to.be.closeTo(12, precision)
		expect(rc.cy).to.be.closeTo(24, precision)
	})

	it('Center and size', () => {
		const rc = new Rect(2, 4, 22, 44)
		expect(rc.center()).to.be.eql({x:12, y:24})
		expect(rc.size()).to.be.eql({x:20, y:40})
	})


	it('is0', () => {
		const rc1 = new Rect()
		const rc2 = new Rect(10, 20, 10, 20)
		const rc3 = new Rect(11, 22, 33, 44)

		expect(rc1.is0()).to.be.true
		expect(rc2.is0()).to.be.true
		expect(rc3.is0()).to.be.false
	})

	it('Move rect', () => {
		let rc = new Rect(11, 22, 33, 44)
		rc.moven(-1, -2)
		expect(rc).to.be.eql({A:{x:10, y:20}, B:{x:32, y:42}})
		rc.move({x:1, y:2})
		expect(rc).to.be.eql({A:{x:11, y:22}, B:{x:33, y:44}})
	})

	it('Grow', () => {
		let rc1 = new Rect(10, 20, 30, 40)
		let rc2 = rc1.clone()
		let rc3 = rc1.clone()
		let rc4 = rc1.clone()

		rc1.grow(1)
		expect(rc1).to.be.eql({A:{x:9, y:19}, B:{x:31, y:41}})

		rc2.grow(1, 2)
		expect(rc2).to.be.eql({A:{x:9, y:18}, B:{x:31, y:42}})

		rc3.grow({x:2, y:4})
		expect(rc3).to.be.eql({A:{x:8, y:16}, B:{x:32, y:44}})

		rc4.grow(new Point(3, 5))
		expect(rc4).to.be.eql({A:{x:7, y:15}, B:{x:33, y:45}})
	})

	it('Unite', () => {
		const rc0 = new Rect(0, 0, 10, 20)

		let rc1 = new Rect()
		rc1.unite(rc0)
		expect(rc1).to.be.eql({A:{x:0, y:0}, B:{x:10, y:20}})

		let rc2 = new Rect(5, 6, 70, 80)

		rc2.unite(rc0)
		expect(rc2).to.be.eql({A:{x:0, y:0}, B:{x:70, y:80}})
	})
})
