const utils = require('./utils')
const {Macros} = require('./compiler/preprocess')
const {chemCompiler} = require('./compiler/main')
const {findElem} = require('./core/MenTbl')
const TextMaker = require('./visitors/TextMaker')
const ChemNode = require('./core/ChemNode')
const IsAbstract = require('./visitors/IsAbstract')
const MassCalc = require('./visitors/MassCalc')
const ChargeCalc = require('./visitors/ChargeCalc')
const ElemListMaker = require('./visitors/ElemListMaker')
const {ver, verStr} = require('./utils/version')

const ChemSys = {
	ver,		// This values must be equal to version in package.json
	verStr,
	compile: chemCompiler, // Compiler
	findElem,
	macros: Macros.dict,
}

// Roman numerals for the designation of charges
ChemSys.RomanNum = utils.RomanNum

/**
 * Make text
 * @param {ChemObj} formula	Compiled expression
 * @param {Object=} rules	Default rules = ChemSys.rulesHtml
 * @returns {string} text
 */
ChemSys.makeHtml = (formula, rules) => {
	let visitor = new TextMaker(rules)
	formula.walk(visitor)
	return visitor.res()
}

/**
 * Detect empty node
 * @param {ChemNode} node
 * @returns {boolean}
 */
ChemSys.isEmptyNode = ChemNode.isEmptyNode

// Является ли указанный объект абстрактным
ChemSys.isAbstract = obj => {
	let visitor = new IsAbstract()
	obj.walk(visitor)
	return visitor.ok
}

// Высчитать общую массу указанной формулы или реагента
ChemSys.calcMass = obj => {
	let visitor = new MassCalc()
	obj.walk(visitor)
	return visitor.getSum()
}

ChemSys.calcCharge = obj => {
	let visitor = new ChargeCalc()
	obj.walk(visitor)
	return visitor.result()
}

// Сформировать текстовую брутто-формулу (которую можно откомпилировать в выражение, но если нужно выражение, то лучше сразу использовать makeBrutto)
// Коэффициент агентов не учитывается.
// Не имеет смысла для выражений, которые содержат больше одного агента.
ChemSys.makeBruttoKey = (expr, ignoreCharge = false) => {
	let list, listMaker = new ElemListMaker()
	expr.walk(listMaker)
	list = listMaker.result()
	list.sortByHill()
	if (ignoreCharge) list.charge = 0
	return list.toString()
}

ChemSys.makeBrutto = function (expr) {
	let bruttoKey = ChemSys.makeBruttoKey(expr)
	return ChemSys.compile(bruttoKey)
}

try {
	window.ChemSys = ChemSys
} catch (e) { /* ignore */ }

module.exports = ChemSys