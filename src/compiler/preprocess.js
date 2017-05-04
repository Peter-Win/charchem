/**
 * Created by PeterWin on 02.05.2017.
 */

export class Macros {
	/**
	 * @constructor
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name
		this.body = ''		 // string with @A and & instructions
	}

	exec(params) {
		return this.body;
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
			this.src = def.src;
			this.pos = def.pos;
		} else if (typeof def === 'string') {
			this.src = def;
		}
	}

	err(msg, pos) {
		if (pos) {
			if (pos < 0) this.pos += pos; else this.pos = pos
		}
		throw new Error(msg)
	}

	/**
	 * Read specified count of characters from context
	 * @param {number=1} count
	 * @returns {string}
	 */
	n(count = 1) {
		if (count === 0) return '';
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
			if (bNoErr) return null;
			this.err('Expected ' + needle + ' character in macros');
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


export function preProcess(src) {
	// TODO: dummy
	return src
}