/**
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

import { MenTbl } from './core'
import { chemCompiler } from './compiler'
import ChargeCalc from './visitors/ChargeCalc'
import ChemAtom from './core/ChemAtom'
import ElemListMaker from './visitors/ElemListMaker'
import IsAbstract from './visitors/IsAbstract'
import MassCalc from './visitors/MassCalc'
import TextMaker from './visitors/TextMaker'

/**
 * html escape
 * @param {string|*} txt	If not string, always return ''
 * @returns {string}
 */
export function esc(txt) {
	return (typeof txt === 'string') ? txt.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
}


// Extended elements list
const extElems = {
	D: new ChemAtom(1, 'D', 2)	// Deiterium - $M(2)H
}


const ChemSys = new function () {
	this.ver = function () {
		// This values must be equal to version in package.json
		return [1, 1, 2]
	}
	this.verStr = function () {
		return this.ver().join('.')
	}

	/**
	 * Global macros map
	 * @type {Object<string,Macros>}
	 */
	this.macros = {}

	// Roman numerals for the designation of charges
	this.RomanNum = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 }

	// Compiler
	this.compile = chemCompiler

	/**
	 * Search for an element by its symbolic designation
	 * If found, then result ChemAtom, else undefined
	 * @param {string} id
	 * @returns {ChemAtom|undefined}
	 */
	this.findElem = id =>
		MenTbl[id] || extElems[id]

	// Правила для формирования HTML-представления формулы
	this.rulesHtml = {
		AgentK: '<b>*</b>',
		ItemMass: '<sup>*</sup>',
		ItemCnt: '<sub>*</sub>',
		BracketCnt: '<sub>*</sub>',
		ItemCharge: '<sup class="echem-item-charge">*</sup>',
		ColorPre: '<span style="color:*">',
		ColorPost: '</span>',
		NodeCharge: '<sup>*</sup>',
		Custom: '<i>*</i>',
		Radical: '*',
		Comment: '<em>*</em>',
		OpComment: '<span class="echem-opcomment">*</span>',
		Operation: '<span class="echem-op">*</span>',
		// Правило для вывода атомной массы и номера слева от элемента. Имеет два аргумента @=масса, *=номер
		MassAndNum: '<span class="echem-mass-and-num">@<br/>*</span>',
		$InvisibleBond: ' ',	// Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
		Mul: '*',	// Конструкция умножения внутри агента CuSO4_*5_H2O
		MultiK: '*',	// Коэффициент 5 в конструкции CuSO4*5H2O
		$MulChar: '∙'	// Символ умножения. Варианты: x * × ∙
	}
	// Правила для формирования BB-кода представления формулы (для вставки в форумы)
	this.rulesBB = {
		AgentK: '[b]*[/b]',
		ItemMass: '[sup]*[/sup]',
		ItemCnt: '[sub]*[/sub]',
		BracketCnt: '[sub]*[/sub]',
		ItemCharge: '[sup]*[/sup]',
		ColorPre: '[color=*]',
		ColorPost: '[/color]',
		NodeCharge: '[sup]*[/sup]',
		Custom: '[i]*[/i]',
		Radical: '*',
		Comment: '[i]*[/i]',
		// Правило для вывода атомной массы и номера слева от элемента. Имеет два аргумента @=масса, *=номер
		MassAndNum: '[sup]@[/sup][sub]*[/sub]',
		$InvisibleBond: ' ',	// Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
		$MulChar: '∙'	// Символ умножения. Варианты: x * × ∙
	}

	// Правила для текстового представления формул
	this.rulesText = {
		AgentK: '*',
		ItemCnt: '*',
		ItemCharge: '*',
		NodeCharge: '*',
		Custom: '*',
		ColorPre: '',
		ColorPost: ''
	}

	/**
	 * Make text
	 * @param {ChemObj} formula
	 * @param {Object=} rules	Default rules = ChemSys.rulesHtml
	 * @returns {string}
	 */
	this.makeHtml = (formula, rules) => {
		let visitor = new TextMaker(rules)
		formula.walk(visitor)
		return visitor.res()
	}

	/**
	 * Detect empty node
	 * @param {ChemNode} node
	 * @returns {boolean}
	 */
	this.isEmptyNode = node => {
		let bNonEmpty = 0
		function onComment(obj) {
			if (obj.tx !== '')
				return bNonEmpty = 1
		}
		function nonEmpty() {
			return bNonEmpty = 1
		}
		node.walk({
			atom: nonEmpty,
			radical: nonEmpty,
			custom: onComment,
			comm: onComment
		})
		return !bNonEmpty
	} // isEmptyNode

	// Является ли указанный объект абстрактным
	this.isAbstract = obj => {
		let visitor = new IsAbstract()
		obj.walk(visitor)
		return visitor.ok
	}

	// Высчитать общую массу указанной формулы или реагента
	this.calcMass = obj => {
		let visitor = new MassCalc()
		obj.walk(visitor)
		return visitor.getSum()
	}

	this.calcCharge = obj => {
		let visitor = new ChargeCalc()
		obj.walk(visitor)
		return visitor.result()
	}

	// Сформировать текстовую брутто-формулу (которую можно откомпилировать в выражение, но если нужно выражение, то лучше сразу использовать makeBrutto)
	// Коэффициент агентов не учитывается.
	// Не имеет смысла для выражений, которые содержат больше одного агента.
	this.makeBruttoKey = (expr, ignoreCharge = false) => {
		let list, listMaker = new ElemListMaker()
		expr.walk(listMaker)
		list = listMaker.result()
		list.sortByHill()
		if (ignoreCharge) list.charge = 0
		return list.toString()
	}

	this.makeBrutto = function (expr) {
		let bruttoKey = ChemSys.makeBruttoKey(expr)
		return ChemSys.compile(bruttoKey)
	}

}

try {
	window.ChemSys = ChemSys
} catch (e) { /* ignore */ }


export default ChemSys
