/**
 * Created by PeterWin on 08.05.2017.
 */

// Старый формат
//      64
//..32     128
// 16         1
//   8      2
//      4
// Черточки / \ | . \  | -_

/**
 * Dashes for item
 * @param {string[]} args function arguments
 * @param {number[]} argsPos arguments positions
 * @param {function} toNum convert string to number
 * @returns {number[]} list
 */
const dashes = (args, argsPos, toNum) => {
	let nextDashes = []
	let i, arg = args[0]
	if (/^[-_.\/\\<>|]+$/.test(arg)) {
		let dashFlags = 0, c, nu = 0, nm = 0, nd = 0, m
		for (i = 0; i < arg.length; i++) {
			c = arg[i]
			switch (c) {
			case '.':
				nu++
				nm++
				nd++
				break
			case '-':
				dashFlags |= 64
				nu++
				nm++
				nd++
				break
			case '_':
				dashFlags |= 4
				nu++
				nm++
				nd++
				break
			case '|':
				dashFlags |= nm ? 1 : 16
				nm++
				break
			case '/':
				dashFlags |= nu ? 2 : 32
				nu++
				break
			case '\\':
				dashFlags |= nd ? 128 : 8
				nd++
				break
			case '<':
				dashFlags |= 40
				nu++
				nd++
				break
			case '>':
				dashFlags |= 130
				break
			}
		}
		for (i = 0, m = 1; i < 8; i++, m <<= 1) {
			if (m & dashFlags)
				nextDashes.push(i * 45)
		}
	} else {
		for (i in args)
			nextDashes.push(toNum(args[i], argsPos[i]))
	}
	return nextDashes
}

const SideSyn = {U:'T', D:'B', u:'t', d:'b'},
	SideMap = {R:0x81, L:0x18, T:0x60, B:0x06},
	// Битовые значения для вычёркивания лишнего. По сути = SideMap[i] ^ SubSideMap[i]
	SubSideMapNeg = {Rt:1, Bl:2, Br:4, Lt:8, Lb:16, Tr:32, Tl:64, Rb:128}

/**
 * Dots for item
 * @param {string[]} args function arguments
 * @param {number[]} argsPos arguments positions
 * @param {function} toNum convert function
 * @returns {number[]} list
 */
const dots = (args, argsPos, toNum) => {
	// Поддерживается 2 формата аргументов:
	// - UTDBLRutdblr для пар точек сверху, снизу, слева и справа
	// - список углов
	// Angles map:
	// R:0,7;      B:1,2;    L:3,4;    T:5,6  angle = 22.5 + i*45
	//   1000.0001 0000.0110 0001.1000 0110.0000
	//    Tl:0x20 Tr:0x40   SubSideMap
	//  Lt:0x10     Rt:0x80
	//  Lb:0x08     Rb:0x01
	//    Bl:0x04 Br:0x02
	const nextDots = []
	const arg = args[0]
	let i
	if (/^[!UTBDLR]+$/i.test(arg)) {
		// Старый формат
		let	c, s = '', inv = 0, map = 0, m
		for (i = 0; i < arg.length; i++) {
			c = arg[i]
			c = SideSyn[c] || c
			if (c === '!') {
				inv = 255
			} else if (SideMap[c]) {
				map |= SideMap[c]
				s = c
			} else {
				s += c
				if (SubSideMapNeg[s]) {
					map &= ~SubSideMapNeg[s]
				}
			}
		}
		map ^= inv
		for (i = 0, m = 1; i < 8; i++, m <<= 1) {
			if (m & map)
				nextDots.push(22.5 + i * 45)
		}
	} else {
		// list of angles
		for (i in args) {
			nextDots.push(toNum(args[i], argsPos[i]))
		}
	}
	return nextDots
}

module.exports = {dashes, dots}