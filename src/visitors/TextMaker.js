/**
 * Created by PeterWin on 06.05.2017.
 */

import ChemSys from '../ChemSys'

export default function TextMaker(rules) {
	rules = rules || ChemSys.rulesHtml
	if (rules === 'text')
		rules = ChemSys.rulesText
	else if (rules === 'BB' || rules === 'bb')
		rules = ChemSys.rulesBB

	let me = this,
		stack = [{ tx:'' }],
		nextNodeNeg = 0,
		atomColor = 0,
		bFirst = 1

	me.res = () =>
		stack[0].tx

	function useRule(key, value) {
		if (!(key in rules))
			return value
		return rules[key].replace(/\*/g, value)
	}
	function ctxOut(s) {
		stack[0].tx += s
	}
	function space() {
		if (bFirst) bFirst = 0
		else ctxOut(' ')
	}

	function ctxOutRule(rule, text) {
		ctxOut(useRule(rule, text))
	}
	function setNeg() {
		stack[0].neg = 1
	}
	function pushCell() {
		stack.unshift({ tx:'' })
	}
	function popCell() {
		let cell = stack.shift()
		if (cell.neg) {
			stack[0].tx = cell.tx + stack[0].tx
		} else {
			stack[0].tx += cell.tx
		}
	}

	me.atom = function (obj) {
		if (atomColor)
			ctxOutRule('ColorPre', atomColor)
		ctxOut(useRule('Atom', obj.id) )
		if (atomColor)
			ctxOutRule('ColorPost', atomColor)
	}
	me.custom = function (obj) {
		ctxOutRule('Custom', obj.tx)
	}
	me.comm = function (obj) {
		ctxOutRule('Comment', obj.tx)
	}
	me.radical = function (obj) {
		ctxOutRule('Radical', obj.label)
	}

	me.itemPre = function (obj) {
		if (obj.color)
			ctxOutRule('ColorPre', obj.color)
		if (obj.atomNum) {
			// Вывести двухэтажную конструкцию: масса/атомный номер слева от элемента
			let s = useRule('MassAndNum', obj.obj.n || '').replace('@', obj.M || '')
			ctxOut(s)
		} else if (obj.M) {
			ctxOutRule('ItemMass', obj.M)
		}
		atomColor = obj.atomColor
	}
	me.itemPost = function (obj) {
		if (obj.charge) {
			ctxOutRule('ItemCharge', obj.charge.tx)
		}
		atomColor = 0
		if (obj.n !== 1) {
			ctxOutRule('ItemCnt', obj.n)
		}
		if (obj.color)
			ctxOutRule('ColorPost', obj.color)
	}
	me.bond = function (obj) {
		pushCell()
		if (obj.color)
			ctxOutRule('ColorPre', obj.color)
		let text = obj.tx
		if (!obj.N) text = rules.$InvisibleBond || ' '	// Empty bond
		ctxOut(text)
		if (obj.pt.x < 0) {
			setNeg()
			nextNodeNeg = 1
		}
		if (obj.color)
			ctxOutRule('ColorPost', obj.color)
		popCell()
	}

	function drawCharge(obj, bLeft) {
		let charge = obj.charge
		if (charge) {
			if (!(bLeft ^ charge.bLeft)) {
				ctxOutRule('NodeCharge', charge.tx)
			}
		}
	}

	me.bracketBegin = function (obj) {
		drawCharge(obj.end, 1)
		ctxOut(obj.tx)
	}
	me.bracketEnd = function (obj) {
		ctxOut(obj.tx)
		if (obj.n !== 1) {
			ctxOutRule('ItemCnt', obj.n)
		}
		drawCharge(obj)
	}
	me.mul = function (obj) {
		ctxOutRule('Mul', rules.$MulChar || '*')
		if (obj.n !== 1)
			ctxOutRule('MultiK', obj.n)
	}

	me.nodePre = function (obj) {
		drawCharge(obj, 1)
		pushCell()
	}
	me.nodePost = function (obj) {
		if (nextNodeNeg) {
			setNeg()
			nextNodeNeg = 0
		}
		popCell()
		drawCharge(obj)
	}
	me.agentPre = function (obj) {
		space()
		if (obj.n !== 1)
			ctxOutRule('AgentK', obj.n)
	}

	me.operation = function (obj) {
		space()
		let comm = obj.commentPre,
			tmp = ''
		if (comm)
			tmp = useRule('OpComment', comm.tx)
		tmp += obj.dstText
		comm = obj.commentPost
		if (comm)
			tmp += useRule('OpComment', comm.tx)
		ctxOutRule('Operation', tmp)
	}
	me.entityPre = function () {
		pushCell()
	}
	me.entityPost = function () {
		popCell()
	}
}
