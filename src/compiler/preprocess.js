/**
 * Created by PeterWin on 02.05.2017.
 */
import ChemSys, { esc } from '../ChemSys'
import ChemError from '../core/ChemError'

export class Macros {
	/**
	 * @constructor
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name
		this.body = ''		 // string with @A and & instructions
	}
}

const M1st = /[A-Z]/i		// Possible first characters of macros name
const TmParam = /^[A-Z][A-Z\d]*$/i

// context for preprocessing
export class Ctx {
	/**
	 * @constructor
	 * @param {string|Ctx} def
	 * @param {int=} pos
	 */
	constructor(def, pos = 0) {
		this.src = ''
		this.dst = ''
		this.stk = []
		this.pos = pos
		// из другого контекста
		if (def instanceof Ctx) {
			this.src = def.src
			this.pos = def.pos
		} else if (typeof def === 'string') {
			this.src = def
		}
	}

	err(msg, pos) {
		if (pos) {
			if (pos < 0) this.pos += pos; else this.pos = pos
		}
		throw new ChemError(msg)
	}

	/**
	 * Read specified count of characters from context
	 * @param {number=1} count
	 * @returns {string}
	 */
	n(count = 1) {
		if (count === 0) return ''
		if (this.pos + count > this.src.length)
			this.err('Unexpected end of macros')
		let startPos = this.pos,
			finishPos = startPos + count,
			result = this.src.slice(startPos, finishPos)
		this.pos = finishPos
		return result
	}


	/**
	 * Substring search
	 * @param {string} needle
	 * @param {boolean=} bNoErr
	 * @returns {number|null}
	 */
	s(needle, bNoErr = false) {
		let curPos = this.pos,
			needlePos = this.src.indexOf(needle, curPos)
		if (needlePos < 0) {
			if (bNoErr) return null
			this.err('Expected ' + needle + ' character in macros')
		}
		this.pos = needlePos + needle.length
		return curPos === needlePos ? '' : this.src.slice(curPos, needlePos)
	}

	/**
	 * Is there an end?
	 * @returns {boolean}
	 */
	end() {
		return this.pos >= this.src.length
	}

	/**
	 * output to dst
	 * @param {string} text
	 */
	w(text) {
		this.dst += text
	}

	/**
	 * Write reminder of src into dst buffer
	 */
	wf() {
		this.w(this.src.slice(this.pos))
		this.pos = this.src.length
	}

	push() {
		this.stk.push(this.dst)
		this.dst = ''
	}

	pop() {
		let tmp = this.dst
		this.dst = this.stk.pop()
		return tmp
	}

	clr() {
		this.dst = ''
	}
}

/**
 * Define new macro
 * name, formal params, body
 * Position of ctx must point to begin of macros name
 * if end by @;, then nothing write
 * if end by @(..., then write @name(...
 * @param ctx
 */
export function defMacro(ctx) {
	let c,
		p0 = ctx.pos,
		name = ctx.s('('),
		macro = new Macros(name)

	if (!M1st.test(name[0]))
		ctx.err('Invalid macro name', p0)

	// Reading the body of the macro
	// Parameters are read together with the body and parsed each time it is called.
	// This makes it possible to include the parameters of the parent macro in them.
	ctx.push()
	bodyPreprocess(ctx)
	macro.body = ctx.pop()

	// Analysis of the end
	c = ctx.n()
	if (c === ';') {
		// Just an ending
	} else if (c === '(') {
		// End with call macro
		ctx.w('@' + name + c)
	} else {
		ctx.err('Invalid macros end')
	}
	ChemSys.macros[name] = macro
}

/**
 * Define the parameter boundary. The stopper is a sign , or )
 * @param {string} src
 * @param {number} pos
 * @returns {number}
 */
export function scanPar(src, pos) {
	// balance of parentheses and quotes is very important
	let c, lock = 0, bComm = 0
	while (pos < src.length) {
		c = src[pos]
		if (c === '"') bComm = !bComm
		else if (c === '(' && !bComm) lock++
		else if (c === ',' && !bComm && lock === 0) break
		else if (c === ')' && !bComm) {
			if (lock > 0) lock--
			else break
		}
		pos++
	}
	return pos
}

/**
 * Read parameters list from context
 * @param {Ctx} ctx
 * @param {string[]} params
 * @param {number} offset
 */
export function readRealPars(ctx, params, offset) {
	ctx.pos += offset
	let ndx = 0
	for(;;) {
		let p0 = ctx.pos,
			p1 = scanPar(ctx.src, p0)
		if (p1 >= ctx.src.length) {
			ctx.err('Real params list is not closed')
		}
		params[ndx++] = ctx.n(p1 - p0)
		let c = ctx.n()
		if (c === ')') break
	}
}

/**
 * Read formal parameters
 * Context position point = position of bracket + 1
 * @param {Ctx} ctx
 * @param {Object<string,string>} paramsMap
 * @param {string[]} paramsIndex
 * @param {number=} offset
 */
