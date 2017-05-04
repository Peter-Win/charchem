/**
 * The module for compiling the source code of an expression.
 * The result is always ChemExpr, which can contain a description of the error
 * Created by PeterWin on 28.04.2017.
 */
"use strict"

import ChemError from '../core/ChemError'
import ChemExpr from '../core/ChemExpr'
import ChemSys from '../ChemSys'

function _notImpl(fnName) {
	throw new ChemError('Function is not implemented: '+fnName)
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
	{op: '+'},
	{op: '-->', eq:1, dst:'—→'},
	{op: '->', eq:1, dst:'→'},
	{op: '®', eq:1, dst:'→'},
	{op: '→', eq:1},
	{op: '=',eq:1},
	{op: '↔', eq:1},
	{op: '<->', eq:1, dst:'↔'},
	{op: '<=>', eq:1, dst:'\u21CC'},
	{op: '<==>', eq:1, dst:'\u21CC'},
	{op: '*', dst:'∙'},
	{op: '!=', dst:'≠'}
];

// Bonds description synonims
const BondsSyn = {
	'≡': '%',
	'–': '-'
}

// 0=(Multiplicity), 1=(Angle in degrees), 2=(sign of slope), 3=(soft bond flag), 4=(text)
const BondDefs = {
	"-": [1, 0, 0, 1],
	"=": [2, 0, 0, 1],
	"%": [3, 0, 0, 1, "≡"],
	"--": [1, 0, 0, 0, '-'],
	"==": [2, 0, 0, 0, '='],
	"%%": [3, 0, 0, 0, "≡"],
	"|":  [1, 90, 0],
	"||": [2, 90, 0],
	"|||": [3, 90, 0],
	"/": [1, 0, -1],
	"//": [2, 0, -1],
	"///": [3, 0, -1],
	"\\": [1, 0, 1],
	"\\\\": [2, 0, 1],
	"\\\\\\": [3, 0, 1]
}

let BondDefMap={}	// Map 'first char'=>1 for parseNode optimization


//==========================================
//		compiler first initialization
!function() {
	// 180 -- π, grad -- rad,  rad=grad*π/180 = grad*k,  k=π/180
	let i, def, k=Math.PI/180
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

const isSpace = ch => ch===' ' || ch==="\t" || ch==="\n"
const isDigit = ch => ch>='0' && ch<='9'
const isSmallAlpha = ch => ch>='a' && ch<='z'

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

		commentPre=0,	// The line of the preliminary comment
		commentPrePos=0,
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
		bracketEnds=[],
		middlePoints=[],	// Middle points list for curved bonds. Список промежуточных точек для изогнутых связей
		nodesBranch = [],	// Список линейно связанных узлов (свой для каждой ветки). Заполняется через push
		postNodeInits = [],	//  void(ChemNode) functions для пост-инициализации узлов

		nodesMap,	// named nodes for  #Name access
		bNegChar = 0,	// Признак изменения поведения следующей конструкции (обратный апостроф)
		curWidth = 0,	// Текущая толщина, нстраиваемая W+,W2,W-,D+,D-,D2

		userSlope = 0,	// Наклон кратких описаний связей, заданный функцией $slope
		defaultSlope = Math.PI/6,	// 30° - стандартный наклон кратких описаний связей
		degToRad = Math.PI/180,

		err,
		st_agentMid = 'agentMid',
		_findElem = ChemSys.findElem


	const nextChar = () => text[pos+1]

	const error = (msgId, par={}) => {
		if ('pos' in par) {
			par.pos++
		}
		throw new ChemError(msgId, par)
	}

	const checkMiddlePoints = () => {
		if (middlePoints.length) {
			error('Invalid middle point', middlePoints[0]);
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
			branchStack.shift();
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
	const setState = (st, res=0) => {
		curState = st
		return res
	}

	const _substr = pos0 => text.slice(pos0, pos)

	const skipSpace = () => {
		while (pos<textLen && isSpace(c = text[pos])) pos++
	}

	/**
	 * Retrieves a comment
	 * Initially, pos must be set to the first character inside the quotes.
	 * At the end it is set to the final quotation mark
	 * @returns {string}
	 */
	function scanComment() {
		let p0=pos
		while (pos<textLen && text[pos]!=='"') pos++
		if (pos===textLen)
			error('Comment is not closed',{pos:p0-1})
		return _substr(p0)
	}



	// Final state machine for syntax analyzer
	const fsm = {
		begin: () => {
			skipSpace()
			if (pos >= textLen) {
				return 0
			}
			// Previous comment
			if (c==='"') {
				return setState('commPre', 1)
			}
		}
	}

	//////////////////////////////////////////////
	//		Собственно алгоритм компиляции
	try {
		// В различных источниках часто встречается символ, похожий на минус, но с другим кодом...
		text = text.replace(/−/g,'-');
		// Выполнить препроцесс
		text = result.src = _preProcess(text);
		// Добавить пробел в конец описания для упрощения алгоритма распознавания
		text += ' ';
		textLen = text.length;

		// main cycle of syntax analyzer
		while (pos < text.length) {
			c = text[pos];
			var d = fsm[curState]();
			pos += d;
		}
	} catch (err) {
		result.error = (err instanceof ChemError) ? err : new ChemError('Internal error: [msg]', {msg:err.message});
	}

	result.src0 = text	// source text

	return result
}