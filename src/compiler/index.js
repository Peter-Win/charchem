/**
 * The module for compiling the source code of an expression.
 * The result is always ChemExpr, which can contain a description of the error
 * Created by PeterWin on 28.04.2017.
 */
'use strict'

import ChainSys from './chainSys'
import ChemAgent from '../core/ChemAgent'
import ChemBond from '../core/ChemBond'
import { ChemBrBegin, ChemBrEnd } from '../core/ChemBr'
import ChemComment from '../core/ChemComment'
import ChemCharge from '../core/ChemCharge'
import ChemCustom from '../core/ChemCustom'
import ChemError from '../core/ChemError'
import ChemExpr from '../core/ChemExpr'
import ChemMul, { ChemMulEnd } from '../core/ChemMul'
import ChemNode from '../core/ChemNode'
import ChemNodeItem from '../core/ChemNodeItem'
import ChemRadical from '../core/ChemRadical'
import ChemSys from '../ChemSys'
import ChemOp from '../core/ChemOp'
import Lang from '../Lang'
import Point from '../math/Point'
import { preProcess } from '../compiler/preprocess'
import { MenTbl } from '../core'
import IsNonText from '../visitors/IsNonText'
import { dashes, dots } from './utils'

function _notImpl(fnName) {
	throw new ChemError('Function is not implemented: ' + fnName)
}

// Replacement of special characters in the comments
const SpecChars = [
	[/\|\^|ArrowUp/g, '↑'],
	[/(\|v)|(ArrowDown)/g, '↓'],
	[/\^o/g, '°']
]

const SpecCharsB = {
	alpha: 'α', Alpha: 'Α',
	beta: 'β', Beta: 'Β',
	gamma: 'γ', Gamma: 'Γ',
	delta: 'δ', Delta: 'Δ',
	epsilon: 'ε', Epsilon: 'Ε',
	zeta: 'ζ', Zeta: 'Ζ',
	eta: 'η', Eta: 'Η',
	theta: 'θ', Theta: 'Θ',
	iota: 'ι', Iota: 'Ι',
	kappa: 'κ', Kappa: 'Κ',
	lambda: 'λ', Lambda: 'Λ',
	mu: 'μ', Mu: 'Μ',
	nu: 'ν', Nu: 'Ν',
	xi: 'ξ', Xi: 'Ξ',
	omicron: 'ο', Omicron: 'Ο',
	pi: 'π', Pi: 'Π',
	rho: 'ρ', Rho: 'Ρ',
	sigma: 'σ', Sigma: 'Σ',
	tau: 'τ', Tau: 'Τ',
	upsilon: 'υ', Upsilon: 'Υ',
	phi: 'φ', Phi: 'Φ',
	chi: 'χ', Chi: 'Χ',
	psi: 'ψ', Psi: 'Ψ',
	omega: 'ω', Omega: 'Ω'
}

const Ops = [
	{ op: '+' },
	{ op: '-->', eq:1, dst:'—→' },
	{ op: '->', eq:1, dst:'→' },
	{ op: '®', eq:1, dst:'→' },
	{ op: '→', eq:1 },
	{ op: '=', eq:1 },
	{ op: '↔', eq:1 },
	{ op: '<->', eq:1, dst:'↔' },
	{ op: '<=>', eq:1, dst:'\u21CC' },
	{ op: '<==>', eq:1, dst:'\u21CC' },
	{ op: '*', dst:'∙' },
	{ op: '!=', dst:'≠' }
]

// Bonds description synonims
const BondsSyn = {
	'≡': '%',
	'–': '-'
}

// 0=(Multiplicity), 1=(Angle in degrees), 2=(sign of slope), 3=(soft bond flag), 4=(text)
const BondDefs = {
	'-': [1, 0, 0, 1],
	'=': [2, 0, 0, 1],
	'%': [3, 0, 0, 1, '≡'],
	'--': [1, 0, 0, 0, '-'],
	'==': [2, 0, 0, 0, '='],
	'%%': [3, 0, 0, 0, '≡'],
	'|':  [1, 90, 0],
	'||': [2, 90, 0],
	'|||': [3, 90, 0],
	'/': [1, 0, -1],
	'///': [3, 0, -1],
	'//': [2, 0, -1],
	'\\': [1, 0, 1],
	'\\\\': [2, 0, 1],
	'\\\\\\': [3, 0, 1]
}

const NumConst = {
	'$32': Math.sqrt(3) / 2,
	'$3': Math.sqrt(3),
	'$3x2': Math.sqrt(3) * 2,
	'$2': Math.sqrt(2),
	'$22': Math.sqrt(2) / 2,
	'$2x2': Math.sqrt(2) * 2,
	'½':0.5, '¼':1 / 4, '¾': 3 / 4, '⅓':1 / 3, '⅔':2 / 3
}

let BondDefMap = {}	// Map 'first char'=>1 for parseNode optimization


//==========================================
//		compiler first initialization
!function () {
	// 180 -- π, grad -- rad,  rad=grad*π/180 = grad*k,  k=π/180
	let i, k = Math.PI / 180
	// convert degreese to radians
	for (i in BondDefs)
		BondDefs[i][1] *= k

	// Подключить синонимы связей
	for (i in BondsSyn)
		BondDefs[i] = BondDefs[BondsSyn[i]]

	// Заполнить BondDefMap
	for (i in BondDefs)
		BondDefMap[i.charAt(0)] = 1
}()

const isSpace = ch => ch === ' ' || ch === '\t' || ch === '\n'
const isDigit = ch => ch >= '0' && ch <= '9'
const isSmallAlpha = ch => ch >= 'a' && ch <= 'z'

/**
 * Don't use this function directly. True way: ChemSys.compile
 * @param {string} text
 * @returns {ChemExpr}
 */
