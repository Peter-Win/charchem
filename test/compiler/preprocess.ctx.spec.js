/**
 * Created by PeterWin on 02.05.2017.
 */
const {expect} = require('chai')
const {Ctx} = require('../../src/compiler/preprocess')
const {ChemError} = require('../../src/core/ChemError')

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

		let ctx4 = new Ctx()
		expect(ctx4).to.have.property('src', '')
		expect(ctx4).to.have.property('pos', 0)
	})

	it('err: error generate', () => {
		let ctx = new Ctx('ABC', 1)
		expect(() => ctx.err('First error')).to.throw(ChemError)
		expect(ctx.pos).to.be.equal(1)

		expect(() => ctx.err('Second error', 2)).to.throw('Second error')
		expect(ctx.pos).to.be.equal(2)

		expect(() => ctx.err('Third error', -2)).to.throw(ChemError)
		expect(ctx.pos).to.be.equal(0)
	})


	it('n: read some characters from context', () => {
		let ctx = new Ctx('@Hello!')
		expect(ctx.n()).to.be.equal('@')
		expect(ctx.n(0)).to.be.equal('')
		expect(ctx.n(5)).to.be.equal('Hello')
		expect(() => ctx.n(2)).to.throw(ChemError)	// because context contains 1 symbol only
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
		expect(ctx.stk).to.be.eql(['First', 'Second'])
		ctx.w('.')
		expect(ctx.pop()).to.be.equal('.')
		expect(ctx.pop()).to.be.equal('Second')
		expect(ctx.pop()).to.be.equal('First')
		expect(ctx.dst).to.be.empty
	})

	it('clr', () => {
		let ctx = new Ctx('...')
		ctx.w('1234')					// write something to ctx
		expect(ctx.dst).to.not.be.empty	// ctx.dst is not empty
		ctx.clr()						// clear ctx
		expect(ctx.dst).to.be.empty		// ctx.dst is empty after ctx.clr()
	})
})