export function readFormalPars(ctx, paramsMap, paramsIndex, offset = -1) {
	ctx.pos += offset
	for (;;) {
		let k, c, name, posStart = ctx.pos
		let posFinish = scanPar(ctx.src, posStart)
		if (posFinish >= ctx.src.length)
			ctx.err('Formal params list is not closed')

		let par = ctx.n(posFinish - posStart) // parameter declaration accepted
		k = par.indexOf(':')
		if (k < 0) {
			// without default value
			name = par
			par = ''
		} else {
			// with default value
			name = par.slice(0, k)
			par = par.slice(k + 1)
		}

		// Check parameter name
		// Контролируем правильность описания названия параметра
		if (!TmParam.test(name))
			ctx.err('Invalid parameter name: ' + esc(name))

		paramsMap[name] = par
		paramsIndex.push(name)
		c = ctx.n()
		if (c === ')')
			break
	}
}

/**
 * Macros execution
 * @param {string} src	Macros with formal params without first (. For example: x,y)&x,&y
 * @param {string[]} params	Index list of actual parameters, in the text of which there can be names
 * This is done because the number of formal parameters is not known exactly before the call
 */
export function execMacros(src, params) {
	let ctx = new Ctx(src)
	// extract formal parameters
	let c = ctx.n(), pmap = {}, pndx = []
	if (c !== ')') {
		readFormalPars(ctx, pmap, pndx)
	}
	if (pndx.length > 0) {
		let k, id, actualParam, i, j = 0
		// Substitute the actual values
		for (i in params) {
			actualParam = params[i]
			// If the parameter starts at <param name>:..., then instead of the index, use the name
			k = actualParam.indexOf(':')
			if (k > 0) {
				id = actualParam.substring(0, k)
				if (id in pmap) { // Parameter found to be addressed by key
					pmap[id] = actualParam.slice(k + 1)
				}
				continue
			}
			id = pndx[j++]
			if (actualParam) // The index parameter can be omitted if it is empty. Then the default value will be used instead
				pmap[id] = actualParam
		}
		// Replace parameters with values
		ctx.wf()
		let chunks = ctx.dst.split('&')
		for (i = 1; i < chunks.length; i++) {
			// Looking for the most suitable parameter
			id = ''
			for (actualParam in pmap) {
				if (chunks[i].slice(0, actualParam.length) === actualParam && actualParam.length > id.length) id = actualParam
			}
			// If there is a sign & in the formula with which no parameters are associated, skip
			if (!id) {
				chunks[i] = '&' + chunks[i]
			} else {
				// Replace a parameter with a value
				chunks[i] = pmap[id] + chunks[i].slice(id.length)
			}
		}
		// Gathering a new context ...
		ctx = new Ctx('')
		chunks.forEach(chunk => ctx.src += chunk)
	}
	// Decrypt all macros @A()
	for (;;) {
		c = ctx.s('@', true)
		if (c === null) {
			// End of macros
			ctx.wf()
			break
		}
		// The declaration was found. It can only be a @A
		// The other cases are filtered in bodyPreprocess
		ctx.w(c)
		let name = ctx.s('('),
			m = ChemSys.macros[name],
			pars = []
		if (!m)
			ctx.err('Macros not found: ' + name)
		// Извлечение фактических параметров
		c = ctx.n()
		if (c !== ')') {
			readRealPars(ctx, pars, -1)
		}
		ctx.w(execMacros(m.body, pars))
	}
	return ctx.dst
}

// Функция, которая ищет конец макроопределения. При этом, на вывод не идут объявления @:
// Конструкция @:A()...@() заменяется на @A()
// Окончание либо по концу буфера, либо по конструкции, отличающейся от @: и @A
/**
 * Search the end of macros
 * Declarations @: do not output. Instruction @:A()...@() replaced by @A()
 * @param {Ctx} ctx
 */
export function bodyPreprocess(ctx) {
	let c, plain
	for(;;) {
		plain = ctx.s('@', 1)
		if (plain === null) { // макросов больше нет
			ctx.wf() // пишем остаток строки и заканчиваем обработку
			break
		}
		ctx.w(plain) // Previous text output
		c = ctx.n() // next character
		if (c === ':') {
			// new macros declaration
			defMacro(ctx)
		} else if (M1st.test(c)) {
			// call to declared macros
			ctx.w('@' + c)
			// continue
		} else {
			// Остальные символы расцениваются как окончание тела. их разбор делает вызывающий код
			ctx.pos--
			break
		}
	} // for(;;)
}

/**
 * Preprocess
 * @param {string} src
 * @returns {string}
 * @throws {ChemError}
 */
export function preProcess(src) {
	let ctx = new Ctx(src)
	bodyPreprocess(ctx)
	// This situation is impossible
	// if (ctx.pos !== src.length)
	//	ctx.err('Invalid preprocessor finish')

	// execute
	let dummyBody = ')' + ctx.dst
	return execMacros(dummyBody, [])
}
