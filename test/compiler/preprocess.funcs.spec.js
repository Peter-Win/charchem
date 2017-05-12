/**
 * Created by PeterWin on 04.05.2017.
 */

import { expect } from 'chai'
import { Macros, Ctx, defMacro, scanPar, readRealPars, readFormalPars, execMacros, bodyPreprocess,
	preProcess } from '../../src/compiler/preprocess'
import ChemSys from '../../src/ChemSys'
import ChemError from '../../src/core/ChemError'

describe('preprocess', () => {
	it('defMacro', () => {
		// Macros can begin from A-Za-z letters
		let ctx1 = new Ctx('~Invalid')
		expect(() => defMacro(ctx1)).to.throw(Error)	// Invalid name throws Error


	})

	it('scanPar', () => {
		let s
		// simple case
		expect(scanPar('a, b, c', 0)).to.be.equal(1)
		// use (..)
		expect(scanPar('a(b), c', 0)).to.be.equal(4)	// = a(b)
		expect(scanPar('a(b,c), d', 0)).to.be.equal(6)	// = a(b,c)
		expect(scanPar('a(b(c)), d', 0)).to.be.equal(7)	// = a(b(c))
		expect(scanPar(s = 'a(b,c,d', 0)).to.be.equal(s.length)		// to end of string
		// quotes
		expect(scanPar('"a,b",c,d', 0)).to.be.equal(5)	// = "a,b"
		expect(scanPar('"(a",b', 0)).to.be.equal(4)		// = "(a"
	})

	it('readRealPars', () => {
		let ctx = new Ctx('(a1,b2,c3)')
		let params = []
		// skip 1st ( symbol
		readRealPars(ctx, params, 1)
		expect(params).to.be.eql([ 'a1', 'b2', 'c3' ])

		ctx = new Ctx('(a1,b2,c3')	// invalid string: bracket is not closed
		expect(()=>readRealPars(ctx, params, 1)).to.throw(Error)
	})

	it('readFormalPars', () => {
		let ctx = new Ctx('@:a(x:11,y)', 3)	// set position on bracket
		let pmap = {}, pndx = []
		readFormalPars(ctx, pmap, pndx, 1)	// offset=1 to skip bracket pos
		expect(pmap).to.be.eql({ x:'11', y:'' })
		expect(pndx).to.be.eql(['x', 'y'])

		ctx = new Ctx('(x,y,z')		// invalid definition: bracket is not closed
		expect(() => readFormalPars(ctx, pmap, pndx, 1)).to.throw(Error)

		ctx = new Ctx('(x,y,#')		// invalid parameter name: #
		expect(() => readFormalPars(ctx, pmap, pndx, 1)).to.throw(Error)
	})

	it('execMacros', () => {
		// Simple text, without parameters
		expect(execMacros(')hello', [])).to.be.equal('hello')

		// Use 1 parameter without default value
		expect(execMacros('x)x=&x', ['25'])).to.be.equal('x=25')

		// Use 2 parameters without default values
		expect(execMacros('x,y)[x=&x; y=&y]', ['11', '22'])).to.be.equal('[x=11; y=22]')

		// Use parameters with default values.
		expect(execMacros('x:11,y:22)[x=&x; y=&y]', ['', 'ABC'])).to.be.equal('[x=11; y=ABC]')

		// Multiple use one parameter
		expect(execMacros('a){&a-&a-&a}', ['X'])).to.be.equal('{X-X-X}')

		// similar parameters
		expect(execMacros('x,xx,xxx)(&xxx/&xx/&x)', ['A', 'B', 'C'])).to.be.equal('(C/B/A)')

		// Call macros from macro
		ChemSys.macros.Tst = new Macros('Tst')
		ChemSys.macros.Tst.body = 's)[&s]'
		expect(execMacros('x,y)@Tst(&x)-@Tst(&y)', ['Hello', 'World'])).to.be.equal('[Hello]-[World]')
		// Unspecified macros Undef
		expect(() => execMacros('x,y)@Undef(&x)-@Tst(&y)', ['Hello', 'World'])).to.throw('Macros not found: Undef')
	})

	it('bodyPreprocess', () => {
		// Clear global macros
		ChemSys.macros = {}

		// Simple text without macros
		let ctx = new Ctx('hello@;')
		bodyPreprocess(ctx)
		expect(ctx.dst).to.be.equal('hello')

		// Declare macros without run
		ctx = new Ctx('Hello@:A(x)[&x]@;World!@()')
		bodyPreprocess(ctx)
		expect(ctx.dst).to.be.equal('HelloWorld!')
		expect(ChemSys.macros).to.have.property('A')

		// Call declared macros
		ctx = new Ctx('Hello@A(3.14)World!@;')
		bodyPreprocess(ctx)
		expect(ctx.dst).to.be.equal('Hello@A(3.14)World!')	// Macros don't executed

		// Declare and run macros
		ctx = new Ctx('Hello@:B(y){&y}@(123)World!@(567)')
		bodyPreprocess(ctx)
		expect(ctx.dst).to.be.equal('Hello@B(123)World!')
		expect(ChemSys.macros).to.have.property('B')

		// Use more then one macros
		ctx = new Ctx('First@A(1)Second@B(2)Third@:C(c)-=@A(&c)=-@(3)@;')
		bodyPreprocess(ctx)
		expect(ctx.dst).to.be.equal('First@A(1)Second@B(2)Third@C(3)')
		expect(ChemSys.macros).to.have.property('C')
	})

	it('preProcess', () => {
		// clear global macros
		ChemSys.macros = {}

		// Simple text without macros
		expect(preProcess('Hello!')).to.be.equal('Hello!')

		// declare macros without run
		expect(preProcess('Hello@:A(x)[&x]@;World!')).to.be.equal('HelloWorld!')

		// Call declared macros
		expect(preProcess('Hello@A(3.14)World!')).to.be.equal('Hello[3.14]World!')

		// Declare and run macros
		expect(preProcess('Hello@:B(y){&y}@(123)World!')).to.be.equal('Hello{123}World!')

		// macros without parameters
		expect(preProcess('Hello@:E(a:$)-=&a=-@()World!')).to.be.equal('Hello-=$=-World!')

		// Use more then one macros
		expect(preProcess('First@A(1)Second@B(2)Third@:C(c)-=@A(&c)=-@(3)')).
			to.be.equal('First[1]Second{2}Third-=[3]=-')

		// Call parameters by name. Undefined parameter c ignored
		expect(preProcess('@:Two(a,b)[A=&a; B=&b]@(b:33,a:11,c:44)')).to.be.equal('[A=11; B=33]')

		// Use undefined param inside macro
		expect(preProcess('@:X(b)[&a,&b]@(5)')).to.be.equal('[&a,5]')

		// Try to define invalid macro
		expect(() => preProcess('@:-()')).to.throw(ChemError)

		// Invalid macros end
		expect(() => preProcess('@:D()Hello!@-')).to.throw('Invalid macros end')

		// Invalid parameter name:
		expect(() => preProcess('@:D($)&$@(1)')).to.throw('Invalid parameter name: $')
	})
})
