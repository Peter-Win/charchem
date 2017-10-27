/*
 * You can access:
 * core.MenTbl
 * core.MenTblArray
 */
const MenTblModule = require('./MenTbl')
const MenTbl = MenTblModule.MenTbl
const MenTblArray = MenTblModule.MenTblArray

/**
 * Is this koefficient abstract? For example n in -(CH₂)ₙ-
 * @param {number|string} n checking coefficient
 * @returns {boolean} true, if coefficient is abstract
 */
const isAbsK = n =>
	typeof n !== 'number'

/**
 * Standard rounding for mass value
 * @param {number} m mass value
 * @returns {number} rounded mass value
 */
const massRound = m =>
	Math.round(m * 1000) / 1000


module.exports = {
	isAbsK,
	massRound,
	MenTbl,
	MenTblArray,
}