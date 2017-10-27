/* eslint-disable no-console */
/*
 * Demonstration of text mode functions
 * Created 2017-10-14 by PeterWin
 */
const ChemSys = require('../src/ChemSys')
// const {chemCompiler} = require('../src/compiler')
const MassCalc = require('../src/visitors/MassCalc')
const IsNonText = require('../src/visitors/IsNonText')
const TextMaker = require('../src/visitors/TextMaker')
const {rulesText} = require('../src/utils/rules')

const expr = ChemSys.compile('{R}OH')
if (expr.isOk()) {
	const isText = !expr.walk(new IsNonText())
	console.log('Is text mode: ', isText)

	// text
	const textMaker = new TextMaker(rulesText)
	expr.walk(textMaker)
	const text = textMaker.res()
	console.log('Text: ', text)

	// Mass
	const massCalc = new MassCalc()
	expr.walk(massCalc)
	const mass = massCalc.getSum()
	console.log('Mass: ', mass)
} else {
	console.log('Error: ', expr.getMessage())
}