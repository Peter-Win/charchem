
// Roman numerals for the designation of charges
const RomanNum = {i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8}

/**
 * html escape
 * @param {string|*} txt	If not string, always return ''
 * @returns {string} escaped string
 */
const esc = txt =>
	(typeof txt === 'string') ? txt.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''

module.exports = {
	esc,
	RomanNum,
}
