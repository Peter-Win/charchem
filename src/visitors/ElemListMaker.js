/**
 * Created by PeterWin on 07.05.2017.
 */
'use strict'
import ElemList from '../core/ElemList'

////////////////////////////////////////////////////////////
//	визитор для формирования списка элементов из выражения
// Не учитываются коэффициенты агентов.
// Не имеет смысла для выражений, имеющих более одного агента
//	var visitor = new ElemListMaker()

/**
 * Visitor for making elements list from expression
 * Agents coeffisients are ignored!
 * Valid for expression with single agent only!
 * Example:
 *   let expr = ChemSys.compile('H2O'), visitor = new ElemListMaker()
 *   expr.walk(visitor)
 *   let elemList = visitor.result()
 * @constructor
 */
export default function ElemListMaker() {
	let visitor = this,
		stack = [new ElemList()]

	/**
	 * Get calculated elements list
	 * @returns {ElemList}
	 */
	visitor.result = () => stack[0]

	visitor.agentPre = visitor.itemPre = visitor.bracketBegin = visitor.mul = () => {
		stack.unshift(new ElemList())
	}

	const pop = obj => {
		let lst = stack.shift()
		lst.scale(obj.n)
		stack[0].addList(lst)
	}
	visitor.agentPost = visitor.itemPost = visitor.mulEnd = pop

	visitor.bracketEnd = obj => {
		// save charge, what calculated for internal brackets
		// Сохранить заряд, вычисленный для внутренностей скобок
		let svCharge = stack[0].charge
		pop(obj)
		if (obj.charge) {
			// If bracket have specified charge, then ignore calculated charge
			// Если для скобки указан отдельный заряд, то вычисленный нужно игнорировать
			stack[0].charge += obj.charge.val * obj.n - svCharge
		}
	}

	/**
	 * before node handler
	 * @param {ChemNode} node
	 */
	visitor.nodePost = node => {
		stack[0].charge += node.chargeVal()
	}

	/**
	 * Chemical element handler
	 * @param {ChemAtom} chemElement
	 */
	visitor.atom = chemElement => {
		stack[0].addElem(chemElement)
	}
	visitor.custom = obj => {
		stack[0].addCustom(obj.tx)
	}
	visitor.radical = obj => {
		stack[0].addRadical(obj)
	}
}

