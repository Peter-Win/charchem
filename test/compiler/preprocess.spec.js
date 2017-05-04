/**
 * Created by PeterWin on 02.05.2017.
 */
import {expect} from 'chai'
import {Ctx} from '../../src/compiler/preprocess'

describe('Ctx', ()=>{

	it('constructor', () => {
		let ctx1 = new Ctx('abcd')
		expect(ctx1).to.have.property('src', 'abcd')
		expect(ctx1).to.have.property('pos', 0)

		let ctx2 = new Ctx('xyz', 11)
		expect(ctx2).to.have.property('src', 'xyz')
		expect(ctx2).to.have.property('pos', 11)

		let ctx3 = new Ctx(ctx2)
		expect(ctx3).to.have.property('src', 'xyz')
		expect(ctx3).to.have.property('pos', 11)
	})


	it('n: read some characters from context', () => {
		let ctx = new Ctx('@Hello!')
		expect(ctx.n()).to.be.equal('@')
		expect(ctx.n(5)).to.be.equal('Hello')
		expect(() => ctx.n(2)).to.throw(Error)
	})

	it('s: substring search', () => {
		let ctx = new Ctx('First,Second,,Third')

		expect(ctx.s(',')).to.be.equal('First')
		expect(ctx.s(',')).to.be.equal('Second')
		expect(ctx.s(',')).to.be.equal('')
		expect(ctx.s(',', true)).to.be.null
		expect(() => {ctx.s(',')}).to.throw(Error)
	})

	it('end: Is there an end?', () => {
		let ctx = new Ctx('ABCD')
		expect(ctx.end()).to.be.false
		expect(ctx.n(2)).to.be.equal('AB')
		expect(ctx.end()).to.be.false
		expect(ctx.n(2)).to.be.equal('CD')
		expect(ctx.end()).to.be.true
	})

	it('w: write to dst', ()=>{
		let ctx = new Ctx('abcd')
		ctx.w('xyz')
		expect(ctx.dst).to.be.equal('xyz')
		ctx.w('123')
		expect(ctx.dst).to.be.equal('xyz123')
	})

	it('wf: write reminder', () => {
		let ctx = new Ctx('ABCDabcd')
		ctx.n(4)
		ctx.w('123')
		ctx.wf()
		expect(ctx.dst).to.be.equal('123abcd')
	})

	it('push/pop', () => {
		let ctx = new Ctx('')
		ctx.w('First')
		ctx.push()
		expect(ctx.dst).to.be.empty
		expect(ctx.stk).to.be.eql(['First'])
		ctx.w('Second')
		ctx.push()
		expect(ctx.stk).to.be.eql(['First','Second'])
		ctx.w('.')
		expect(ctx.pop()).to.be.equal('.')
		expect(ctx.pop()).to.be.equal('Second')
		expect(ctx.pop()).to.be.equal('First')
		expect(ctx.dst).to.be.empty
	})

	it('clr', () => {
		let ctx = new Ctx('...')
		ctx.w('1234')
		expect(ctx.dst).to.not.be.empty()
		ctx.clr()
		expect(ctx.dst).to.be.empty()
	})
})