export function chemCompiler(text) {

	let
		result = new ChemExpr(),
		textLen,
		pos = 0,	// current position in text
		c,	// current character
		curState = 'begin',

		commentPre = 0,	// The line of the preliminary comment
		commentPrePos = 0,
		curEntity,	// Current entity (item of chemical expression)
		curPart = 0,	// Index of expression part. Parts are separated by operations with a eq, for ex. = or ->
		koeffPre,		// Prefix coefficient
		koeffPrePos,	// position of prefix coefficient
		itemPos0,	// Position of node begin. Позиция начала элемента узла

		chainSys,	// Chain system for agent
		curNode,	// current node
		chargeOwner,	// Target object for ^ operation. Объект, к которому применится конструкция ^
		curNodeEnd,	// Position of current node end. Позиция конца текущего узла
		curBond,	// current bond
		prevBond,	// previous bond (for auto-correction)
		branchStack,	// branch stack
		bracketEnds = [],
		middlePoints = [],	// Middle points list for curved bonds. Список промежуточных точек для изогнутых связей
		nodesBranch = [],	// Список линейно связанных узлов (свой для каждой ветки). Заполняется через push
		postNodeInits = [],	//  void(ChemNode) functions для пост-инициализации узлов

		nodesMap,	// named nodes for  #Name access
		bNegChar = 0,	// Признак изменения поведения следующей конструкции (обратный апостроф)
		curWidth = 0,	// Текущая толщина, нстраиваемая W+,W2,W-,D+,D-,D2

		userSlope = 0,	// Наклон кратких описаний связей, заданный функцией $slope
		defaultSlope = Math.PI / 6,	// 30° - стандартный наклон кратких описаний связей
		degToRad = Math.PI / 180,

		st_agentMid = 'agentMid',
		_findElem = ChemSys.findElem


	const nextChar = () => text[pos + 1]

	const error = (msgId, par) => {
		if ('pos' in par) {
			par.pos++
		}
		throw new ChemError(msgId, par)
	}

	const checkMiddlePoints = () => {
		if (middlePoints.length) {
			error('Invalid middle point', middlePoints[0])
		}
	}

	/**
	 * Add command to current agent
	 * @param {ChemNode|ChemBond|ChemMulEnd} cmd
	 */
	const addCmd = cmd => curEntity.cmds.push(cmd)

	// Check the presence of a multiplier (construction: *5H2O)
	function checkMul() {
		let mulRec = branchStack[0]
		if (mulRec && mulRec.m) {
			branchStack.shift()
			let begin = mulRec.m,
				end = new ChemMulEnd(begin)
			begin.end = end
			addCmd(end)
		}
	}

	//==================== States control
	/**
	 * set state
	 * @param {string} st
	 * @param {number=0} res
	 * @returns {number}
	 */
	const setState = (st, res = 0) => {
		curState = st
		return res
	}

	const _substr = pos0 => text.slice(pos0, pos)

	const skipSpace = () => {
		while (pos < textLen && isSpace(c = text[pos])) pos++
	}

	/**
	 * Retrieves a comment
	 * Initially, pos must be set to the first character inside the quotes.
	 * At the end it is set to the final quotation mark
	 * @returns {string}
	 */
	function scanComment() {
		let p0 = pos
		while (pos < textLen && text[pos] !== '"') pos++
		if (pos === textLen)
			error('Comment is not closed', { pos:p0 - 1 })
		return _substr(p0)
	}

	// Извлечь список аргументов и их позиций, начиная с текущей позиции
	function scanArgs(args, argPos) {
		let p0 = pos, prev = pos, ch, level = 0
		function addArg() {
			argPos.push(prev)
			args.push(_substr(prev))
			prev = pos + 1
		}
		for (; pos < textLen; pos++) {
			ch = text[pos]
			if (ch === '(') {
				level++
			} else if (ch === ')') {
				if (level-- === 0) break
			} else if (ch === ',' && level === 0) {
				addArg()
			}
		}
		if (pos >= textLen)
			error('It is necessary to close the bracket', { pos:p0 - 1 })
		addArg()
		++pos
	}


	// Попытка извлечь коэффициент
	// Если коэффициент распознан, возвращается число или строка(для абстрактного коэфф), pos указыв на следующий символ
	// В случае неудачи возвращает null
	function scanKoeff() {
		let pos0 = pos,
			ch = text[pos],
			res = null, s = '', r
		if (isDigit(ch)) {
			// Число...
			while (pos < textLen) {
				s += text[pos]
				r = +s		// Недостаточно проверки isNaN, т.к. "10 " тоже успешно превращается в 10. Поэтому используем регэксп
				if (isNaN(r) || !/^[\d\.]+$/.test(s)) break
				res = r
				pos++
			}
		} else if (ch === "'") {
			// Абстрактный коэфф.
			pos++
			while (pos < textLen && text[pos] !== "'") pos++
			if (pos === textLen)
				error('Abstract koefficient is not closed', { pos:pos0 })
			res = _substr(pos0 + 1)
			pos++
		}
		if (res !== null) {	// Предварительный комментарий не может следовать до коэффициента
			commentPre = 0
		}
		return res
	}

	// Извлечение заряда из текущей позиции.
	// Возвращает объект ChemCharge или 0
	function scanCharge() {
		let chargeText = '', chargePrev = 0, charge
		while (pos < textLen) {
			chargeText += text[pos]
			charge = ChemCharge.create(chargeText)
			if (!charge) break
			pos++
			chargePrev = charge
		}
		return chargePrev
	}

	// Попытка извлечь из текущей позиции степень окисления
	function scanOxidation() {
		let i = pos, charge = 0
		if (text[i] === '(') {
			while (i < textLen && text[i] !== ')') i++
			if (text[i] !== ')')
				error('It is necessary to close the bracket', { pos:pos })
			charge = ChemCharge.create(text.slice(pos + 1, i))
			if (charge) {
				pos = i + 1
			}
		}
		return charge
	}

	////////////////////////////////////////////////////
	//		Comments

	/**
	 *
	 * @param {string} text
	 * @returns {string}
	 */
	function cvtComm(text) {
		let i, p, res = text, kb, ke, s, a
		for (p of SpecChars) {
			res = res.replace(p[0], p[1])
		}
		// Замена греческих букв в квадр. скобках
		i = 0
		while (i < res.length) {
			kb = res.indexOf('[', i)
			if (kb < 0) break
			ke = res.indexOf(']', kb)
			if (ke < 0) break
			s = res.slice(kb + 1, ke)
			a = SpecCharsB[s]
			if (a) {
				// греческая буква найдена. Выполняем замену
				res = res.substr(0, kb) + a + res.substr(ke + 1)
			} else {
				// греческая буква не найдена. Оставляем скобки в тексте
				i = kb + 1
			}
		}
		return translate(res)
	}

	/**
	 *
	 * @param {string} res
	 * @returns {string}
	 */
	function translate(res) {
		// Поиск переводимых фраз
		let t, s, k, i = res.indexOf('`')
		while (i >= 0) {
			k = res.indexOf('`', i + 1)
			if (k < 0) break
			s = res.slice(i + 1, k)
			t = Lang.tr(s)
			if (t === s) {
				// перевод не получился
				res = res.slice(0, i) + res.slice(i + 1)
			} else {
				// заменить перевод
				res = res.slice(0, i) + t + res.slice(k + 1)
			}
			i = res.indexOf('`')
		}
		res = res.replace('`', '')
		return res
	}

	const makeComment = comm0 =>
		new ChemComment(cvtComm(comm0))

	let constMap = {}
	function toNum(x, xpos) {
		if (!x) return 0
		let k = 1
		if (x[0] === '-') {
			k = -1; x = x.slice(1)
		}
		if (x[0] === '%') {
			// Использование или определение константы
			let val, j = x.indexOf(':'), name
			if (j >= 0) {
				// Определение
				name = x.slice(1, j)
				val = x.slice(j + 1)
				constMap[name] = val
			} else {
				name = x.slice(1)
				val = constMap[name]
				if (!val) error('Undefined variable [name]', { name:name, pos:xpos + 1 })
			}
			x = val
		}
		if (x in NumConst)
			return k * NumConst[x]
		return +x * k
	}

	// Система функций, обозначаемых через $
	let specMass = 0, bAtomNum = 0, curColor = null, curItemColor = null, curItemColor1 = 0,
		curAtomColor = null, curAtomColor1 = 0, stdLen = 1,
		nextDots = 0, // результат dots для следующего узла
		nextDashes = 0,
		dblAlignMode = 0, // режим выравнивания двойных связей
		funcs = {
			atomColor: function (args) {
				curAtomColor = args[0]
			},
			atomColor1: function (args) {
				curAtomColor1 = args[0]
			},
			color: function (args) {
				curColor = args[0]
			},
			dashes: function (args, argsPos) {
				nextDashes = dashes(args, argsPos, toNum)
			},
			// режим выравнивания двойных связей
			dblAlign: function (args) {
				dblAlignMode = args[0]
			},
			// Точки
			dots: function (args, argsPos) {
				nextDots = dots(args, argsPos, toNum)
			}, // dots
			itemColor: function (args) {
				curItemColor = args[0]
			},
			itemColor1: function (args) {
				curItemColor1 = args[0]
			},
			// Коэффициент длины связи по умолчанию (для формулы)
			L: function (arg, argPos) {
				stdLen = toNum(arg[0], argPos[0]) || 1
			},
			// Масса следующего элемента. Применимо не только к атомам, но кастомным элементам и даже группам
			M: function (args) {
				specMass = +args[0]
			},
			// Масса следующего элемента плюс атомный номер   238 #  #
			// Например $nM(238)U                                 #  #
			//                                                 92  ##
			nM: function (args) {
				funcs.M(args)
				bAtomNum = 1
			},
			slope: function (args) {
				// degree - radian | 180 - pi => radian = degree*pi/180
				userSlope = args[0] * degToRad
			},
			ver: function (args) {
				let formulaVer = args[0].split('.'), sysVer = ChemSys.ver()
				if (formulaVer.length > 1) {
					// formulaVer[0] is string value and sysVer[0] is number => don't use strict  formulaVer[0] === sysVer[0]
					// eslint-disable-next-line eqeqeq
					if (formulaVer[0] > sysVer[0] || (formulaVer[0] == sysVer[0] && formulaVer[1] > sysVer[1]))
						error('Invalid version', { cur:ChemSys.verStr(), need:formulaVer.join('.') })
				}
			}
		}


	//-----------------------------------------------
	//	Сущности хим выражения
	function createEntity(entity) {
		result.ents.push(curEntity = entity)
	}

	//-----------------------------------------------
	//	Операции в хим.выражении

	function checkOp() {
		var c1, opDef, pos1, comm, j = Ops.length - 1
		while (j >= 0 && text.indexOf(Ops[j].op, pos) !== pos) j--
		if (j < 0) return null
		// После операции нужен пробельный символ
		opDef = Ops[j]
		pos1 = pos + opDef.op.length
		c1 = text.charAt(pos1)
		if (!isSpace(c1) && c1 !== '"') return null

		createEntity(new ChemOp(opDef.op, opDef.dst || opDef.op, opDef.eq))
		curEntity.setPos(pos, pos1)
		if (commentPre) {
			comm = curEntity.commentPre = makeComment(commentPre)
			curEntity.pA = comm.pA = commentPrePos - 1
			comm.pB = pos
			commentPre = 0
		}
		if (opDef.eq) curPart++ // переходим к следующей части уравнения
		pos = pos1
		if (text[pos] === '"') {
			// Начать читать комментарий
			pos++
			comm = curEntity.commentPost = makeComment( scanComment() )
			comm.pA = pos1
			curEntity.pB = comm.pB = ++pos
		}
		// начать считывание следующей сущности
		return setState('begin')
	}

	//-----------------------------------------
	//		Агент
	// Подготовка данных для распознавания агента
	function openAgent() {
		chainSys = new ChainSys()
		chargeOwner = curNode = 0
		curBond = prevBond = 0
		branchStack = []
		nodesBranch = []
		curEntity.part = curPart
		nextDots = nextDashes = 0
		nodesMap = {} // именованные узлы для доступа через #Name
		let p0 = pos
		curWidth = 0

		// Присоединить ранее полученные коэффициент или коммент
		if (koeffPre) {
			curEntity.n = koeffPre
			p0 = koeffPrePos
		} else if (typeof commentPre === 'string') {
			//_notImpl('openAgent.coeffPre')
			p0 = commentPrePos
			addNodeItem(makeComment(commentPre))
		}
		curEntity.pA = p0
	}

	// Обработка незакрытой конструкции
	function branchError(obj) {
		if (obj.o) {
			// Незакрытая скобка
			error('It is necessary to close the bracket', { pos:obj.pos })
		} else {
			// Незакрытая ветка
			error('It is necessary to close the branch', { pos:obj.pos })
		}
	}

	function closeAgent() {

		let branchCmd = null
		// Если в стеке есть мультипликатор, вытеснить его...
		while (branchStack.length && branchStack[0].m)
			branchCmd = branchStack.shift()
		// Если в стеке что-то есть, значит не закрыта открытая ранее конструкция
		if (branchStack.length) {
			branchError(branchStack[0])
		}

		closeNode()
		closeBond()
		checkMiddlePoints()
		//checkMul()	TODO: Если вызывать здесь, то не заполняется команда ChemMulEnd
		if (branchCmd) {
			addCmd(new ChemMulEnd(branchCmd.m))
		}
		curEntity.pB = pos

		let i, bond, bonds = curEntity.bonds,
			cmds = curEntity.cmds, cmdIndex = 0,
			j, node, nodes, n, item,
			lmap = {}, key

		// Сращивание дублирующих связей
		i = 0
		while (i < bonds.length) {
			bond = bonds[i++]
			nodes = bond.nodes
			if (nodes.length === 2 && !bond.midPt) {	// Только для связей между двумя узлами И без промежуточных точек
				j = nodes[0].index
				n = nodes[1].index
				key = Math.min(j, n) + ':' + Math.max(j, n) // ключ образуется индексами узлов от меньшего к большему
				item = lmap[key]
				if (item) { // Это не сравнение! а присваивание и отновременная проверка
					// Зафиксировано наложение
					// Добавляется количество связей, все остальные настройки игнорируются
					item.N += bond.N
					bonds.splice(--i, 1)	// связь удаляется из списка
					// Удалить связь из списка команд агента
					// Используется тот факт, что команды идут в том же порядке, что и связи
					// Поэтому не нужно искать сначала списка
					while (cmds[cmdIndex] !== bond) cmdIndex++
					cmds.splice(cmdIndex, 1)
				} else {
					lmap[key] = bond
				}
			}
		}

		// Необходимо заполнить список связей для каждого узла
		for (i in bonds) { // цикл по связям
			bond = bonds[i]
			nodes = bond.nodes
			for (j in nodes) { // цикл по узлам связи
				node = nodes[j]
				node.bonds.push(bond)
			}
		}
		// Необходимо заполнить автоузлы
		nodes = curEntity.nodes
		for (i in nodes) {
			node = nodes[i]
			if (node.bAuto) {
				// Автоматический узел всегда содержит углерод
				node.items[0] = new ChemNodeItem(MenTbl.C)
				bonds = node.bonds
				n = 0	// сума кратностей связей, входящих в узел
				for (j in bonds) {
					n += bonds[j].N
				}
				if (n < 4) {
					// Добавить нужное число атомов водорода
					item = new ChemNodeItem(MenTbl.H)
					item.n = 4 - n
					node.items[1] = item
				}
			}
		}
	}
	// Распознать начало очередного узла в описании реагента. Если нет, вернуть -1
	function parseNode() {
		if (curNode && !curNode.pB)
			curNode.pB = pos
		itemPos0 = pos
		// Элемент
		if (c >= 'A' && c <= 'Z') {
			// Извлечь первый заглавный символ элемента. Следующие должны быть маленькими
			return  setState('agentElem', 1)
		}

		// Краткое описание связи
		if (BondDefMap[c]) {
			createBondShort()
			return setState(st_agentMid)
		}

		switch (c) {
		case '`':
				// Признак изменения поведения следующей конструкции
			return bNegChar = 1
		case '$': // Функция
			return setState('funcName', 1)
		case '{':	// начало абстрактного элемента
			return setState('custom', 1)
		case '^':	// заряд узла
			return setState('nCharge', 1)
		case '#':
			return setState('nodeRef', 1)
		case ';': // Конец цепочки
			closeBond()
			closeNode()
			prevBond = 0
			chainSys.closeChain()
				//newChain();
			return setState('agentSpace', 1) // Возможно добавление пробелов
		case ':':	// Объявление метки
			pos++
			while (pos < textLen && /[\dA-Z]/i.test(text[pos])) pos++
			checkCurNode()
			nodesMap[_substr(itemPos0 + 1)] = curNode
			return setState(st_agentMid)
		case '<':
			openBranch()
			return setState(st_agentMid, 1)
		case '>':
			closeBranch()
			return setState(st_agentMid, 1)
		case '(':
				// Вариант (*
			if (nextChar() === '*') {
				openBranch()
				return setState(st_agentMid, 2)
			}
			break
		case '"':	// Комментарий, который становится частью узла
			pos++
			{
				let item = new makeComment(scanComment())
				pos++
				addNodeItem(item)
			}
			return setState(st_agentMid)
		case '*':
				// Вариант *)
			if (nextChar() === ')') {
				closeBranch()
				return setState(st_agentMid, 2)
			}
			return setState('mul', 1)
		case '_':
			return setState('uniBond', 1)
		case 'c':
			checkCurNode()
			return setState(st_agentMid, 1)
		}
		// Скобки...
		if (ChemBrBegin.Map[c]) {	// Открытая скобка
			// TODO: Не воспринимается скобка из нескольких символов
			// TODO: Если переставить перед switch, то перестаёт работать (* *)
			openBracket()
			return setState(st_agentMid, 1)
		}
		if (ChemBrEnd.Lst.indexOf(c) >= 0) {
			closeBracket()
			return setState(st_agentMid)
		}
		// Специальный контроль символов нелатинских алфавитов
		if (/[А-ЯЁ]/i.test(c))
			error('Russian element character', { pos:pos, C:c })
		if (c > '\x7F') {
			error('Non-latin element character', { pos:pos, C:c })
		}
		return -1
	}

	////////////////////////////////////////////////
	//		Узлы
	function closeNode() {
		if (curNode) {
			if (!curNode.pB) curNode.pB = curNodeEnd
			closeNodeItem()
			chargeOwner = curNode = 0
		}
	}
	function createNode(bAuto, pt) {
		closeNode()
		checkMiddlePoints()
		let node = new ChemNode(pt)
		node.bAuto = bAuto
		chargeOwner = curNode = node
		curNodeEnd = curNode.pA = itemPos0
		node.index = curEntity.nodes.length
		curEntity.nodes.push(node)
		addCmd(node)
		chainSys.addNode(node)
		nodesBranch.push(node) // созданный узел присоединяется к текущей "ветке"

		// Контроль открытой скобки
		// Есть проблема с вложенными скобками, если между ними нет разделителя. Н.р: A[(B - [.nodes=[A,0], (.nodes=[A,B]
		let i, br
		for (i in branchStack) {
			br = branchStack[i].o
			if (br && !br.nodes[1]) {
				br.nodes[1] = curNode
			}
		}
		for (i in postNodeInits)
			postNodeInits[i](node)

		// Контроль закрытой скобки
		brEndsCtrl(node)
		return node
	}

	function isEmptyNode(node) {
		return node.bAuto || ChemSys.isEmptyNode(node)
	}

	function smartCreateNode(bAuto) {
		// определить координаты нового узла
		var pt = 0, node
		if (curBond) {
			// Возможно, здесь нужно организовать мягкую связь
			// Для этого связь должна иметь признак soft и оба узла не автоматические
			if (curBond.soft && !bAuto && !isEmptyNode(curBond.nodes[0])) {
				chainSys.closeSC(0)
			} else {
				pt = curBond.calcPt()
				curBond.soft = 0
			}
		}
		pt = pt || new Point()
		node = chainSys.findByPt(pt)
		if (node) {
			curNode = node
			nodesBranch.push(node)
		} else {
			// Если узла нет, значит создать новый
			node = createNode(bAuto, pt)
		}
		setBondEnd()
		return curNode
	}
	function checkCurNode() {
		if (!curNode)
			smartCreateNode(1)
	}

	// Обработать ссылку на указанный узел H-#C-H  или #O
	function linkNode(node) {
		checkBranch()
		node.fixed = 1
		// Здесь есть две ситуации: сращивание цепей или продолжение цепи
		// Зависит от наличия curBond
		var node0 = curBond ? curBond.nodes[0] : 0
		// Нельзя сращивать, если цепь одна, но подцепи разные (То есть, зацикленная молекула, в центре которой есть мягкие связи)
		if (node0 && !curBond.soft && !(node0.ch === node.ch && node0.sc !== node.sc)) {
			// сращивание цепей
			chainSys.merge(node0, node, curBond)
		} else {
			// Просто назначить текущую цепь
			chainSys.setCur(node)
		}
		curNode = node
		nodesBranch.push(node)
		setBondEnd()
	}

	//------------------------ Ветки
	function checkBranch() {
		// TODO:
	}
	function openBranch() {
		closeBond()
		branchStack.unshift({ n:curNode, b:curBond, pb:prevBond, pos:itemPos0, nb:nodesBranch })
		nodesBranch = []	// начать новую ветку
	}
	function closeBranch() {
		closeBond()
		checkMul()
		var x = branchStack.shift()
		if (!x) {
			// Ошибка: Нет открытой скобки
			error('Invalid branch close', { pos:pos })
		}
		if (x.o) {
			// Ошибка: ветка закрывается до того, как закрыта скобка...
			error('Cant close branch before bracket', { pos:pos, pos0:x.pos + 1 })
		}
		curNode = x.n
		curBond = x.b
		prevBond = x.pb
		nodesBranch = x.nb
		chainSys.setCur(curNode)	// вернуть текущую цепь/подцепь (внутри ветки можно создать новую подцепь)
	}
	//------------- ЛОКАЛЬНЫЕ СКОБКИ
	function openBracket() {
		chargeOwner = 0
		var obj = new ChemBrBegin(c)
		obj.setPos(pos, pos + 1)
		var node0 = curNode
		if (!node0 && branchStack.length) {
			// Для случая [(
			if (branchStack[0].o) { // Если есть предыдущая скобка
				node0 = branchStack[0].o.nodes[0]
			}
		}
		obj.nodes[0] = node0
		obj.bond = curBond
		obj.color = curColor
		addCmd(obj)
		branchStack.unshift({ o:obj, pos:pos })
		// Пока нет связи...
		closeNode()
		if (!curBond || curBond.soft)
			chainSys.closeSC()	// Если нет соединяющей связи, нужно прекратить цепь
	}

	function closeBracket() {
		checkMul()
		let br0 = branchStack.shift()
		if (!br0)
			error('Invalid bracket close', { pos:pos })
		let open = br0.o
		if (!open)
			error('Cant close bracket before branch', { pos:pos, pos0:br0.pos + 1 })
		let needCloseChar = ChemBrBegin.Map[open.tx]
		if (needCloseChar !== c)
			error('Expected [must] instead of [have]', { must:needCloseChar, have:c, pos:pos, pos0:br0.pos + 1 })

		let obj = new ChemBrEnd(c, open)
		open.end = obj
		obj.pA = pos
		function setNode0(node) {
			obj.nodes[0] = node
		}
		checkCurNode(0) // возможны негативные последствия
		if (curNode) {
			setNode0(curNode)
		} else {
			// Автоузел может не существовать. Нужно оставить в очереди заявку на его заполнение, когда будет создан
			postNodeInits.push(setNode0)
		}
		obj.color = open.color	// Цвет закрытой скобки такой же, как у открытой

		// Определить "текстовость" скобок
		let lst = curEntity.cmds, i = lst.length, txVis = new IsNonText()
		addCmd(obj)
		while (!txVis.ok && lst[i] !== open) {
			lst[i].walk(txVis)
			i--
		}
		open.bTxt = obj.bTxt = !txVis.ok


		// Добавить скобку в список для закрытия
		bracketEnds.unshift(obj)

		// Извлечение коэффициента и заряда
		pos++
		let k = scanKoeff()
		if (k !== null)
			obj.n = k
		obj.pB = pos

		chargeOwner = obj
	}

	function brEndsCtrl(node) {
		let i, brEnd
		for (i in bracketEnds) {
			brEnd = bracketEnds[i]
			if (!brEnd.nodes[1]) brEnd.nodes[1] = node
		}
		bracketEnds.length = 0
	}


	//------------ СВЯЗИ ---------------
	// Назначить curNode концом curBond (если она есть) и очистить связь
	function setBondEnd(bRef) {
		// Если есть связь, завершить её
		if (curBond) {
			curBond.nodes[1] = curNode
			/*
			 // Возможно, связь мягкая
			 if (curBond.soft) {
			 // Если curNode получен по ссылке, то не нужно его переносить в новую подцепь
			 chainSys.closeSC(bRef?0:curNode);
			 }
			 //curBond = 0;
			 */
			closeBond()
		}
	}

	function closeBond() {
		if (curBond) {
			if (!curBond.nodes[1]) {
				smartCreateNode(1)
			}
			curBond = 0
		}
	}

	// Самая низкуровневая функция создания связи
	function createBondUni(pa) {
		let bond = new ChemBond()
		bond.setPos(pa, pos)
		addCmd(bond)
		curEntity.bonds.push(bond)
		if (curColor)
			bond.color = curColor
		return bond
	}

	function setCommonBondProps(bond, def) {
		bond.align = def.align || dblAlignMode // x,l,r,m - перекрещенная или смещённая связь
		if (def.H && bond.N === 1) {
			bond.style = ':'
		}
		if (def.C) {	// координационная связь = coordinate bond = dative covalent bond =Dipolar bond
			switch (def.C) {
			case '-':
				bond.arr0 = 1; break
			case '+':
				bond.arr0 = bond.arr1 = 1; break
			default:
				bond.arr1 = 1
			}
		}
		if (def['<']) bond.arr0 = 1	// стрелка против направления связи
		if (def['>']) bond.arr1 = 1	// стрелка по направлению связи
		if (def['~']) def.S = '~'	// извилистая линия (рацемическая связь, н.р. D-глюкопираноза)

		// Явное определение стилей перекрывает ранее назначенный стиль
		if (def.S) {
			if (/^..[lrm]$/i.test(def.S)) {
				// для стиля может быть задан режим выравнивания, н.р. |:L
				bond.style = def.S.slice(0, 2)
				bond.align = def.S[2]
			} else {
				bond.style = def.S
			}
		}

		if (bond.align)
			bond.align = bond.align.toLowerCase()

		bond.brk = !bond.soft
	}

	// def:
	//  pt - шаг связи
	//  soft - мягкая связь
	//  tx - text
	//  N - кратность
	//  slope
	function createBondStd(def, pA) {
		closeBond()
		checkCurNode()	// Если текущего узла нет, нужно создать автоузел
		let bond = createBondUni(pA || itemPos0 - bNegChar)
		bond.pt = def.pt
		bond.nodes[0] = curNode
		closeNode()
		if (def.soft)
			bond.soft = 1
		bond.tx = def.tx
		bond.N = def.N
		bond.slope = def.slope// || 1;
		curBond = bond
		prevBond = curBond

		// Скобки...
		if (bracketEnds.length) {
			bracketEnds[0].bond = bond
			bracketEnds.length = 0
		}

		// Связь считается текстовой, если она расположена горизонтально и имеет длину =1
		bond.bText = Point.is0(Math.abs(def.pt.x) - 1) && Point.is0(def.pt.y)
		if (def.T)
			bond.tx = def.T

		// толщина концов связей
		// толщина связей
		function setWidth(id, sign, glb) {
			let val = def[id]
			if (val) {
				if (val === '-') {
					def.w0 = sign
					def.w1 = 0
				} else if (val === '2') {
					def.w0 = def.w1 = sign
				} else if (val === '1' || val === '0') {
					def.w0 = def.w1 = 0
				} else if (val === '+') {
					def.w0 = 0
					def.w1 = sign
				} else val = 0
				if (val && glb) {
					curWidth = def.w1
				}
			}
			return val
		}
		setWidth('w', 1) || setWidth('d', -1) || setWidth('W', 1, 1) || setWidth('D', -1, 1)
		if (def.w0 || def.w1) {
			bond.w0 = def.w0
			bond.w1 = def.w1
		}

		setCommonBondProps(bond, def)

		// Загрузка промежуточных точек
		if (middlePoints.length) {
			bond.midPt = []
			bond.pA = middlePoints[0].pos
			var pt, i, lastPt = bond.pt.clone()
			for (i in middlePoints) {
				bond.midPt.push(pt = middlePoints[i].pt)
				bond.pt.addi(pt)
			}
			bond.midPt.push(lastPt)
			middlePoints.length = 0
		}
	}


	// Возможен поиск координат для указанных вершин
	function toNumCoord(src, axis, apos) {
		// description _(x) => {x:true}
		if (!src || src === true) return 0
		if (src.charAt(0) === '#') {
			// Привязка к другим узлам. Номера узлов через ;
			let lnkLst = src.slice(1).split(';'), sum = 0, i, nd, ipos = apos + 1
			for (i in lnkLst) {
				nd = findNodeEx(lnkLst[i], ipos)
				sum += nd.pt[axis]
				ipos += lnkLst[i].length + 1
			}
			sum /= lnkLst.length
			checkCurNode()
			return sum - curNode.pt[axis]
		}
		return toNum(src, apos)
	}


	// создать смещение для нового узла полигона
	// cw = 1/-1 = по или против часовой стрелки
	// cnt - количество углов (граней) полигона
	// dstPt - смещение (используется для повышения эффективности, чтобы не создавать лишний объект)
	// len - длина связи ТОЛЬКО для случая, когда отсутствует предыдущая связь
	function createPolygonStep(cw, cnt, dstPt, len) {
		// dstPt = dstPt  || new Point() // - never used
		if (!prevBond) {
			dstPt.init(len, 0)
			return dstPt
		}
		//checkCurNode(); - uniBond
		let p1 = curNode.pt,
			p0 = prevBond.nodes[0].pt,
			dist = p1.dist(p0),
			ca = Math.PI * 2 / cnt,
			a0 = p1.subx(p0).polarAngle(),
			A = a0 + cw * ca
		dstPt.fromRad(A).muli(dist)
		return dstPt
	}


	// Вычислить координаты из описания
	function calcPosition(def, defPos) {
		let pt = new Point(), val, len = def.L
		if (len) {
			len = toNum(len, defPos.L)
		} else {
			len = stdLen
		}
		function fromAngle(a) {
			pt.fromDeg(a).muli(len)
		}
		// взаимоисключаются описания: p, P, a, A
		if ('p' in def) {
			// Использование координат существующих узлов
			// example: p1;-1
			// Без #
			checkCurNode()
			let ndl, k, lbl, lblLst = def.p.split(';'), ipos = defPos.p
			for (k in lblLst) {
				ndl = findNodeEx(lbl = lblLst[k], ipos)
				pt.addi(ndl.pt)
				ipos += lbl.length + 1
			}
			pt.muli(1 / lblLst.length)
			pt.subi(curNode.pt)
		} else if ('P' in def) {
			val = def.P === true ? 5 : (+def.P || 5)
			createPolygonStep(val < 0 ? -1 : 1, Math.abs(val), pt, len)
		} else if ('a' in def) {
			let a = 0
			if (prevBond) {
				checkCurNode()
				let dif = curNode.pt.subx(prevBond.nodes[0].pt)
				a = dif.polarAngle() * 180 / Math.PI
			}
			a += toNum(def.a, defPos.a)
			fromAngle(a)
		} else if ('A' in def) {
			fromAngle(toNum(def.A, defPos.A))
		}
		// значения x, y могут быть прибавлены к другим способам описания координат
		val = def.x
		if (val) {
			pt.x += toNumCoord(val, 'x', defPos.x)
		}
		val = def.y
		if (val) {
			pt.y += toNumCoord(val, 'y', defPos.y)
		}
		return pt
	}

	function makeDefFromArgs(args, argsPos, def, defPos) {
		let i, a, key, val
		for (i in args) {
			a = args[i]
			key = a[0]
			val = a.slice(1)
			def[key] = val || true
			defPos[key] = argsPos[i] + 1
		}
	}

	// Построить универсальную связь
	function createBondFull(pa, args, argsPos) {
		let def = { tx:'_', N: 1, w0: curWidth, w1: curWidth }, defPos = {}
		makeDefFromArgs(args, argsPos, def, defPos)

		// Перекрещенная двойная связь или режимы выравнивания L, R, M
		if (/^2[xlrm]$/i.test(def.N)) {
			def.align = def.N[1]
			def.N = 2
		} else def.N = +def.N

		checkCurNode() // Иначе неправильно считается позиция x#-1;1
		def.pt = calcPosition(def, defPos)

		createBondStd(def, pa)
	}

	// дополнительные настройки из суффикса
	function loadSuffix(def) {
		while (pos < textLen) {
			c = text[pos]
			switch (c) {
			case '0':	// пустая связь
			case 'o':
				def.N = 0
				break
			case 'h':
				def.H = 1
				break
			case 'w':
				def.w = (def.w === '+') ? '-' : '+'
				break
			case 'd':
				def.d = (def.d === '+') ? '-' : '+'
				break
			case 'x':
				def.align = 'x'
				break
			case '~':
				def.S = '~'
				break
			case 'v':
				if (!def['>']) def['>'] = 1
				else if (!def['<']) {
					def['<'] = 1
					def['>'] = 0
				}
				break
			default:
				return
			}
			pos++
		}
	}

	// Создание связи-ребра полигона _p или _q
	// type = p|q
	function createEdgeBond(type, pa) {
		let def = { N:1, pt:new Point() }, vertexCnt, j
		pos++
		if (text[pos] === type) {	// повтор типа означает двойную связь
			def.N++
			pos++
		}
		j = pos
		while (pos < textLen && isDigit(text[pos])) pos++
		vertexCnt = j === pos ? 5 : +text.substring(j, pos)

		createPolygonStep(type === 'q' ? -1 : 1, vertexCnt, def.pt, stdLen)
		loadSuffix(def)

		createBondStd(def, pa)
	}

	// Создание промежуточной точки для изогнутой линии
	function createMiddlePoint() {
		let p0 = pos - 1
		pos++
		if (text[pos] !== '(') {
			error("Expected '(' after [S]", { pos:pos - 1, S:'_m' })
		}
		pos++
		let args = [], argsPos = [], def = {}, defPos = {}, pt
		scanArgs(args, argsPos)
		makeDefFromArgs(args, argsPos, def, defPos)
		checkCurNode() // на всякий случай
		pt = calcPosition(def, defPos)
		middlePoints.push({ pt:pt, pos:p0, pos1:pos })
	}

	// Циклическая пи-связь (бензол с кольцом)
	function createRing(pa) {
		let n = nodesBranch.length, j = n - 2, bond
		if (n < 3)
			error('Cant create ring', { pos:pa })
		// Поиск совпавшей вершины
		while (j >= 0 && nodesBranch[j] !== curNode) j--
		if (j < 0)
			error('Cant close ring', { pos:pa })
		bond = createBondUni(pa)
		bond.nodes.length = 0
		bond.tx = bond.ext = 'o'
		bond.N = 1
		for (j++; j < n; j++) {
			bond.nodes.push(nodesBranch[j])
		}
	}


	// Конструкция _s для ввода связи через несколько узлов
	function createPolyBond(args, argsPos, pa) {
		let def = {}, defPos = {}, bond, nodes
		makeDefFromArgs(args, argsPos, def, defPos)
		bond = createBondUni(pa)
		bond.tx = bond.ext = 's'
		nodes = bond.nodes
		nodes.length = 0
		bond.o = def.o	// Признак цикличности, заданный в описании связи
		if (def.N) bond.N = +def.N
		setCommonBondProps(bond, def)
		function parseListDef(listDef) {
			let nodes = bond.nodes,
				ipos = defPos['#'],
				i, j, pieces = listDef.split(';'),
				intDef, node, node2
			for (i in pieces) {
				intDef = pieces[i].split(':')
				if (intDef.length === 1) {
					// Один узел
					nodes.push( findNodeEx(intDef[0], ipos) )
				} else {
					// Интервал узлов
					node = findNodeEx(intDef[0], ipos)
					node2 = findNodeEx(intDef[1], ipos + intDef[0].length + 1)
					if (node.index > node2.index) {
						// Если в обратном порядке, меняем местами
						[node2, node] = [node, node2]
					}
					let agentNodes = curEntity.nodes
					for (j = node.index; j < agentNodes.length; j++) {
						nodes.push(agentNodes[j])
						if (node2 === agentNodes[j])
							break
					}
				}
				ipos += pieces[i].length + 1
			}
		}
		function autoFind() {
			let j = nodesBranch.length - 1, node0 = 0, node
			while (j >= 0) {
				nodes.push(node = nodesBranch[j])
				if (!node0)
					node0 = node
				else if (node == node0)
					break	// кольцо замкнулось
				j--
			}
		}
		var n, listDef = def['#']
		if (listDef) {
			// Разбор описания списка узлов
			parseListDef(listDef)
		} else {
			// Включаем все узлы подряд с конца. Либо до замыкания кольца, либо до начала ветки
			autoFind()
		}
		n = nodes.length
		// Признак цикличности: число узлов 4 или больше И первый узел в цепи совпадает с последним
		if (n > 3 && nodes[0] == nodes[n - 1]) {
			nodes.length = n - 1 // Убрать последний узел
			bond.o = 1
		}
		//bond.style = def.S;
	}

	// Строим числовые характеристики связей. Они соответствуют циферблату:
	// неоткорректированные наклонные ближе к горизонтали (2,4,8,10)
	// откорректированные ближе к вертикали (1,5,7,11)
	// 1=откорректированная связь /, 2=неоткорректированная связь /,
	// 3= -, 4=не корректированная \, 5= корректированная \
	// 6= |, 7= не корректированная `/, 8=корректированная `/, 9= `-,
	// 10= не корректированная `\, 11 = корректированная `\, 12 = `|

	function calcSlopeId(slope, bNeg, bHoriz, bCorr) {
		//var s = bond.slope, b=bond.bNeg;
		if (!slope) { // Либо горизонтальная, либо вертикальная
			if (bHoriz) {
				return bNeg ? 9 : 3
			} else {
				return bNeg ? 12 : 6
			}
		}
		// остаются наклонные, у которых s 1 или -1
		if (slope > 0) { // 4,5,10,11
			if (bCorr) { // 5,11
				return bNeg ? 11 : 5
			} else { // 4,10
				return bNeg ? 10 : 4
			}
		}
		// 1,2, 7,8
		if (bCorr) {
			return bNeg ? 7 : 1
		}
		return bNeg ? 8 : 2
	}
	function bondSlopeId(bond) {
		return calcSlopeId(bond.slope, bond.bNeg, Point.is0(bond.pt.y), bond.bCorr)
	}

	// Создание связи из краткого описания
	function createBondShort() {
		// Извлечение максимально длинной связи
		// TODO: этот алгоритм можно ускорить, если заранее построить дерево проверок
		let i, l, maxLen = 0, bestId, bestDef, n1
		for (i in BondDefs) {
			if (text.indexOf(i, pos) === pos) {
				l = i.length
				if (l > maxLen) {
					maxLen = l
					bestId = i
				}
			}
		}
		bestDef = BondDefs[bestId]
		pos += maxLen
		// 0=кратность, 1=угол, 2=знак уклона, 3=признак мягкой связи, 4=текст
		let slope = bestDef[2], angle0 = bestDef[1],
			def = { N:bestDef[0], slope:slope, soft:bestDef[3], tx:bestDef[4] || bestId }
		loadSuffix(def)

		let linkSlope = userSlope || defaultSlope,
			angle = bestDef[1] + slope * linkSlope

		let bsid1 = 0, bsid2 = 0,
			prevL = prevBond,
			bCorr = 0,
			bHoriz = !angle0 && !slope
		// Автокоррекция. Шаг 1.
		// Не используется, если угол наклона явно указан при помощи $slope
		if (!userSlope && prevL && prevL.bAuto) {
			bsid1 = bondSlopeId(prevL)
			bsid2 = calcSlopeId(slope, bNegChar, bHoriz, 0)
			if (((bsid1 === 3 || bsid1 === 9) && slope) ||		// horiz, slope
				((bsid1 === 8 || bsid1 === 7) && bsid2 === 4) ||		// `/\
				((bsid1 === 4 || bsid1 === 5) && bsid2 === 8) ||		// \`/
				((bsid1 === 10 || bsid1 === 11) && bsid2 === 2) ||	// `\/
				((bsid1 === 1 || bsid1 === 2) && bsid2 === 10)		//  /`\
			) {
				angle = bestDef[1] + slope * Math.PI / 3
				bCorr = 1
			}
		}
		if (bNegChar)
			angle += Math.PI

		def.pt = new Point().fromRad(angle).muli(stdLen)

		createBondStd(def)

		curBond.bAuto = 1
		curBond.bCorr = bCorr
		curBond.bNeg = bNegChar
		bNegChar = 0
		n1 = curBond.nodes[0]

		// Коррекция предыдущей связи:
		// Коррекция разрешена, есть предыдущая связь, она автоматическая и не корректировалась
		if (!userSlope && prevL && prevL.bAuto && !prevL.bCorr && !n1.fixed) {
			// Либо сочетание наклонной связи с горизонтальной.
			// Либо сочетание разнонаправленных наклонных связей
			if (((bsid1 === 4 || bsid1 === 5) && bsid2 === 8) ||  // \`/
				((bsid1 === 2 || bsid1 === 1) && bsid2 === 10) || // /`\
				((bsid1 === 10 || bsid1 === 11) && bsid2 === 2) || // `\/
				((bsid1 === 8 || bsid1 === 7) && bsid2 === 4) || // `/\
				((bsid1 === 10 || bsid1 === 8 || bsid1 === 2 || bsid1 === 4) && bHoriz)
			) {
				let a = prevL.nodes[0].pt,
					d = n1.pt.subx(a),
					sx = d.x < 0 ? -1 : 1, sy = d.y < 0 ? -1 : 1,
					d1 = new Point(Math.abs(d.y) * sx, Math.abs(d.x) * sy),
					newPt = d1.addi(a),
					corr = newPt.subx(n1.pt)
				prevL.bCorr = 100
				n1.pt = newPt
				// возможно, требуется откорректировать боковую ветку...
				/* TODO: закомментировано временно, пока нет боковых веток
				 var chL=chains[curChain].L;
				 var j=chL.length-2;
				 while (chL[j]!=prevL && j>=0) chL[--j].nodes[1].ufl=0;
				 if (j<chL.length-2) {
				 while (j<chL.length-2) {
				 var ndj=chL[++j].nodes[1];
				 if (!ndj.ufl) {
				 ndj.ufl=1;
				 ndj.pt.addi(corr);
				 }
				 }
				 }
				 */
			}
		}
	}

	////////////////////////////////////////////////
	// Элементы узлов

	function getLastItem() {
		var lst = curNode.items, L = lst.length
		return L ? lst[L - 1] : 0
	}
	function closeNodeItem() {
		//var item=getLastItem();
		//if (item && !item.pB) item.pB=pos;
	}
	function addNodeItem(obj) {
		if (bracketEnds.length) {
			closeNode()
			chainSys.closeSC()
		}
		if (!curNode)
			smartCreateNode()
		closeNodeItem()
		var item = new ChemNodeItem(obj)
		item.setPos(itemPos0, pos)
		curNode.items.push(item)
		curNodeEnd = pos

		if (bNegChar) {	// Назначить явным образом центральный элемент узла
			item.bCenter = true
			bNegChar = 0
		}

		// Предыдущие настройки...
		item.M = specMass
		specMass = 0
		item.atomNum = bAtomNum
		bAtomNum = 0
		if (curItemColor1) {
			item.color = curItemColor1
			curItemColor1 = 0
		} else if (curItemColor) {
			item.color = curItemColor
		} else {
			item.color = curColor
		}
		if (curAtomColor1) {
			item.atomColor = curAtomColor1
			curAtomColor1 = 0
		} else {
			item.atomColor = curAtomColor
		}
		item.dots = nextDots
		item.dashes = nextDashes
		nextDots = nextDashes = 0

	}

	//------------- ссылки

	// Найти существующий узел по описанию (номер, обозначение элемента)
	function findNode(ref) {
		let i, n = +ref, lst = curEntity.nodes
		if (n) {
			if (n < 0) { // Отрицательные номера использовать для обратной индексации
				n += lst.length
				if (n < 0) return 0
				return lst[n]
			}
			if (n > lst.length) return 0 // Выход за пределы списка
			return lst[--n] // Т.к. нумерация с 1
		}

		// Возможно, метка...
		// Если была указана метка, совпадающая с обозначением элемента, то метка имеет приоритет выше
		nd = nodesMap[ref]
		if (nd)
			return nd

		// если указан элемент (возможно с номером)
		let nodes, nd, elId = ref, el = _findElem(elId)
		if (el) {
			nodes = curEntity.nodes
			n = nodes.length
			for (i = 0; i < n; i++) {
				nd = nodes[i]
				if (nd.items.length === 1 && nd.items[0].obj === el) {
					return nd
				}
			}
		}
		return 0
	}
	function findNodeEx(refId, startPos) {
		var node = findNode(refId)
		if (!node) error("Invalid node reference '[ref]'", { ref:refId, pos:startPos })
		return node
	}


	// Final state machine for syntax analyzer
	const fsm = {
		begin: () => {
			skipSpace()
			if (pos >= textLen) {
				return 0
			}
			// Previous comment
			if (c === '"') {
				return setState('commPre', 1)
			}
			// Если операция, обрабатываем её
			let r = checkOp()
			if (r !== null)
				return r

			// Возможно наличие коэффициента
			koeffPrePos = pos
			koeffPre = scanKoeff()
			skipSpace()
			if (pos === textLen)
				return 0

			c = text[pos]
			// Здесь возможно открытие суперскобки...
			if (c === '(' && isSpace(nextChar())) {
				_notImpl('Superbracket')
			}

			// Иначе считаем, что это начало реагента
			return setState('agent')
		}, // begin
		commPre: function () {
			commentPrePos = pos
			commentPre = scanComment()
			return setState('begin', 1)
		},
		agent: function () {
			// Начало распознавания реагента
			createEntity(new ChemAgent())
			openAgent()
			return setState('agentIn')
		},
		agentIn: function () {
			let res = parseNode()
			if (res < 0)
				error("Unknown element character '[C]'", { C:c, pos:pos })
			return res
		},
		agentMid: function () {
			let res = parseNode()
			if (res < 0) {
				// Конец агента
				closeAgent()
				return setState('begin')
			}
			return res
		},
		agentElem: function () {
			// Извлечение элемента. Первая буква уже пройдена, pos указывает на вторую
			let pos0 = pos - 1
			while (pos < textLen && isSmallAlpha(text[pos])) pos++
			let elemId = _substr(pos0),
				obj = _findElem(elemId)
			if (!obj)
				error("Unknown element '[Elem]'", { pos:pos0, Elem:elemId })
			addNodeItem(obj)
			return setState('postItem')
		},
		// Сразу после элемента узла
		postItem: function () {
			let item, k = scanKoeff()
			if (k !== null) {
				item = getLastItem()
				item.n = k
				item.pB = pos
				return setState('postItem')
			}
			// Возможно, степень окисления в скобках
			k = scanOxidation()
			if (k) {
				item = getLastItem()
				item.charge = k
				item.pB = pos
				return setState('postItem')
			}
			curNodeEnd = pos
			return setState(st_agentMid)
		},
		funcName: function () {
			// Извлечение имени функции до скобки
			let p0 = pos, name, args = [], argPos = []
			while (pos < textLen && text[pos] !== '(') pos++
			if (pos === textLen)
				error("Expected '(' after [S]", { S:'$', pos: p0 })
			name = _substr(p0)
			pos++
			scanArgs(args, argPos)
			// Если имя функции не найдено, функция игнорируется
			// с целью совместимости со следующими версиями
			if (funcs[name]) {
				funcs[name](args, argPos)
			}
			return setState(st_agentMid)
		},
		// Создание абстрактного элемента или радикала
		custom: function () {
			let p0 = pos, s, radical
			while (pos < textLen && text[pos] !== '}') pos++
			if (pos >= textLen)
				error('Abstract element is not closed', { pos: p0 - 1 })
			s = _substr(p0); pos++
			radical = ChemRadical.Map[s]
			addNodeItem(radical || new ChemCustom(s))
			return setState('postItem')
		},
		// Заряд узла (после ^)
		nCharge: function () {
			if (!chargeOwner)
				error('Expected node declaration before charge', { pos:pos - 1 })
			let p0 = pos, charge = scanCharge()
			if (!charge)
				error('Invalid charge declaration', { pos:p0 })
			if (bNegChar) {	// Наличие ` перед объявлением заряда означает, что заряд нужно вывести слева
				charge.bLeft = 1
				bNegChar = 0
			}
			chargeOwner.charge = charge
			return setState(st_agentMid)
		},
		// Первый символ ссылки на узел
		nodeRef: function () {
			var p0 = pos, refId, node
			if (isDigit(c) || c == '-') {
				// Извлечение числовой ссылки
				pos++
				while (pos < textLen && isDigit(text[pos])) pos++
			} else if (/[A-Z]/i.test(c)) {
				// Извлечение текстовой ссылки
				pos++
				while (pos < textLen && /^[A-Z\d]$/i.test(text[pos])) pos++
			} else if (isSpace(c)) {
				// Пропуск
				return setState('agentSpace', 1)
			}
			refId = _substr(p0)
			node = findNodeEx(refId, p0)

			// Установить признак, означающий конец мостика,
			// чтобы мягкие связи между уже существующими узлами не сливались
			// возможно, стоило переместить в linkNode...
			if (curBond)
				curBond.brk = 1

			linkNode(node)
			return setState(st_agentMid)
		},
		agentSpace: function () {
			while(pos < textLen && isSpace(text[pos])) pos++
			return setState(st_agentMid)
		},
		uniBond: function () {
			checkCurNode()
			var pa = pos - 1, args = [], argsPos = [], bCreate = 1
			if (c == '(') {
				pos++
				scanArgs(args, argsPos)
			} else if (c == 'p' || c == 'q') {
				createEdgeBond(c, pa)
				bCreate = 0
			} else if (c === 'm') {
				createMiddlePoint()
				bCreate = 0
			} else if (c === 'o') {
				pos++
				createRing(pa)
				bCreate = 0
			} else if (c === 's') {
				if (text[++pos] !== '(')
					error("Expected '(' after [S]", { S:c, pos:pos })
				pos++
				scanArgs(args, argsPos)
				createPolyBond(args, argsPos, pa)
				bCreate = 0
			}
			if (bCreate)
				createBondFull(pa, args, argsPos)
			return setState(st_agentMid)
		},
		mul: function () {
			// Мультипликатор. pos указывает на следующий символ после *
			checkMul()
			var pa = pos - 1,
				n = scanKoeff()
			var cmd = new ChemMul(n || 1)
			cmd.setPos(pa, pos)
			addCmd(cmd)
			closeNode()
			chainSys.closeSC()	// нужно прекратить подцепь
			branchStack.unshift({ m:cmd })	// внести команду в стек веток со свойством m
			// Извлечение произойдёт при закрытии > ), в конце агента или в начале нового мультипликатора
			return setState(st_agentMid)
		}

	} // fsm

	//////////////////////////////////////////////
	//		Собственно алгоритм компиляции
	try {
		// В различных источниках часто встречается символ, похожий на минус, но с другим кодом...
		text = text.replace(/−/g, '-')
		// Выполнить препроцесс
		text = result.src = preProcess(text)

		// Добавить пробел в конец описания для упрощения алгоритма распознавания
		text += ' '
		textLen = text.length

		// main cycle of syntax analyzer
		while (pos < text.length) {
			c = text[pos]
			var d = fsm[curState]()
			pos += d
		}
	} catch (err) {
		result.error = (err instanceof ChemError) ? err : new ChemError('Internal error: [msg]', { msg:err.message })
	}

	result.src0 = text	// source text

	return result
}
