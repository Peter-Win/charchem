/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 27.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.esc = esc;

var _core = __webpack_require__(2);

var _compiler = __webpack_require__(11);

var _ChargeCalc = __webpack_require__(12);

var _ChargeCalc2 = _interopRequireDefault(_ChargeCalc);

var _ChemAtom = __webpack_require__(4);

var _ChemAtom2 = _interopRequireDefault(_ChemAtom);

var _ElemListMaker = __webpack_require__(13);

var _ElemListMaker2 = _interopRequireDefault(_ElemListMaker);

var _IsAbstract = __webpack_require__(14);

var _IsAbstract2 = _interopRequireDefault(_IsAbstract);

var _MassCalc = __webpack_require__(15);

var _MassCalc2 = _interopRequireDefault(_MassCalc);

var _TextMaker = __webpack_require__(5);

var _TextMaker2 = _interopRequireDefault(_TextMaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * html escape
 * @param {string|*} txt	If not string, always return ''
 * @returns {string}
 */
function esc(txt) {
	return typeof txt === 'string' ? txt.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

// Extended elements list
var extElems = {
	D: new _ChemAtom2.default(1, 'D', 2) // Deiterium - $M(2)H
};

var ChemSys = new function () {
	this.ver = function () {
		// This values must be equal to version in package.json
		return [1, 1, 2];
	};
	this.verStr = function () {
		return this.ver().join('.');
	};

	/**
  * Global macros map
  * @type {Object<string,Macros>}
  */
	this.macros = {};

	// Roman numerals for the designation of charges
	this.RomanNum = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };

	// Compiler
	this.compile = _compiler.chemCompiler;

	/**
  * Search for an element by its symbolic designation
  * If found, then result ChemAtom, else undefined
  * @param {string} id
  * @returns {ChemAtom|undefined}
  */
	this.findElem = function (id) {
		return _core.MenTbl[id] || extElems[id];
	};

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
		$InvisibleBond: ' ', // Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
		Mul: '*', // Конструкция умножения внутри агента CuSO4_*5_H2O
		MultiK: '*', // Коэффициент 5 в конструкции CuSO4*5H2O
		$MulChar: '∙' // Символ умножения. Варианты: x * × ∙
	};
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
		$InvisibleBond: ' ', // Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
		$MulChar: '∙' // Символ умножения. Варианты: x * × ∙
	};

	// Правила для текстового представления формул
	this.rulesText = {
		AgentK: '*',
		ItemCnt: '*',
		ItemCharge: '*',
		NodeCharge: '*',
		Custom: '*',
		ColorPre: '',
		ColorPost: ''
	};

	/**
  * Make text
  * @param {ChemObj} formula
  * @param {Object=} rules	Default rules = ChemSys.rulesHtml
  * @returns {string}
  */
	this.makeHtml = function (formula, rules) {
		var visitor = new _TextMaker2.default(rules);
		formula.walk(visitor);
		return visitor.res();
	};

	/**
  * Detect empty node
  * @param {ChemNode} node
  * @returns {boolean}
  */
	this.isEmptyNode = function (node) {
		var bNonEmpty = 0;
		function onComment(obj) {
			if (obj.tx !== '') return bNonEmpty = 1;
		}
		function nonEmpty() {
			return bNonEmpty = 1;
		}
		node.walk({
			atom: nonEmpty,
			radical: nonEmpty,
			custom: onComment,
			comm: onComment
		});
		return !bNonEmpty;
	}; // isEmptyNode

	// Является ли указанный объект абстрактным
	this.isAbstract = function (obj) {
		var visitor = new _IsAbstract2.default();
		obj.walk(visitor);
		return visitor.ok;
	};

	// Высчитать общую массу указанной формулы или реагента
	this.calcMass = function (obj) {
		var visitor = new _MassCalc2.default();
		obj.walk(visitor);
		return visitor.getSum();
	};

	this.calcCharge = function (obj) {
		var visitor = new _ChargeCalc2.default();
		obj.walk(visitor);
		return visitor.result();
	};

	// Сформировать текстовую брутто-формулу (которую можно откомпилировать в выражение, но если нужно выражение, то лучше сразу использовать makeBrutto)
	// Коэффициент агентов не учитывается.
	// Не имеет смысла для выражений, которые содержат больше одного агента.
	this.makeBruttoKey = function (expr) {
		var ignoreCharge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var list = void 0,
		    listMaker = new _ElemListMaker2.default();
		expr.walk(listMaker);
		list = listMaker.result();
		list.sortByHill();
		if (ignoreCharge) list.charge = 0;
		return list.toString();
	};

	this.makeBrutto = function (expr) {
		var bruttoKey = ChemSys.makeBruttoKey(expr);
		return ChemSys.compile(bruttoKey);
	};
}();

try {
	window.ChemSys = ChemSys;
} catch (e) {/* ignore */}

exports.default = ChemSys;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Base class for all chemical objects
 * Supports information about the position of the object in the source description (usually after the preprocessor)
 * Created by PeterWin on 28.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChemObj = function () {
	/**
  * @constructor
  * @param {number=} a	Start position in description
  * @param {number=} b	Finish position in description
  */
	function ChemObj() {
		var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		_classCallCheck(this, ChemObj);

		this.pA = a;
		this.pB = b;
	}

	_createClass(ChemObj, [{
		key: 'setPos',
		value: function setPos(start, stop) {
			this.pA = start;
			this.pB = stop;
		}
	}]);

	return ChemObj;
}();

exports.default = ChemObj;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 27.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenTblArray = exports.MenTbl = exports.massRound = exports.isAbsK = undefined;

var _ChemAtom = __webpack_require__(4);

var _ChemAtom2 = _interopRequireDefault(_ChemAtom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Is this koefficient abstract? For example n in -(CH₂)ₙ-
 * @param {number|string} n
 * @returns {boolean}
 */
var isAbsK = exports.isAbsK = function isAbsK(n) {
  return typeof n !== 'number';
};

/**
 * Standard rounding for mass value
 * @param {number} m
 * @returns {number}
 */
var massRound = exports.massRound = function massRound(m) {
  return Math.round(m * 1000) / 1000;
};

/*
 var DemoVisitor = {
 entityPre: 0,
 entityPost: 0,
 operation: 0,
 agentPre: 0,
 agentPost: 0,
 nodePre: 0,
 nodePost: 0,
 bond: 0,
 bracketBegin: 0,
 bracketEnd: 0,
 mul: 0,
 mulEnd: 0,
 itemPre: 0,
 itemPost: 0,
 atom: 0,
 custom: 0,
 radical: 0,
 comm: 0
 }
 */

///////////////////////////////////////////////////////////////////////////////
/**
 * Periodic table. It is filled in automatically. Sample element description:
 * H: { n:1, id:'H', M:1.008}
 * @type {Object<string,ChemAtom>}
 */
var MenTbl = exports.MenTbl = {};

/**
 * Array of chemical elements. Index = atomic number-1
 * 0: H,  1: He,  2: Li,  3: Be...
 * @type {ChemAtom[]}
 */
var MenTblArray = exports.MenTblArray = [];

!function () {

  var MenDef = ['H,1.008', 'He,4.003', 'Li,6.941', 'Be,9.0122', 'B,10.811', 'C,12.011', 'N,14.007', 'O,15.999', 'F,18.998', 'Ne,20.179', 'Na,22.99', 'Mg,24.312', 'Al,26.092', 'Si,28.086', 'P,30.974', 'S,32.064', 'Cl,35.453', 'Ar,39.948', 'K,39.102', 'Ca,40.08', 'Sc,44.956', 'Ti,47.956', 'V,50.941', 'Cr,51.996', 'Mn,54.938', 'Fe,55.849', 'Co,58.933', 'Ni,58.7', 'Cu,63.546', 'Zn,65.37', 'Ga,69.72', 'Ge,72.59', 'As,74.922', 'Se,78.96', 'Br,79.904', 'Kr,83.8', 'Rb,85.468', 'Sr,87.62', 'Y,88.906', 'Zr,91.22', 'Nb,92.906', 'Mo,95.94', 'Tc,99', 'Ru,101.07', 'Rh,102.906', 'Pd,106.4', 'Ag,107.868', 'Cd,112.41', 'In,114.82', 'Sn,118.69', 'Sb,121.75', 'Te,127.6', 'I,126.905', 'Xe,131.3', 'Cs,132.905', 'Ba,137.34', 'La,138.906', 'Ce,140.115', 'Pr,140.908', 'Nd,144.24', 'Pm,145', 'Sm,150.4', 'Eu,151.96', 'Gd,157.25', 'Tb,158.926', 'Dy,162.5', 'Ho,164.93', 'Er,167.26', 'Tm,168.934', 'Yb,173.04', 'Lu,174.97', 'Hf,178.49', 'Ta,180.948', 'W,183.85', 'Re,186.207', 'Os,190.2', 'Ir,192.22', 'Pt,195.09', 'Au,196.967', 'Hg,200.59', 'Tl,204.37', 'Pb,207.19', 'Bi,208.98', 'Po,210', 'At,210', 'Rn,222', 'Fr,223', 'Ra,226', 'Ac,227', 'Th,232.038', 'Pa,231', 'U,238.29', 'Np,237', 'Pu,244', 'Am,243', 'Cm,247', 'Bk,247', 'Cf,251', 'Es,254', 'Fm,257', 'Md,258', 'No,259', 'Lr,260', 'Rf,261', 'Db,262', 'Sg,271', 'Bh,267', 'Hs,269', 'Mt,276', 'Ds,281', 'Rg,280', 'Cn,285'];
  MenDef.forEach(function (descr, i) {
    var L = descr.split(',');
    var atom = new _ChemAtom2.default(i + 1, L[0], +L[1]);
    MenTblArray[i] = MenTbl[L[0]] = atom;
  });
}();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Subordinate object for the node element
 * Created by PeterWin on 28.04.2017.
 */

var ChemSubObj = function ChemSubObj() {
  _classCallCheck(this, ChemSubObj);
};

exports.default = ChemSubObj;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chemical element or Atom
 * Created by PeterWin on 28.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemSubObj2 = __webpack_require__(3);

var _ChemSubObj3 = _interopRequireDefault(_ChemSubObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemAtom = function (_ChemSubObj) {
	_inherits(ChemAtom, _ChemSubObj);

	/**
  * @constructor
  * @param {int} atomicNumber
  * @param {string} id
  * @param {number} mass
  */
	function ChemAtom(atomicNumber, id, mass) {
		_classCallCheck(this, ChemAtom);

		var _this = _possibleConstructorReturn(this, (ChemAtom.__proto__ || Object.getPrototypeOf(ChemAtom)).call(this));

		_this.n = atomicNumber; // Atomic number
		_this.id = id; // Symbol of a chemical element: H, He, Li, Be...
		_this.M = mass; // Atomic mass in Daltons
		return _this;
	}

	/**
  * Call 'atom' method of visitor
  * @param {Object} visitor
  */


	_createClass(ChemAtom, [{
		key: "walk",
		value: function walk(visitor) {
			if (visitor.atom) return visitor.atom(this);
		}
	}]);

	return ChemAtom;
}(_ChemSubObj3.default);

exports.default = ChemAtom;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = TextMaker;

var _ChemSys = __webpack_require__(0);

var _ChemSys2 = _interopRequireDefault(_ChemSys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TextMaker(rules) {
	rules = rules || _ChemSys2.default.rulesHtml;
	if (rules === 'text') rules = _ChemSys2.default.rulesText;else if (rules === 'BB' || rules === 'bb') rules = _ChemSys2.default.rulesBB;

	var me = this,
	    stack = [{ tx: '' }],
	    nextNodeNeg = 0,
	    atomColor = 0,
	    bFirst = 1;

	me.res = function () {
		return stack[0].tx;
	};

	function useRule(key, value) {
		if (!(key in rules)) return value;
		return rules[key].replace(/\*/g, value);
	}
	function ctxOut(s) {
		stack[0].tx += s;
	}
	function space() {
		if (bFirst) bFirst = 0;else ctxOut(' ');
	}

	function ctxOutRule(rule, text) {
		ctxOut(useRule(rule, text));
	}
	function setNeg() {
		stack[0].neg = 1;
	}
	function pushCell() {
		stack.unshift({ tx: '' });
	}
	function popCell() {
		var cell = stack.shift();
		if (cell.neg) {
			stack[0].tx = cell.tx + stack[0].tx;
		} else {
			stack[0].tx += cell.tx;
		}
	}

	me.atom = function (obj) {
		if (atomColor) ctxOutRule('ColorPre', atomColor);
		ctxOut(useRule('Atom', obj.id));
		if (atomColor) ctxOutRule('ColorPost', atomColor);
	};
	me.custom = function (obj) {
		ctxOutRule('Custom', obj.tx);
	};
	me.comm = function (obj) {
		ctxOutRule('Comment', obj.tx);
	};
	me.radical = function (obj) {
		ctxOutRule('Radical', obj.label);
	};

	me.itemPre = function (obj) {
		if (obj.color) ctxOutRule('ColorPre', obj.color);
		if (obj.atomNum) {
			// Вывести двухэтажную конструкцию: масса/атомный номер слева от элемента
			var s = useRule('MassAndNum', obj.obj.n || '').replace('@', obj.M || '');
			ctxOut(s);
		} else if (obj.M) {
			ctxOutRule('ItemMass', obj.M);
		}
		atomColor = obj.atomColor;
	};
	me.itemPost = function (obj) {
		if (obj.charge) {
			ctxOutRule('ItemCharge', obj.charge.tx);
		}
		atomColor = 0;
		if (obj.n !== 1) {
			ctxOutRule('ItemCnt', obj.n);
		}
		if (obj.color) ctxOutRule('ColorPost', obj.color);
	};
	me.bond = function (obj) {
		pushCell();
		if (obj.color) ctxOutRule('ColorPre', obj.color);
		var text = obj.tx;
		if (!obj.N) text = rules.$InvisibleBond || ' '; // Empty bond
		ctxOut(text);
		if (obj.pt.x < 0) {
			setNeg();
			nextNodeNeg = 1;
		}
		if (obj.color) ctxOutRule('ColorPost', obj.color);
		popCell();
	};

	function drawCharge(obj, bLeft) {
		var charge = obj.charge;
		if (charge) {
			if (!(bLeft ^ charge.bLeft)) {
				ctxOutRule('NodeCharge', charge.tx);
			}
		}
	}

	me.bracketBegin = function (obj) {
		drawCharge(obj.end, 1);
		ctxOut(obj.tx);
	};
	me.bracketEnd = function (obj) {
		ctxOut(obj.tx);
		if (obj.n !== 1) {
			ctxOutRule('ItemCnt', obj.n);
		}
		drawCharge(obj);
	};
	me.mul = function (obj) {
		ctxOutRule('Mul', rules.$MulChar || '*');
		if (obj.n !== 1) ctxOutRule('MultiK', obj.n);
	};

	me.nodePre = function (obj) {
		drawCharge(obj, 1);
		pushCell();
	};
	me.nodePost = function (obj) {
		if (nextNodeNeg) {
			setNeg();
			nextNodeNeg = 0;
		}
		popCell();
		drawCharge(obj);
	};
	me.agentPre = function (obj) {
		space();
		if (obj.n !== 1) ctxOutRule('AgentK', obj.n);
	};

	me.operation = function (obj) {
		space();
		var comm = obj.commentPre,
		    tmp = '';
		if (comm) tmp = useRule('OpComment', comm.tx);
		tmp += obj.dstText;
		comm = obj.commentPost;
		if (comm) tmp += useRule('OpComment', comm.tx);
		ctxOutRule('Operation', tmp);
	};
	me.entityPre = function () {
		pushCell();
	};
	me.entityPost = function () {
		popCell();
	};
} /**
   * Created by PeterWin on 06.05.2017.
   */

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Multilanguage support
 * Created by PeterWin on 27.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Lang = {
	/**
  * Current language
  * Examples: en, ru - internal languages; zh, zh-TW - external (by addDict)
  * @var {string}
  */
	curLang: 'en',

	/**
  * Browser language
  * @var {string}
  */
	navLang: 'en',

	/**
  * Translate phrase
  * @param {string} key
  * @param {Object=} params
  * @param {string=} lang
  * @returns {string}
  */
	tr: function tr(key, params, lang) {
		var i = void 0,
		    k = void 0,
		    me = this;
		lang = (lang || me.curLang).toLowerCase();

		// find dictionary
		var curDict = me.Dict[lang];
		if (!curDict && (k = lang.indexOf('-')) > 0) {
			curDict = me.Dict[lang.slice(0, k)];
		}
		curDict = curDict || me.Dict.en;
		// find phrase
		var phrase = curDict[key];
		if (phrase === undefined) phrase = key;
		// parameters
		if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === 'object') for (i in params) {
			phrase = phrase.replace(new RegExp('\\[' + i + '\\]', 'g'), params[i]);
		}return phrase;
	},

	/**
  * Add phrases to dictionary
  * @param {Object<string,Object>} struc	 { locale1: { key1: val1, key2:val2}, locale2: {...} }
  */
	addDict: function addDict(struc) {
		var loc = void 0,
		    srcPart = void 0,
		    dstPart = void 0,
		    key = void 0;
		for (loc in struc) {
			srcPart = struc[loc];
			dstPart = this.Dict[loc];
			if (!dstPart) {
				// The simplest case - just insert src -> dst
				this.Dict[loc] = srcPart;
			} else {
				// Adding keys to an existing partition
				for (key in srcPart) {
					dstPart[key] = srcPart[key];
				}
			}
		}
	},

	/**
  * Set current language
  * Called automatically when the library is loaded
  * @param {Object|string} config	Can be window.navigator object OR locale string. for ex: "zh-tw"
  */
	init: function init(config) {
		if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
			// Chrome, FF, Opera - navigator.language
			// IE - navigator.browserLanguage and .userLanguage
			Lang.navLang = config.language || config.browserLanguage || config.userLanguage || Lang.navLang;
			Lang.curLang = Lang.navLang;
		} else if (typeof config === 'string') {
			Lang.curLang = config;
		}
	}
};

// Auto detect browser language
Lang.init(window.navigator);

Lang.Dict = {
	ru: {
		$Native: 'Русский', $English: 'Russian',
		// Ошибки
		'Internal error: [msg]': 'Внутренняя ошибка: [msg]',
		'Browser does not support canvas-graphics': 'Браузер не поддерживает canvas-графику',
		'Formula can not be displayed as text': 'Формулу нельзя отобразить в текстовом виде',
		"Expected '(' after [S]": " Требуется '(' после [S]",
		"Unexpected '[C]'": "Неверный символ '[C]' в позиции [pos]",
		"Expected '[ok]' instead of '[bad]'": "Требуется '[ok]' вместо '[bad]' в позиции [pos]",
		"Invalid character '[C]'": "Недопустимый символ '[C]' в позиции [pos]",
		'Russian element character': // param: C
		"Недопустимый русский символ '[C]'. Для описания химического элемента должны использоваться только латинские символы.",
		'Non-latin element character': // param: C
		"Недопустимый символ '[C]'. Для описания химического элемента должны использоваться только латинские символы.",
		"Unknown element character '[C]'": "Недопустимый символ '[C]' описания реагента в позиции [pos]",
		"Expected '[C]'": "Требуется '[C]' в позиции [pos]",
		"Unknown element '[Elem]'": "Ошибочный элемент '[Elem]' в позиции [pos]",
		'Comment is not closed': 'Не закрыт комментарий, начатый в позиции [pos]',
		'Abstract koefficient is not closed': 'Не закрыт абстрактный коэффициент, начатый в позиции [pos]',
		'Abstract element is not closed': 'Не закрыт абстрактный элемент, начатый в позиции [pos]',
		'Expected node declaration before charge': 'Неизвестно, к чему нужно применить заряд в позиции [pos]',
		'Invalid charge declaration': 'Ошибка в описании заряда в позиции [pos]',
		'It is necessary to close the bracket': 'Необходимо закрыть скобку, открытую в позиции [pos]',
		'Undefined variable [name]': "Не определена числовая переменная '[name]' в позиции [pos]",
		"Invalid node reference '[ref]'": "Неправильная ссылка на узел '[ref]' в позиции [pos]",
		'Invalid branch close': 'Нельзя закрыть ветку в позиции [pos], которая не открыта',
		'Cant close branch before bracket': 'Нельзя закрыть ветку в позиции [pos], пока не закрыта скобка в позиции [pos0]',
		'Invalid bracket close': 'Нет пары для скобки, закрытой в позиции [pos]',
		'It is necessary to close the branch': 'Необходимо закрыть ветку, открытую в позиции [pos]',
		'Expected [must] instead of [have]': 'Требуется [must] вместо [have] в позиции [pos]',
		'Invalid middle point': 'Не используется промежуточная точка',
		'Cant create ring': 'Невозможно создать кольцо',
		'Cant close ring': 'Невозможно замкнуть кольцо',
		'Invalid version': 'Для формулы требуется CharChem версии [need] вместо [cur]',

		'(s)': '(тв)', '(l)': '(ж)', '(g)': '(г)', '(aq)': '(р-р)',
		'Periodic Table': 'Периодическая система химических элементов',
		'Table legend': 'Группы химических элементов',
		Group: 'Группа',
		Period: 'Период',
		Row: 'Ряд',
		'[x]-block': '[x]-блок',
		Lanthanides: 'Лантаноиды',
		Actinides: 'Актиноиды',
		'Alkali metals': 'Щелочные металлы',
		'Alkaline earth metals': 'Щёлочноземельные металлы',
		'Transition metals': 'Переходные металлы',
		'Post transition metals': 'Постпереходные металлы',
		Metalloids: 'Полуметаллы',
		'Other nonmetals': 'Неметаллы',
		Halogens: 'Галогены',
		'Noble gases': 'Инертные газы',
		'Unknown props': 'Св-ва неизвестны',
		H: 'Водород', He: 'Гелий', Li: 'Литий', Be: 'Бериллий', B: 'Бор', C: 'Углерод',
		N: 'Азот', O: 'Кислород', F: 'Фтор', Ne: 'Неон', Na: 'Натрий', Mg: 'Магний',
		Al: 'Алюминий', Si: 'Кремний', P: 'Фосфор', S: 'Сера', Cl: 'Хлор', Ar: 'Аргон',
		K: 'Калий', Ca: 'Кальций', Sc: 'Скандий', Ti: 'Титан', V: 'Ванадий', Cr: 'Хром',
		Mn: 'Марганец', Fe: 'Железо', Co: 'Кобальт', Ni: 'Никель', Cu: 'Медь', Zn: 'Цинк',
		Ga: 'Галлий', Ge: 'Германий', As: 'Мышьяк', Se: 'Селен', Br: 'Бром', Kr: 'Криптон',
		Rb: 'Рубидий', Sr: 'Стронций', Y: 'Иттрий', Zr: 'Цирконий', Nb: 'Ниобий', Mo: 'Молибден',
		Tc: 'Технеций', Ru: 'Рутений', Rh: 'Родий', Pd: 'Палладий', Ag: 'Серебро', Cd: 'Кадмий',
		In: 'Индий', Sn: 'Олово', Sb: 'Сурьма', Te: 'Теллур', I: 'Йод', Xe: 'Ксенон',
		Cs: 'Цезий', Ba: 'Барий', La: 'Лантан', Ce: 'Церий', Pr: 'Празеодим', Nd: 'Неодим',
		Pm: 'Прометий', Sm: 'Самарий', Eu: 'Европий', Gd: 'Гадолиний', Tb: 'Тербий',
		Dy: 'Диспрозий', Ho: 'Гольмий', Er: 'Эрбий', Tm: 'Тулий', Yb: 'Иттербий', Lu: 'Лютеций',
		Hf: 'Гафний', Ta: 'Тантал', W: 'Вольфрам', Re: 'Рений', Os: 'Осмий', Ir: 'Иридий',
		Pt: 'Платина', Au: 'Золото', Hg: 'Ртуть', Tl: 'Таллий', Pb: 'Свинец', Bi: 'Висмут',
		Po: 'Полоний', At: 'Астат', Rn: 'Радон', Fr: 'Франций', Ra: 'Радий', Ac: 'Актиний',
		Th: 'Торий', Pa: 'Протактиний', U: 'Уран', Np: 'Нептуний', Pu: 'Плутоний', Am: 'Америций',
		Cm: 'Кюрий', Bk: 'Берклий', Cf: 'Калифорний', Es: 'Эйнштейний', Fm: 'Фермий',
		Md: 'Менделеевий', No: 'Нобелий', Lr: 'Лоуренсий', Rf: 'Резерфордий', Db: 'Дубний',
		Sg: 'Сиборгий', Bh: 'Борий', Hs: 'Хассий', Mt: 'Мейтнерий', Ds: 'Дармштадтий',
		Rg: 'Рентгений', Cn: 'Коперниций'
	},
	en: {
		'Invalid version': 'Formula requires CharChem version [need] instead of [cur]',
		$Native: 'English', $English: 'English',
		'Table legend': 'Chemical element groups',
		H: 'Hydrogen', He: 'Helium', Li: 'Lithium', Be: 'Beryllium', B: 'Boron', C: 'Carbon',
		N: 'Nitrogen', O: 'Oxygen', F: 'Fluorine', Ne: 'Neon', Na: 'Sodium', Mg: 'Magnesium',
		Al: 'Aluminium', Si: 'Silicon', P: 'Phosphorus', S: 'Sulfur', Cl: 'Chlorine', Ar: 'Argon',
		K: 'Potassium', Ca: 'Calcium', Sc: 'Scandium', Ti: 'Titanium', V: 'Vanadium', Cr: 'Chromium',
		Mn: 'Manganese', Fe: 'Iron', Co: 'Cobalt', Ni: 'Nickel', Cu: 'Copper', Zn: 'Zinc',
		Ga: 'Gallium', Ge: 'Germanium', As: 'Arsenic', Se: 'Selenium', Br: 'Bromine', Kr: 'Krypton',
		Rb: 'Rubidium', Sr: 'Strontium', Y: 'Yttrium', Zr: 'Zirconium', Nb: 'Niobium', Mo: 'Molybdenum',
		Tc: 'Technetium', Ru: 'Ruthenium', Rh: 'Rhodium', Pd: 'Palladium', Ag: 'Silver', Cd: 'Cadmium',
		In: 'Indium', Sn: 'Tin', Sb: 'Antimony', Te: 'Tellurium', I: 'Iodine', Xe: 'Xenon',
		Cs: 'Caesium', Ba: 'Barium', La: 'Lanthanum', Ce: 'Cerium', Pr: 'Praseodymium', Nd: 'Neodymium',
		Pm: 'Promethium', Sm: 'Samarium', Eu: 'Europium', Gd: 'Gadolinium', Tb: 'Terbium',
		Dy: 'Dysprosium', Ho: 'Holmium', Er: 'Erbium', Tm: 'Thulium', Yb: 'Ytterbium', Lu: 'Lutetium',
		Hf: 'Hafnium', Ta: 'Tantalum', W: 'Tungsten', Re: 'Rhenium', Os: 'Osmium', Ir: 'Iridium',
		Pt: 'Platinum', Au: 'Gold', Hg: 'Mercury', Tl: 'Thallium', Pb: 'Lead', Bi: 'Bismuth',
		Po: 'Polonium', At: 'Astatine', Rn: 'Radon', Fr: 'Francium', Ra: 'Radium', Ac: 'Actinium',
		Th: 'Thorium', Pa: 'Protactinium', U: 'Uranium', Np: 'Neptunium', Pu: 'Plutonium', Am: 'Americium',
		Cm: 'Curium', Bk: 'Berkelium', Cf: 'Californium', Es: 'Einsteinium', Fm: 'Fermium',
		Md: 'Mendelevium', No: 'Nobelium', Lr: 'Lawrencium', Rf: 'Rutherfordium', Db: 'Dubnium',
		Sg: 'Seaborgium', Bh: 'Bohrium', Hs: 'Hassium', Mt: 'Meitnerium', Ds: 'Darmstadtium',
		Rg: 'Roentgenium', Cn: 'Copernicium'
	}
};

exports.default = Lang;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 27.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Lang = __webpack_require__(6);

var _Lang2 = _interopRequireDefault(_Lang);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// extends Error
function ChemError(msgId, params) {
	var _this = this;

	/**
  * Get localized message.
  * Language of message init by Lang.locale
  * @const
  * @returns {string}
  */
	this.getMessage = function () {
		return _Lang2.default.tr(_this.msgId, _this.params);
	};

	this.msgId = msgId;
	this.params = params;
	this.message = this.getMessage();
}
ChemError.prototype = new Error();

exports.default = ChemError;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Elements list
 * Each element is record {id, elem, n}
 * For abstract  elem is null
 * Created by PeterWin on 29.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ElemRec = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemSys = __webpack_require__(0);

var _ChemSys2 = _interopRequireDefault(_ChemSys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ElemRec = exports.ElemRec = function () {

	/**
  * @constructor
  * @param {string|ChemAtom|ElemRec|{id,elem,n}} src
  * @param {number} koeff
  */
	function ElemRec(src) {
		var koeff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

		_classCallCheck(this, ElemRec);

		var rec = this;
		rec.n = koeff;

		if (typeof src === 'string') {
			// Строковое описание элемента
			rec.id = src;
			rec.elem = _ChemSys2.default.findElem(src);
		} else if (src.M) {
			// ChemAtom
			rec.elem = src;
			rec.id = src.id;
		} else {
			// Другой ElemRec
			rec.elem = src.elem;
			rec.id = src.id;
			rec.n *= src.n;
		}
	}

	/**
  * For abstract elems: {R}, for else: H, He
  * @returns {string}
  */


	_createClass(ElemRec, [{
		key: 'key',
		get: function get() {
			return this.elem ? this.id : '{' + this.id + '}';
		}
	}]);

	return ElemRec;
}();

var ElemList = function (_Array) {
	_inherits(ElemList, _Array);

	function ElemList() {
		_classCallCheck(this, ElemList);

		var _this = _possibleConstructorReturn(this, (ElemList.__proto__ || Object.getPrototypeOf(ElemList)).call(this));

		var list = _this;
		list.charge = 0;

		// it's look like a bug in Babel: prototype functions are invisible

		/**
   * Find element
   * @param {string|ChemAtom} elem	Examples: 'He', 'Li', MenTbl.Be
   * @returns {number}
   */
		list.findElem = function (elem) {
			if (typeof elem === 'string') {
				elem = _ChemSys2.default.findElem(elem);
			}
			var i = 0,
			    n = list.length;
			for (; i < n; i++) {
				if (list[i].elem === elem) return i;
			}
			return -1;
		};

		/**
   * Find custom element
   * @param {string} id
   * @returns {int}
   */
		list.findCustom = function (id) {
			var i = 0,
			    n = list.length,
			    rec = void 0;
			for (; i < n; i++) {
				rec = list[i];
				if (!rec.elem && rec.id === id) return i;
			}
			return -1;
		};

		/**
   * Find element by key: 'H' or '{R}'
   * @param {string} key
   * @returns {int}
   */
		list.findKey = function (key) {
			var j = 0,
			    n = list.length,
			    rec = void 0;
			for (; j < n; j++) {
				rec = list[j];
				if (rec.key === key) return j;
			}
			return -1;
		};

		/**
   * Find ElemRec
   * @param {ElemRec} rec
   * @returns {int}
   */
		list.findRec = function (rec) {
			if (rec.elem) {
				return list.findElem(rec.elem);
			} else {
				return list.findCustom(rec.id);
			}
		};

		/**
   * Add element record
   * Attantion! Don't add one instance of record in different lists!
   * Use addElem to safe add operation
   * @param {ElemRec} rec
   */
		list.addElemRec = function (rec) {
			var k = list.findRec(rec);
			if (k < 0) {
				list.push(rec);
			} else {
				list[k].n += rec.n;
			}
		};

		/**
   * Add element
   * @param {string|ChemAtom|ElemRec} elem
   * @param {number=1} n	koefficient
   */
		list.addElem = function (elem, n) {
			return list.addElemRec(new ElemRec(elem, n));
		};

		/**
   * Add abstract element.
   * @param {string} text	Without { and }
   * @param {number=1} n
   */
		list.addCustom = function (text) {
			var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
			return list.addElemRec(new ElemRec({ id: text, elem: null, n: n }));
		};

		/**
   * Add another elements list
   * @param {ElemList} srcList	source list will not change
   */
		list.addList = function (srcList) {
			srcList.forEach(function (rec) {
				return list.addElemRec(new ElemRec(rec));
			});
			list.charge += srcList.charge;
		};

		/**
   * add chemical radical
   * @param {ChemRadical} radical
   */
		list.addRadical = function (radical) {
			list.addList(radical.items);
		};

		/**
   * Scale all items by coefficient
   * @param {number} k
   */
		list.scale = function (k) {
			if (k !== 1) {
				list.forEach(function (item) {
					return item.n *= k;
				});
				list.charge *= k;
			}
		};

		list.toString = function () {
			var result = list.reduce(function (acc, item) {
				return acc + item.key + (item.n === 1 ? '' : item.n);
			}, '');
			if (list.charge) {
				result += '^';
				var ach = Math.abs(list.charge);
				if (ach !== 1) result += ach;
				result += list.charge < 0 ? '-' : '+';
			}
			return result;
		};

		// sort by Hill system
		list.sortByHill = function () {
			var cmp = function cmp(a, b) {
				return a < b ? -1 : a > b ? 1 : 0;
			};

			list.sort(function (a, b) {
				var aid = a.id,
				    bid = b.id;
				if (!a.elem && !b.elem) return cmp(aid, bid);
				if (!a.elem) return 1;
				if (!b.elem) return -1;
				if (aid === bid) return 0;
				if (aid === 'C') return -1;
				if (bid === 'C') return 1;
				if (aid === 'H') return -1;
				if (bid === 'H') return 1;
				return cmp(aid, bid);
			});
		};

		return _this;
	}

	return ElemList;
}(Array);

exports.default = ElemList;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * 2D Point (or vector) object
 * Created by PeterWin on 26.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Point = function () {

	/**
  * Constructor of 2D point
  * @param {number=} x	X coordinate
  * @param {number=} y	Y coordinate
  */
	function Point(x, y) {
		_classCallCheck(this, Point);

		if (x === undefined) {
			this.x = this.y = 0;
		} else {
			this.x = x;
			// if y is undefined, then assumed Point(11) -> {x:11, y:11}
			this.y = y === undefined ? x : y;
		}
	}

	/**
  * Comparison with zero, given errors of less than one thousandth
  * @param {number} value
  * @returns {boolean}
  */


	_createClass(Point, [{
		key: 'init',


		/**
   * Reusing a point instance with new values
   * @param {number} x
   * @param {number} y
   */
		value: function init(x, y) {
			this.x = x;
			this.y = y;
		}

		/**
   * Copying a point from another object
   * @param {Point} pt
   */

	}, {
		key: 'from',
		value: function from(pt) {
			this.x = pt.x;
			this.y = pt.y;
		}

		/**
   * Point cloning
   * @const
   * @returns {Point}
   */

	}, {
		key: 'clone',
		value: function clone() {
			return new Point(this.x, this.y);
		}

		/**
   * Comparison of two points
   * @const
   * @param {Point} pt
   * @returns {boolean}
   */

	}, {
		key: 'eq',
		value: function eq(pt) {
			return Point.is0(this.x - pt.x) && Point.is0(this.y - pt.y);
		}

		//=================== addition

		/**
   * Point operator += (x, y)
   * add internal numbers
   * @param x
   * @param y
   * @returns {Point}
   */

	}, {
		key: 'addin',
		value: function addin(x, y) {
			this.x += x;
			this.y += y;
			return this;
		}

		/**
   * Point operator += (Point)
   * add internal (Point)
   * @param {Point} pt
   * @returns {Point}
   */

	}, {
		key: 'addi',
		value: function addi(pt) {
			this.x += pt.x;
			this.y += pt.y;
			return this;
		}

		/**
   * Point operator + (x, y)
   * add external numbers
   * @const
   * @param {number} x
   * @param {number} y
   */

	}, {
		key: 'addxn',
		value: function addxn(x, y) {
			return new Point(this.x + x, this.y + y);
		}

		/**
   * Point operator + (Point)
   * add external (Point)
   * @const
   * @param pt
   * @returns {Point}
   */

	}, {
		key: 'addx',
		value: function addx(pt) {
			return new Point(this.x + pt.x, this.y + pt.y);
		}

		// ================== subtraction

		/**
   * Point operator -= (x, y)
   * subtraction internal numbers
   * @param {number} x
   * @param {number} y
   * @returns {Point}
   */

	}, {
		key: 'subin',
		value: function subin(x, y) {
			this.x -= x;
			this.y -= y;
			return this;
		}

		/**
   * Point operator - (Point)
   * subtraction internal (Point)
   * @param {Point} pt
   * @returns {Point}
   */

	}, {
		key: 'subi',
		value: function subi(pt) {
			this.x -= pt.x;
			this.y -= pt.y;
			return this;
		}

		/**
   * Point operator - (x, y)
   * @const
   * @param {number} x
   * @param {number} y
   * @returns {Point}
   */

	}, {
		key: 'subxn',
		value: function subxn(x, y) {
			return new Point(this.x - x, this.y - y);
		}

		/**
   * Point operator - (Point)
   * sub external (Point)
   * @const
   * @param {Point} pt
   * @returns {Point}
   */

	}, {
		key: 'subx',
		value: function subx(pt) {
			return new Point(this.x - pt.x, this.y - pt.y);
		}

		/**
   * min internal numbers
   * @param {number} x
   * @param {number} y
   * @returns {Point}
   */

	}, {
		key: 'minin',
		value: function minin(x, y) {
			this.x = Math.min(this.x, x);
			this.y = Math.min(this.y, y);
			return this;
		}

		/**
   * min internal (Point)
   * @param {Point} pt
   * @returns {Point}
   */

	}, {
		key: 'mini',
		value: function mini(pt) {
			return this.minin(pt.x, pt.y);
		}

		/**
   * max internal numbers
   * @param {number} x
   * @param {number} y
   * @return {Point}
   */

	}, {
		key: 'maxin',
		value: function maxin(x, y) {
			this.x = Math.max(this.x, x);
			this.y = Math.max(this.y, y);
			return this;
		}

		/**
   * max internal (Point)
   * @param {Point} pt
   * @return {Point}
   */

	}, {
		key: 'maxi',
		value: function maxi(pt) {
			return this.maxin(pt.x, pt.y);
		}

		/**
   * negative internal: pt = -pt
   * @returns {Point}
   */

	}, {
		key: 'negi',
		value: function negi() {
			this.x = -this.x;
			this.y = -this.y;
			return this;
		}

		/**
   * negative external
   * Point operator - () const
   * @const
   * @returns {Point}
   */

	}, {
		key: 'negx',
		value: function negx() {
			return new Point(-this.x, -this.y);
		}

		/**
   * internal multiply by koefficient
   * Point operator *= (number)
   * @param {number} k
   * @returns {Point}
   */

	}, {
		key: 'muli',
		value: function muli(k) {
			this.x *= k;
			this.y *= k;
			return this;
		}

		/**
   * external multiply by koefficient
   * Point operator * (number) const
   * @const
   * @param k
   * @returns {Point}
   */

	}, {
		key: 'mulx',
		value: function mulx(k) {
			return new Point(this.x * k, this.y * k);
		}

		/**
   * square of length
   * @const
   * @returns {number}
   */

	}, {
		key: 'lengthSqr',
		value: function lengthSqr() {
			return this.x * this.x + this.y * this.y;
		}

		/**
   * Length
   * @const
   * @returns {number}
   */

	}, {
		key: 'length',
		value: function length() {
			return Math.sqrt(this.lengthSqr());
		}

		/**
   * Square of distance to point, defined by numbers
   * @const
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */

	}, {
		key: 'distSqrn',
		value: function distSqrn(x, y) {
			var dx = this.x - x,
			    dy = this.y - y;
			return dx * dx + dy * dy;
		}

		/**
   * Square of distance to point
   * @const
   * @param {Point} pt
   * @returns {number}
   */

	}, {
		key: 'distSqr',
		value: function distSqr(pt) {
			return this.distSqrn(pt.x, pt.y);
		}

		/**
   * Distance to point
   * @const
   * @param pt
   * @returns {number}
   */

	}, {
		key: 'dist',
		value: function dist(pt) {
			return Math.sqrt(this.distSqr(pt));
		}

		/**
   * Make unit vector from angle (in radians)
   * @param {number} radAngle		angle in radians, for ex: Math.PI/2
   * @returns {Point}
   */

	}, {
		key: 'fromRad',
		value: function fromRad(radAngle) {
			this.x = Math.cos(radAngle);
			this.y = Math.sin(radAngle);
			return this;
		}

		/**
   * Make unit vector from angle (in degrees)
   * @param {number} degAngle
   * @returns {Point}
   */

	}, {
		key: 'fromDeg',
		value: function fromDeg(degAngle) {
			return this.fromRad(Math.PI * degAngle / 180);
		}

		/**
   * Transpose internal
   * @returns {Point}
   */

	}, {
		key: 'transponi',
		value: function transponi() {
			var tmp = this.x;
			this.x = this.y;
			this.y = tmp;
			return this;
		}

		/**
   * Transpose external
   * @const
   * @returns {Point}
   */

	}, {
		key: 'transponx',
		value: function transponx() {
			return new Point(this.y, this.x);
		}

		/**
   * Rounding and casting to string
   * @param {number} value
   * @returns {string}
   */

	}, {
		key: 'toString',


		/**
   * Make string from point
   * @const
   * @returns {string}
   */
		value: function toString() {
			return '{' + Point.toa(this.x) + ', ' + Point.toa(this.y) + '}';
		}

		/**
   * Calculate the angle from vector
   *  *----> X
   *  | *
   *  |   *
   *  v     *
   *  Y
   *  (10,10) -> Pi/4 (45º); (10, -10) -> -Pi/4 (-45º)
   * @const
   * @returns {number} angle in radians, in range from -Pi to Pi
   */

	}, {
		key: 'polarAngle',
		value: function polarAngle() {
			if (this.x === 0) {
				if (this.y === 0) {
					return 0;
				}
				return this.y > 0 ? Math.PI / 2 : -Math.PI / 2;
			}
			return Math.atan2(this.y, this.x);
		}
	}], [{
		key: 'is0',
		value: function is0(value) {
			return Math.abs(value) < 0.001;
		}
	}, {
		key: 'toa',
		value: function toa(value) {
			return (Math.round(value * 1000) / 1000).toString();
		}
	}]);

	return Point;
}();

exports.default = Point;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by PeterWin on 06.05.2017.
 */

// visitor Для определения невозможности вывода выражения (или его части) в виде текста
// example: if (expr.walk(new IsNonText())) alert('This is not textual expression');
var IsNonText = function () {
	function IsNonText() {
		_classCallCheck(this, IsNonText);

		this.ok = false;
	}

	_createClass(IsNonText, [{
		key: "bond",
		value: function bond(obj) {
			// Большинство связей не является текстовыми
			return this.ok = obj.bText ^ 1;
		}
	}]);

	return IsNonText;
}();

exports.default = IsNonText;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * The module for compiling the source code of an expression.
 * The result is always ChemExpr, which can contain a description of the error
 * Created by PeterWin on 28.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.chemCompiler = chemCompiler;

var _chainSys = __webpack_require__(16);

var _chainSys2 = _interopRequireDefault(_chainSys);

var _ChemAgent = __webpack_require__(19);

var _ChemAgent2 = _interopRequireDefault(_ChemAgent);

var _ChemBond = __webpack_require__(20);

var _ChemBond2 = _interopRequireDefault(_ChemBond);

var _ChemBr = __webpack_require__(21);

var _ChemComment = __webpack_require__(23);

var _ChemComment2 = _interopRequireDefault(_ChemComment);

var _ChemCharge = __webpack_require__(22);

var _ChemCharge2 = _interopRequireDefault(_ChemCharge);

var _ChemCustom = __webpack_require__(24);

var _ChemCustom2 = _interopRequireDefault(_ChemCustom);

var _ChemError = __webpack_require__(7);

var _ChemError2 = _interopRequireDefault(_ChemError);

var _ChemExpr = __webpack_require__(25);

var _ChemExpr2 = _interopRequireDefault(_ChemExpr);

var _ChemMul = __webpack_require__(26);

var _ChemMul2 = _interopRequireDefault(_ChemMul);

var _ChemNode = __webpack_require__(27);

var _ChemNode2 = _interopRequireDefault(_ChemNode);

var _ChemNodeItem = __webpack_require__(28);

var _ChemNodeItem2 = _interopRequireDefault(_ChemNodeItem);

var _ChemRadical = __webpack_require__(30);

var _ChemRadical2 = _interopRequireDefault(_ChemRadical);

var _ChemSys = __webpack_require__(0);

var _ChemSys2 = _interopRequireDefault(_ChemSys);

var _ChemOp = __webpack_require__(29);

var _ChemOp2 = _interopRequireDefault(_ChemOp);

var _Lang = __webpack_require__(6);

var _Lang2 = _interopRequireDefault(_Lang);

var _Point = __webpack_require__(9);

var _Point2 = _interopRequireDefault(_Point);

var _preprocess = __webpack_require__(17);

var _core = __webpack_require__(2);

var _IsNonText = __webpack_require__(10);

var _IsNonText2 = _interopRequireDefault(_IsNonText);

var _utils = __webpack_require__(18);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _notImpl(fnName) {
	throw new _ChemError2.default('Function is not implemented: ' + fnName);
}

// Replacement of special characters in the comments
var SpecChars = [[/\|\^|ArrowUp/g, '↑'], [/(\|v)|(ArrowDown)/g, '↓'], [/\^o/g, '°']];

var SpecCharsB = {
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
};

var Ops = [{ op: '+' }, { op: '-->', eq: 1, dst: '—→' }, { op: '->', eq: 1, dst: '→' }, { op: '®', eq: 1, dst: '→' }, { op: '→', eq: 1 }, { op: '=', eq: 1 }, { op: '↔', eq: 1 }, { op: '<->', eq: 1, dst: '↔' }, { op: '<=>', eq: 1, dst: '\u21CC' }, { op: '<==>', eq: 1, dst: '\u21CC' }, { op: '*', dst: '∙' }, { op: '!=', dst: '≠' }];

// Bonds description synonims
var BondsSyn = {
	'≡': '%',
	'–': '-'
};

// 0=(Multiplicity), 1=(Angle in degrees), 2=(sign of slope), 3=(soft bond flag), 4=(text)
var BondDefs = {
	'-': [1, 0, 0, 1],
	'=': [2, 0, 0, 1],
	'%': [3, 0, 0, 1, '≡'],
	'--': [1, 0, 0, 0, '-'],
	'==': [2, 0, 0, 0, '='],
	'%%': [3, 0, 0, 0, '≡'],
	'|': [1, 90, 0],
	'||': [2, 90, 0],
	'|||': [3, 90, 0],
	'/': [1, 0, -1],
	'///': [3, 0, -1],
	'//': [2, 0, -1],
	'\\': [1, 0, 1],
	'\\\\': [2, 0, 1],
	'\\\\\\': [3, 0, 1]
};

var NumConst = {
	'$32': Math.sqrt(3) / 2,
	'$3': Math.sqrt(3),
	'$3x2': Math.sqrt(3) * 2,
	'$2': Math.sqrt(2),
	'$22': Math.sqrt(2) / 2,
	'$2x2': Math.sqrt(2) * 2,
	'½': 0.5, '¼': 1 / 4, '¾': 3 / 4, '⅓': 1 / 3, '⅔': 2 / 3
};

var BondDefMap = {}; // Map 'first char'=>1 for parseNode optimization


//==========================================
//		compiler first initialization
!function () {
	// 180 -- π, grad -- rad,  rad=grad*π/180 = grad*k,  k=π/180
	var i = void 0,
	    k = Math.PI / 180;
	// convert degreese to radians
	for (i in BondDefs) {
		BondDefs[i][1] *= k;
	} // Подключить синонимы связей
	for (i in BondsSyn) {
		BondDefs[i] = BondDefs[BondsSyn[i]];
	} // Заполнить BondDefMap
	for (i in BondDefs) {
		BondDefMap[i.charAt(0)] = 1;
	}
}();

var isSpace = function isSpace(ch) {
	return ch === ' ' || ch === '\t' || ch === '\n';
};
var isDigit = function isDigit(ch) {
	return ch >= '0' && ch <= '9';
};
var isSmallAlpha = function isSmallAlpha(ch) {
	return ch >= 'a' && ch <= 'z';
};

/**
 * Don't use this function directly. True way: ChemSys.compile
 * @param {string} text
 * @returns {ChemExpr}
 */
function chemCompiler(text) {

	var result = new _ChemExpr2.default(),
	    textLen = void 0,
	    pos = 0,
	    // current position in text
	c = void 0,
	    // current character
	curState = 'begin',
	    commentPre = 0,
	    // The line of the preliminary comment
	commentPrePos = 0,
	    curEntity = void 0,
	    // Current entity (item of chemical expression)
	curPart = 0,
	    // Index of expression part. Parts are separated by operations with a eq, for ex. = or ->
	koeffPre = void 0,
	    // Prefix coefficient
	koeffPrePos = void 0,
	    // position of prefix coefficient
	itemPos0 = void 0,
	    // Position of node begin. Позиция начала элемента узла

	chainSys = void 0,
	    // Chain system for agent
	curNode = void 0,
	    // current node
	chargeOwner = void 0,
	    // Target object for ^ operation. Объект, к которому применится конструкция ^
	curNodeEnd = void 0,
	    // Position of current node end. Позиция конца текущего узла
	curBond = void 0,
	    // current bond
	prevBond = void 0,
	    // previous bond (for auto-correction)
	branchStack = void 0,
	    // branch stack
	bracketEnds = [],
	    middlePoints = [],
	    // Middle points list for curved bonds. Список промежуточных точек для изогнутых связей
	nodesBranch = [],
	    // Список линейно связанных узлов (свой для каждой ветки). Заполняется через push
	postNodeInits = [],
	    //  void(ChemNode) functions для пост-инициализации узлов

	nodesMap = void 0,
	    // named nodes for  #Name access
	bNegChar = 0,
	    // Признак изменения поведения следующей конструкции (обратный апостроф)
	curWidth = 0,
	    // Текущая толщина, нстраиваемая W+,W2,W-,D+,D-,D2

	userSlope = 0,
	    // Наклон кратких описаний связей, заданный функцией $slope
	defaultSlope = Math.PI / 6,
	    // 30° - стандартный наклон кратких описаний связей
	degToRad = Math.PI / 180,
	    st_agentMid = 'agentMid',
	    _findElem = _ChemSys2.default.findElem;

	var nextChar = function nextChar() {
		return text[pos + 1];
	};

	var error = function error(msgId, par) {
		if ('pos' in par) {
			par.pos++;
		}
		throw new _ChemError2.default(msgId, par);
	};

	var checkMiddlePoints = function checkMiddlePoints() {
		if (middlePoints.length) {
			error('Invalid middle point', middlePoints[0]);
		}
	};

	/**
  * Add command to current agent
  * @param {ChemNode|ChemBond|ChemMul|ChemMulEnd} cmd
  */
	var addCmd = function addCmd(cmd) {
		return curEntity.cmds.push(cmd);
	};

	// Check the presence of a multiplier (construction: *5H2O)
	function checkMul() {
		var mulRec = branchStack[0];
		if (mulRec && mulRec.m) {
			branchStack.shift();
			var begin = mulRec.m,
			    end = new _ChemMul.ChemMulEnd(begin);
			begin.end = end;
			addCmd(end);
		}
	}

	//==================== States control
	/**
  * set state
  * @param {string} st
  * @param {number=0} res
  * @returns {number}
  */
	var setState = function setState(st) {
		var res = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		curState = st;
		return res;
	};

	var _substr = function _substr(pos0) {
		return text.slice(pos0, pos);
	};

	var skipSpace = function skipSpace() {
		while (pos < textLen && isSpace(c = text[pos])) {
			pos++;
		}
	};

	/**
  * Retrieves a comment
  * Initially, pos must be set to the first character inside the quotes.
  * At the end it is set to the final quotation mark
  * @returns {string}
  */
	function scanComment() {
		var p0 = pos;
		while (pos < textLen && text[pos] !== '"') {
			pos++;
		}if (pos === textLen) error('Comment is not closed', { pos: p0 - 1 });
		return _substr(p0);
	}

	// Извлечь список аргументов и их позиций, начиная с текущей позиции
	function scanArgs(args, argPos) {
		var p0 = pos,
		    prev = pos,
		    ch = void 0,
		    level = 0;
		function addArg() {
			argPos.push(prev);
			args.push(_substr(prev));
			prev = pos + 1;
		}
		for (; pos < textLen; pos++) {
			ch = text[pos];
			if (ch === '(') {
				level++;
			} else if (ch === ')') {
				if (level-- === 0) break;
			} else if (ch === ',' && level === 0) {
				addArg();
			}
		}
		if (pos >= textLen) error('It is necessary to close the bracket', { pos: p0 - 1 });
		addArg();
		++pos;
	}

	// Попытка извлечь коэффициент
	// Если коэффициент распознан, возвращается число или строка(для абстрактного коэфф), pos указыв на следующий символ
	// В случае неудачи возвращает null
	function scanKoeff() {
		var pos0 = pos,
		    ch = text[pos],
		    res = null,
		    s = '',
		    r = void 0;
		if (isDigit(ch)) {
			// Число...
			while (pos < textLen) {
				s += text[pos];
				r = +s; // Недостаточно проверки isNaN, т.к. "10 " тоже успешно превращается в 10. Поэтому используем регэксп
				if (isNaN(r) || !/^[\d\.]+$/.test(s)) break;
				res = r;
				pos++;
			}
		} else if (ch === "'") {
			// Абстрактный коэфф.
			pos++;
			while (pos < textLen && text[pos] !== "'") {
				pos++;
			}if (pos === textLen) error('Abstract koefficient is not closed', { pos: pos0 });
			res = _substr(pos0 + 1);
			pos++;
		}
		if (res !== null) {
			// Предварительный комментарий не может следовать до коэффициента
			commentPre = 0;
		}
		return res;
	}

	// Извлечение заряда из текущей позиции.
	// Возвращает объект ChemCharge или 0
	function scanCharge() {
		var chargeText = '',
		    chargePrev = 0,
		    charge = void 0;
		while (pos < textLen) {
			chargeText += text[pos];
			charge = _ChemCharge2.default.create(chargeText);
			if (!charge) break;
			pos++;
			chargePrev = charge;
		}
		return chargePrev;
	}

	// Попытка извлечь из текущей позиции степень окисления
	function scanOxidation() {
		var i = pos,
		    charge = 0;
		if (text[i] === '(') {
			while (i < textLen && text[i] !== ')') {
				i++;
			}if (text[i] !== ')') error('It is necessary to close the bracket', { pos: pos });
			charge = _ChemCharge2.default.create(text.slice(pos + 1, i));
			if (charge) {
				pos = i + 1;
			}
		}
		return charge;
	}

	////////////////////////////////////////////////////
	//		Comments

	/**
  *
  * @param {string} text
  * @returns {string}
  */
	function cvtComm(text) {
		var i = void 0,
		    p = void 0,
		    res = text,
		    kb = void 0,
		    ke = void 0,
		    s = void 0,
		    a = void 0;
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = SpecChars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				p = _step.value;

				res = res.replace(p[0], p[1]);
			}
			// Замена греческих букв в квадр. скобках
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		i = 0;
		while (i < res.length) {
			kb = res.indexOf('[', i);
			if (kb < 0) break;
			ke = res.indexOf(']', kb);
			if (ke < 0) break;
			s = res.slice(kb + 1, ke);
			a = SpecCharsB[s];
			if (a) {
				// греческая буква найдена. Выполняем замену
				res = res.substr(0, kb) + a + res.substr(ke + 1);
			} else {
				// греческая буква не найдена. Оставляем скобки в тексте
				i = kb + 1;
			}
		}
		return translate(res);
	}

	/**
  *
  * @param {string} res
  * @returns {string}
  */
	function translate(res) {
		// Поиск переводимых фраз
		var t = void 0,
		    s = void 0,
		    k = void 0,
		    i = res.indexOf('`');
		while (i >= 0) {
			k = res.indexOf('`', i + 1);
			if (k < 0) break;
			s = res.slice(i + 1, k);
			t = _Lang2.default.tr(s);
			if (t === s) {
				// перевод не получился
				res = res.slice(0, i) + res.slice(i + 1);
			} else {
				// заменить перевод
				res = res.slice(0, i) + t + res.slice(k + 1);
			}
			i = res.indexOf('`');
		}
		res = res.replace('`', '');
		return res;
	}

	var makeComment = function makeComment(comm0) {
		return new _ChemComment2.default(cvtComm(comm0));
	};

	var constMap = {};
	function toNum(x, xpos) {
		if (!x) return 0;
		var k = 1;
		if (x[0] === '-') {
			k = -1;x = x.slice(1);
		}
		if (x[0] === '%') {
			// Использование или определение константы
			var val = void 0,
			    j = x.indexOf(':'),
			    name = void 0;
			if (j >= 0) {
				// Определение
				name = x.slice(1, j);
				val = x.slice(j + 1);
				constMap[name] = val;
			} else {
				name = x.slice(1);
				val = constMap[name];
				if (!val) error('Undefined variable [name]', { name: name, pos: xpos + 1 });
			}
			x = val;
		}
		if (x in NumConst) return k * NumConst[x];
		return +x * k;
	}

	// Система функций, обозначаемых через $
	var specMass = 0,
	    bAtomNum = 0,
	    curColor = null,
	    curItemColor = null,
	    curItemColor1 = 0,
	    curAtomColor = null,
	    curAtomColor1 = 0,
	    stdLen = 1,
	    nextDots = 0,
	    // результат dots для следующего узла
	nextDashes = 0,
	    dblAlignMode = 0,
	    // режим выравнивания двойных связей
	funcs = {
		atomColor: function atomColor(args) {
			curAtomColor = args[0];
		},
		atomColor1: function atomColor1(args) {
			curAtomColor1 = args[0];
		},
		color: function color(args) {
			curColor = args[0];
		},
		dashes: function dashes(args, argsPos) {
			nextDashes = (0, _utils.dashes)(args, argsPos, toNum);
		},
		// режим выравнивания двойных связей
		dblAlign: function dblAlign(args) {
			dblAlignMode = args[0];
		},
		// Точки
		dots: function dots(args, argsPos) {
			nextDots = (0, _utils.dots)(args, argsPos, toNum);
		}, // dots
		itemColor: function itemColor(args) {
			curItemColor = args[0];
		},
		itemColor1: function itemColor1(args) {
			curItemColor1 = args[0];
		},
		// Коэффициент длины связи по умолчанию (для формулы)
		L: function L(arg, argPos) {
			stdLen = toNum(arg[0], argPos[0]) || 1;
		},
		// Масса следующего элемента. Применимо не только к атомам, но кастомным элементам и даже группам
		M: function M(args) {
			specMass = +args[0];
		},
		// Масса следующего элемента плюс атомный номер   238 #  #
		// Например $nM(238)U                                 #  #
		//                                                 92  ##
		nM: function nM(args) {
			funcs.M(args);
			bAtomNum = 1;
		},
		slope: function slope(args) {
			// degree - radian | 180 - pi => radian = degree*pi/180
			userSlope = args[0] * degToRad;
		},
		ver: function ver(args) {
			var formulaVer = args[0].split('.'),
			    sysVer = _ChemSys2.default.ver();
			if (formulaVer.length > 1) {
				// formulaVer[0] is string value and sysVer[0] is number => don't use strict  formulaVer[0] === sysVer[0]
				// eslint-disable-next-line eqeqeq
				if (formulaVer[0] > sysVer[0] || formulaVer[0] == sysVer[0] && formulaVer[1] > sysVer[1]) error('Invalid version', { cur: _ChemSys2.default.verStr(), need: formulaVer.join('.') });
			}
		}
	};

	//-----------------------------------------------
	//	Сущности хим выражения
	function createEntity(entity) {
		result.ents.push(curEntity = entity);
	}

	//-----------------------------------------------
	//	Операции в хим.выражении

	function checkOp() {
		var c1 = void 0,
		    opDef = void 0,
		    pos1 = void 0,
		    comm = void 0,
		    j = Ops.length - 1;
		while (j >= 0 && text.indexOf(Ops[j].op, pos) !== pos) {
			j--;
		}if (j < 0) return null;
		// После операции нужен пробельный символ
		opDef = Ops[j];
		pos1 = pos + opDef.op.length;
		c1 = text.charAt(pos1);
		if (!isSpace(c1) && c1 !== '"') return null;

		createEntity(new _ChemOp2.default(opDef.op, opDef.dst || opDef.op, opDef.eq));
		curEntity.setPos(pos, pos1);
		if (commentPre) {
			comm = curEntity.commentPre = makeComment(commentPre);
			curEntity.pA = comm.pA = commentPrePos - 1;
			comm.pB = pos;
			commentPre = 0;
		}
		if (opDef.eq) curPart++; // переходим к следующей части уравнения
		pos = pos1;
		if (text[pos] === '"') {
			// Начать читать комментарий
			pos++;
			comm = curEntity.commentPost = makeComment(scanComment());
			comm.pA = pos1;
			curEntity.pB = comm.pB = ++pos;
		}
		// начать считывание следующей сущности
		return setState('begin');
	}

	//-----------------------------------------
	//		Агент
	// Подготовка данных для распознавания агента
	function openAgent() {
		chainSys = new _chainSys2.default();
		chargeOwner = curNode = 0;
		curBond = prevBond = 0;
		branchStack = [];
		nodesBranch = [];
		curEntity.part = curPart;
		nextDots = nextDashes = 0;
		nodesMap = {}; // именованные узлы для доступа через #Name
		var p0 = pos;
		curWidth = 0;

		// Присоединить ранее полученные коэффициент или коммент
		if (koeffPre) {
			curEntity.n = koeffPre;
			p0 = koeffPrePos;
		} else if (typeof commentPre === 'string') {
			//_notImpl('openAgent.coeffPre')
			p0 = commentPrePos;
			addNodeItem(makeComment(commentPre));
		}
		curEntity.pA = p0;
	}

	// Обработка незакрытой конструкции
	function branchError(obj) {
		if (obj.o) {
			// Незакрытая скобка
			error('It is necessary to close the bracket', { pos: obj.pos });
		} else {
			// Незакрытая ветка
			error('It is necessary to close the branch', { pos: obj.pos });
		}
	}

	function closeAgent() {

		var branchCmd = null;
		// Если в стеке есть мультипликатор, вытеснить его...
		while (branchStack.length && branchStack[0].m) {
			branchCmd = branchStack.shift();
		} // Если в стеке что-то есть, значит не закрыта открытая ранее конструкция
		if (branchStack.length) {
			branchError(branchStack[0]);
		}

		closeNode();
		closeBond();
		checkMiddlePoints();
		//checkMul()	TODO: Если вызывать здесь, то не заполняется команда ChemMulEnd
		if (branchCmd) {
			addCmd(new _ChemMul.ChemMulEnd(branchCmd.m));
		}
		curEntity.pB = pos;

		var i = void 0,
		    bond = void 0,
		    bonds = curEntity.bonds,
		    cmds = curEntity.cmds,
		    cmdIndex = 0,
		    j = void 0,
		    node = void 0,
		    nodes = void 0,
		    n = void 0,
		    item = void 0,
		    lmap = {},
		    key = void 0;

		// Сращивание дублирующих связей
		i = 0;
		while (i < bonds.length) {
			bond = bonds[i++];
			nodes = bond.nodes;
			if (nodes.length === 2 && !bond.midPt) {
				// Только для связей между двумя узлами И без промежуточных точек
				j = nodes[0].index;
				n = nodes[1].index;
				key = Math.min(j, n) + ':' + Math.max(j, n); // ключ образуется индексами узлов от меньшего к большему
				item = lmap[key];
				if (item) {
					// Это не сравнение! а присваивание и отновременная проверка
					// Зафиксировано наложение
					// Добавляется количество связей, все остальные настройки игнорируются
					item.N += bond.N;
					bonds.splice(--i, 1); // связь удаляется из списка
					// Удалить связь из списка команд агента
					// Используется тот факт, что команды идут в том же порядке, что и связи
					// Поэтому не нужно искать сначала списка
					while (cmds[cmdIndex] !== bond) {
						cmdIndex++;
					}cmds.splice(cmdIndex, 1);
				} else {
					lmap[key] = bond;
				}
			}
		}

		// Необходимо заполнить список связей для каждого узла
		for (i in bonds) {
			// цикл по связям
			bond = bonds[i];
			nodes = bond.nodes;
			for (j in nodes) {
				// цикл по узлам связи
				node = nodes[j];
				node.bonds.push(bond);
			}
		}
		// Необходимо заполнить автоузлы

		curEntity.nodes.forEach(function (node) {
			if (node.bAuto) {
				// Автоматический узел всегда содержит углерод
				node.items[0] = new _ChemNodeItem2.default(_core.MenTbl.C);
				n = node.bonds.reduce(function (acc, bond) {
					return acc + bond.N;
				}, 0); // сума кратностей связей, входящих в узел
				if (n < 4) {
					// Добавить нужное число атомов водорода
					var _item = new _ChemNodeItem2.default(_core.MenTbl.H);
					_item.n = 4 - n;
					node.items[1] = _item;
				}
			}
		});
	}
	// Распознать начало очередного узла в описании реагента. Если нет, вернуть -1
	function parseNode() {
		if (curNode && !curNode.pB) curNode.pB = pos;
		itemPos0 = pos;
		// Элемент
		if (c >= 'A' && c <= 'Z') {
			// Извлечь первый заглавный символ элемента. Следующие должны быть маленькими
			return setState('agentElem', 1);
		}

		// Краткое описание связи
		if (BondDefMap[c]) {
			createBondShort();
			return setState(st_agentMid);
		}

		switch (c) {
			case '`':
				// Признак изменения поведения следующей конструкции
				return bNegChar = 1;
			case '$':
				// Функция
				return setState('funcName', 1);
			case '{':
				// начало абстрактного элемента
				return setState('custom', 1);
			case '^':
				// заряд узла
				return setState('nCharge', 1);
			case '#':
				return setState('nodeRef', 1);
			case ';':
				// Конец цепочки
				closeBond();
				closeNode();
				prevBond = 0;
				chainSys.closeChain();
				//newChain();
				return setState('agentSpace', 1); // Возможно добавление пробелов
			case ':':
				// Объявление метки
				pos++;
				while (pos < textLen && /[\dA-Z]/i.test(text[pos])) {
					pos++;
				}checkCurNode();
				nodesMap[_substr(itemPos0 + 1)] = curNode;
				return setState(st_agentMid);
			case '<':
				openBranch();
				return setState(st_agentMid, 1);
			case '>':
				closeBranch();
				return setState(st_agentMid, 1);
			case '(':
				// Вариант (*
				if (nextChar() === '*') {
					openBranch();
					return setState(st_agentMid, 2);
				}
				break;
			case '"':
				// Комментарий, который становится частью узла
				pos++;
				{
					var item = new makeComment(scanComment());
					pos++;
					addNodeItem(item);
				}
				return setState(st_agentMid);
			case '*':
				// Вариант *)
				if (nextChar() === ')') {
					closeBranch();
					return setState(st_agentMid, 2);
				}
				return setState('mul', 1);
			case '_':
				return setState('uniBond', 1);
			case 'c':
				checkCurNode();
				return setState(st_agentMid, 1);
		}
		// Скобки...
		if (_ChemBr.ChemBrBegin.Map[c]) {
			// Открытая скобка
			// TODO: Не воспринимается скобка из нескольких символов
			// TODO: Если переставить перед switch, то перестаёт работать (* *)
			openBracket();
			return setState(st_agentMid, 1);
		}
		if (_ChemBr.ChemBrEnd.Lst.indexOf(c) >= 0) {
			closeBracket();
			return setState(st_agentMid);
		}
		// Специальный контроль символов нелатинских алфавитов
		if (/[А-ЯЁ]/i.test(c)) error('Russian element character', { pos: pos, C: c });
		if (c > '\x7F') {
			error('Non-latin element character', { pos: pos, C: c });
		}
		return -1;
	}

	////////////////////////////////////////////////
	//		Узлы
	function closeNode() {
		if (curNode) {
			if (!curNode.pB) curNode.pB = curNodeEnd;
			closeNodeItem();
			chargeOwner = curNode = 0;
		}
	}
	function createNode(bAuto, pt) {
		closeNode();
		checkMiddlePoints();
		var node = new _ChemNode2.default(pt);
		node.bAuto = bAuto;
		chargeOwner = curNode = node;
		curNodeEnd = curNode.pA = itemPos0;
		node.index = curEntity.nodes.length;
		curEntity.nodes.push(node);
		addCmd(node);
		chainSys.addNode(node);
		nodesBranch.push(node); // созданный узел присоединяется к текущей "ветке"

		// Контроль открытой скобки
		// Есть проблема с вложенными скобками, если между ними нет разделителя. Н.р: A[(B - [.nodes=[A,0], (.nodes=[A,B]
		var i = void 0,
		    br = void 0;
		for (i in branchStack) {
			br = branchStack[i].o;
			if (br && !br.nodes[1]) {
				br.nodes[1] = curNode;
			}
		}
		for (i in postNodeInits) {
			postNodeInits[i](node);
		} // Контроль закрытой скобки
		brEndsCtrl(node);
		return node;
	}

	function isEmptyNode(node) {
		return node.bAuto || _ChemSys2.default.isEmptyNode(node);
	}

	function smartCreateNode(bAuto) {
		// определить координаты нового узла
		var pt = 0,
		    node = void 0;
		if (curBond) {
			// Возможно, здесь нужно организовать мягкую связь
			// Для этого связь должна иметь признак soft и оба узла не автоматические
			if (curBond.soft && !bAuto && !isEmptyNode(curBond.nodes[0])) {
				chainSys.closeSC(0);
			} else {
				pt = curBond.calcPt();
				curBond.soft = 0;
			}
		}
		pt = pt || new _Point2.default();
		node = chainSys.findByPt(pt);
		if (node) {
			curNode = node;
			nodesBranch.push(node);
		} else {
			// Если узла нет, значит создать новый
			node = createNode(bAuto, pt);
		}
		setBondEnd();
		return curNode;
	}
	function checkCurNode() {
		if (!curNode) smartCreateNode(1);
	}

	// Обработать ссылку на указанный узел H-#C-H  или #O
	function linkNode(node) {
		checkBranch();
		node.fixed = 1;
		// Здесь есть две ситуации: сращивание цепей или продолжение цепи
		// Зависит от наличия curBond
		var node0 = curBond ? curBond.nodes[0] : 0;
		// Нельзя сращивать, если цепь одна, но подцепи разные (То есть, зацикленная молекула, в центре которой есть мягкие связи)
		if (node0 && !curBond.soft && !(node0.ch === node.ch && node0.sc !== node.sc)) {
			// сращивание цепей
			chainSys.merge(node0, node, curBond);
		} else {
			// Просто назначить текущую цепь
			chainSys.setCur(node);
		}
		curNode = node;
		nodesBranch.push(node);
		setBondEnd();
	}

	//------------------------ Ветки
	function checkBranch() {
		// TODO:
	}
	function openBranch() {
		closeBond();
		branchStack.unshift({ n: curNode, b: curBond, pb: prevBond, pos: itemPos0, nb: nodesBranch });
		nodesBranch = []; // начать новую ветку
	}
	function closeBranch() {
		closeBond();
		checkMul();
		var x = branchStack.shift();
		if (!x) {
			// Ошибка: Нет открытой скобки
			error('Invalid branch close', { pos: pos });
		}
		if (x.o) {
			// Ошибка: ветка закрывается до того, как закрыта скобка...
			error('Cant close branch before bracket', { pos: pos, pos0: x.pos + 1 });
		}
		curNode = x.n;
		curBond = x.b;
		prevBond = x.pb;
		nodesBranch = x.nb;
		chainSys.setCur(curNode); // вернуть текущую цепь/подцепь (внутри ветки можно создать новую подцепь)
	}
	//------------- ЛОКАЛЬНЫЕ СКОБКИ
	function openBracket() {
		chargeOwner = 0;
		var obj = new _ChemBr.ChemBrBegin(c);
		obj.setPos(pos, pos + 1);
		var node0 = curNode;
		if (!node0 && branchStack.length) {
			// Для случая [(
			if (branchStack[0].o) {
				// Если есть предыдущая скобка
				node0 = branchStack[0].o.nodes[0];
			}
		}
		obj.nodes[0] = node0;
		obj.bond = curBond;
		obj.color = curColor;
		addCmd(obj);
		branchStack.unshift({ o: obj, pos: pos });
		// Пока нет связи...
		closeNode();
		if (!curBond || curBond.soft) chainSys.closeSC(); // Если нет соединяющей связи, нужно прекратить цепь
	}

	function closeBracket() {
		checkMul();
		var br0 = branchStack.shift();
		if (!br0) error('Invalid bracket close', { pos: pos });
		var open = br0.o;
		if (!open) error('Cant close bracket before branch', { pos: pos, pos0: br0.pos + 1 });
		var needCloseChar = _ChemBr.ChemBrBegin.Map[open.tx];
		if (needCloseChar !== c) error('Expected [must] instead of [have]', { must: needCloseChar, have: c, pos: pos, pos0: br0.pos + 1 });

		var obj = new _ChemBr.ChemBrEnd(c, open);
		open.end = obj;
		obj.pA = pos;
		function setNode0(node) {
			obj.nodes[0] = node;
		}
		checkCurNode(0); // возможны негативные последствия
		if (curNode) {
			setNode0(curNode);
		} else {
			// Автоузел может не существовать. Нужно оставить в очереди заявку на его заполнение, когда будет создан
			postNodeInits.push(setNode0);
		}
		obj.color = open.color; // Цвет закрытой скобки такой же, как у открытой

		// Определить "текстовость" скобок
		var lst = curEntity.cmds,
		    i = lst.length,
		    txVis = new _IsNonText2.default();
		addCmd(obj);
		while (!txVis.ok && lst[i] !== open) {
			lst[i].walk(txVis);
			i--;
		}
		open.bTxt = obj.bTxt = !txVis.ok;

		// Добавить скобку в список для закрытия
		bracketEnds.unshift(obj);

		// Извлечение коэффициента и заряда
		pos++;
		var k = scanKoeff();
		if (k !== null) obj.n = k;
		obj.pB = pos;

		chargeOwner = obj;
	}

	function brEndsCtrl(node) {
		var i = void 0,
		    brEnd = void 0;
		for (i in bracketEnds) {
			brEnd = bracketEnds[i];
			if (!brEnd.nodes[1]) brEnd.nodes[1] = node;
		}
		bracketEnds.length = 0;
	}

	//------------ СВЯЗИ ---------------
	// Назначить curNode концом curBond (если она есть) и очистить связь
	function setBondEnd(bRef) {
		// Если есть связь, завершить её
		if (curBond) {
			curBond.nodes[1] = curNode;
			/*
    // Возможно, связь мягкая
    if (curBond.soft) {
    // Если curNode получен по ссылке, то не нужно его переносить в новую подцепь
    chainSys.closeSC(bRef?0:curNode);
    }
    //curBond = 0;
    */
			closeBond();
		}
	}

	function closeBond() {
		if (curBond) {
			if (!curBond.nodes[1]) {
				smartCreateNode(1);
			}
			curBond = 0;
		}
	}

	// Самая низкуровневая функция создания связи
	function createBondUni(pa) {
		var bond = new _ChemBond2.default();
		bond.setPos(pa, pos);
		addCmd(bond);
		curEntity.bonds.push(bond);
		if (curColor) bond.color = curColor;
		return bond;
	}

	function setCommonBondProps(bond, def) {
		bond.align = def.align || dblAlignMode; // x,l,r,m - перекрещенная или смещённая связь
		if (def.H && bond.N === 1) {
			bond.style = ':';
		}
		if (def.C) {
			// координационная связь = coordinate bond = dative covalent bond =Dipolar bond
			switch (def.C) {
				case '-':
					bond.arr0 = 1;break;
				case '+':
					bond.arr0 = bond.arr1 = 1;break;
				default:
					bond.arr1 = 1;
			}
		}
		if (def['<']) bond.arr0 = 1; // стрелка против направления связи
		if (def['>']) bond.arr1 = 1; // стрелка по направлению связи
		if (def['~']) def.S = '~'; // извилистая линия (рацемическая связь, н.р. D-глюкопираноза)

		// Явное определение стилей перекрывает ранее назначенный стиль
		if (def.S) {
			if (/^..[lrm]$/i.test(def.S)) {
				// для стиля может быть задан режим выравнивания, н.р. |:L
				bond.style = def.S.slice(0, 2);
				bond.align = def.S[2];
			} else {
				bond.style = def.S;
			}
		}

		if (bond.align) bond.align = bond.align.toLowerCase();

		bond.brk = !bond.soft;
	}

	// def:
	//  pt - шаг связи
	//  soft - мягкая связь
	//  tx - text
	//  N - кратность
	//  slope
	function createBondStd(def, pA) {
		closeBond();
		checkCurNode(); // Если текущего узла нет, нужно создать автоузел
		var bond = createBondUni(pA || itemPos0 - bNegChar);
		bond.pt = def.pt;
		bond.nodes[0] = curNode;
		closeNode();
		if (def.soft) bond.soft = 1;
		bond.tx = def.tx;
		bond.N = def.N;
		bond.slope = def.slope; // || 1;
		curBond = bond;
		prevBond = curBond;

		// Скобки...
		if (bracketEnds.length) {
			bracketEnds[0].bond = bond;
			bracketEnds.length = 0;
		}

		// Связь считается текстовой, если она расположена горизонтально и имеет длину =1
		bond.bText = _Point2.default.is0(Math.abs(def.pt.x) - 1) && _Point2.default.is0(def.pt.y);
		if (def.T) bond.tx = def.T;

		// толщина концов связей
		// толщина связей
		function setWidth(id, sign, glb) {
			var val = def[id];
			if (val) {
				if (val === '-') {
					def.w0 = sign;
					def.w1 = 0;
				} else if (val === '2') {
					def.w0 = def.w1 = sign;
				} else if (val === '1' || val === '0') {
					def.w0 = def.w1 = 0;
				} else if (val === '+') {
					def.w0 = 0;
					def.w1 = sign;
				} else val = 0;
				if (val && glb) {
					curWidth = def.w1;
				}
			}
			return val;
		}
		setWidth('w', 1) || setWidth('d', -1) || setWidth('W', 1, 1) || setWidth('D', -1, 1);
		if (def.w0 || def.w1) {
			bond.w0 = def.w0;
			bond.w1 = def.w1;
		}

		setCommonBondProps(bond, def);

		// Загрузка промежуточных точек
		if (middlePoints.length) {
			bond.midPt = [];
			bond.pA = middlePoints[0].pos;
			var pt = void 0,
			    i = void 0,
			    lastPt = bond.pt.clone();
			for (i in middlePoints) {
				bond.midPt.push(pt = middlePoints[i].pt);
				bond.pt.addi(pt);
			}
			bond.midPt.push(lastPt);
			middlePoints.length = 0;
		}
	}

	// Возможен поиск координат для указанных вершин
	function toNumCoord(src, axis, apos) {
		// description _(x) => {x:true}
		if (!src || src === true) return 0;
		if (src.charAt(0) === '#') {
			// Привязка к другим узлам. Номера узлов через ;
			var lnkLst = src.slice(1).split(';'),
			    sum = 0,
			    i = void 0,
			    nd = void 0,
			    ipos = apos + 1;
			for (i in lnkLst) {
				nd = findNodeEx(lnkLst[i], ipos);
				sum += nd.pt[axis];
				ipos += lnkLst[i].length + 1;
			}
			sum /= lnkLst.length;
			checkCurNode();
			return sum - curNode.pt[axis];
		}
		return toNum(src, apos);
	}

	// создать смещение для нового узла полигона
	// cw = 1/-1 = по или против часовой стрелки
	// cnt - количество углов (граней) полигона
	// dstPt - смещение (используется для повышения эффективности, чтобы не создавать лишний объект)
	// len - длина связи ТОЛЬКО для случая, когда отсутствует предыдущая связь
	function createPolygonStep(cw, cnt, dstPt, len) {
		// dstPt = dstPt  || new Point() // - never used
		if (!prevBond) {
			dstPt.init(len, 0);
			return dstPt;
		}
		//checkCurNode(); - uniBond
		var p1 = curNode.pt,
		    p0 = prevBond.nodes[0].pt,
		    dist = p1.dist(p0),
		    ca = Math.PI * 2 / cnt,
		    a0 = p1.subx(p0).polarAngle(),
		    A = a0 + cw * ca;
		dstPt.fromRad(A).muli(dist);
		return dstPt;
	}

	// Вычислить координаты из описания
	function calcPosition(def, defPos) {
		var pt = new _Point2.default(),
		    val = void 0,
		    len = def.L;
		if (len) {
			len = toNum(len, defPos.L);
		} else {
			len = stdLen;
		}
		function fromAngle(a) {
			pt.fromDeg(a).muli(len);
		}
		// взаимоисключаются описания: p, P, a, A
		if ('p' in def) {
			// Использование координат существующих узлов
			// example: p1;-1
			// Без #
			checkCurNode();
			var ndl = void 0,
			    k = void 0,
			    lbl = void 0,
			    lblLst = def.p.split(';'),
			    ipos = defPos.p;
			for (k in lblLst) {
				ndl = findNodeEx(lbl = lblLst[k], ipos);
				pt.addi(ndl.pt);
				ipos += lbl.length + 1;
			}
			pt.muli(1 / lblLst.length);
			pt.subi(curNode.pt);
		} else if ('P' in def) {
			val = def.P === true ? 5 : +def.P || 5;
			createPolygonStep(val < 0 ? -1 : 1, Math.abs(val), pt, len);
		} else if ('a' in def) {
			var a = 0;
			if (prevBond) {
				checkCurNode();
				var dif = curNode.pt.subx(prevBond.nodes[0].pt);
				a = dif.polarAngle() * 180 / Math.PI;
			}
			a += toNum(def.a, defPos.a);
			fromAngle(a);
		} else if ('A' in def) {
			fromAngle(toNum(def.A, defPos.A));
		}
		// значения x, y могут быть прибавлены к другим способам описания координат
		val = def.x;
		if (val) {
			pt.x += toNumCoord(val, 'x', defPos.x);
		}
		val = def.y;
		if (val) {
			pt.y += toNumCoord(val, 'y', defPos.y);
		}
		return pt;
	}

	function makeDefFromArgs(args, argsPos, def, defPos) {
		var i = void 0,
		    a = void 0,
		    key = void 0,
		    val = void 0;
		for (i in args) {
			a = args[i];
			key = a[0];
			val = a.slice(1);
			def[key] = val || true;
			defPos[key] = argsPos[i] + 1;
		}
	}

	// Построить универсальную связь
	function createBondFull(pa, args, argsPos) {
		var def = { tx: '_', N: 1, w0: curWidth, w1: curWidth },
		    defPos = {};
		makeDefFromArgs(args, argsPos, def, defPos);

		// Перекрещенная двойная связь или режимы выравнивания L, R, M
		if (/^2[xlrm]$/i.test(def.N)) {
			def.align = def.N[1];
			def.N = 2;
		} else def.N = +def.N;

		checkCurNode(); // Иначе неправильно считается позиция x#-1;1
		def.pt = calcPosition(def, defPos);

		createBondStd(def, pa);
	}

	// дополнительные настройки из суффикса
	function loadSuffix(def) {
		while (pos < textLen) {
			c = text[pos];
			switch (c) {
				case '0': // пустая связь
				case 'o':
					def.N = 0;
					break;
				case 'h':
					def.H = 1;
					break;
				case 'w':
					def.w = def.w === '+' ? '-' : '+';
					break;
				case 'd':
					def.d = def.d === '+' ? '-' : '+';
					break;
				case 'x':
					def.align = 'x';
					break;
				case '~':
					def.S = '~';
					break;
				case 'v':
					if (!def['>']) def['>'] = 1;else if (!def['<']) {
						def['<'] = 1;
						def['>'] = 0;
					}
					break;
				default:
					return;
			}
			pos++;
		}
	}

	// Создание связи-ребра полигона _p или _q
	// type = p|q
	function createEdgeBond(type, pa) {
		var def = { N: 1, pt: new _Point2.default() },
		    vertexCnt = void 0,
		    j = void 0;
		pos++;
		if (text[pos] === type) {
			// повтор типа означает двойную связь
			def.N++;
			pos++;
		}
		j = pos;
		while (pos < textLen && isDigit(text[pos])) {
			pos++;
		}vertexCnt = j === pos ? 5 : +text.substring(j, pos);

		createPolygonStep(type === 'q' ? -1 : 1, vertexCnt, def.pt, stdLen);
		loadSuffix(def);

		createBondStd(def, pa);
	}

	// Создание промежуточной точки для изогнутой линии
	function createMiddlePoint() {
		var p0 = pos - 1;
		pos++;
		if (text[pos] !== '(') {
			error("Expected '(' after [S]", { pos: pos - 1, S: '_m' });
		}
		pos++;
		var args = [],
		    argsPos = [],
		    def = {},
		    defPos = {},
		    pt = void 0;
		scanArgs(args, argsPos);
		makeDefFromArgs(args, argsPos, def, defPos);
		checkCurNode(); // на всякий случай
		pt = calcPosition(def, defPos);
		middlePoints.push({ pt: pt, pos: p0, pos1: pos });
	}

	// Циклическая пи-связь (бензол с кольцом)
	function createRing(pa) {
		var n = nodesBranch.length,
		    j = n - 2,
		    bond = void 0;
		if (n < 3) error('Cant create ring', { pos: pa });
		// Поиск совпавшей вершины
		while (j >= 0 && nodesBranch[j] !== curNode) {
			j--;
		}if (j < 0) error('Cant close ring', { pos: pa });
		bond = createBondUni(pa);
		bond.nodes.length = 0;
		bond.tx = bond.ext = 'o';
		bond.N = 1;
		for (j++; j < n; j++) {
			bond.nodes.push(nodesBranch[j]);
		}
	}

	// Конструкция _s для ввода связи через несколько узлов
	function createPolyBond(args, argsPos, pa) {
		var def = {},
		    defPos = {},
		    bond = void 0,
		    nodes = void 0;
		makeDefFromArgs(args, argsPos, def, defPos);
		bond = createBondUni(pa);
		bond.tx = bond.ext = 's';
		nodes = bond.nodes;
		nodes.length = 0;
		bond.o = def.o; // Признак цикличности, заданный в описании связи
		if (def.N) bond.N = +def.N;
		setCommonBondProps(bond, def);
		function parseListDef(listDef) {
			var nodes = bond.nodes,
			    ipos = defPos['#'],
			    i = void 0,
			    j = void 0,
			    pieces = listDef.split(';'),
			    intDef = void 0,
			    node = void 0,
			    node2 = void 0;
			for (i in pieces) {
				intDef = pieces[i].split(':');
				if (intDef.length === 1) {
					// Один узел
					nodes.push(findNodeEx(intDef[0], ipos));
				} else {
					// Интервал узлов
					node = findNodeEx(intDef[0], ipos);
					node2 = findNodeEx(intDef[1], ipos + intDef[0].length + 1);
					if (node.index > node2.index) {
						var _ref = [node, node2];
						// Если в обратном порядке, меняем местами

						node2 = _ref[0];
						node = _ref[1];
					}
					var agentNodes = curEntity.nodes;
					for (j = node.index; j < agentNodes.length; j++) {
						nodes.push(agentNodes[j]);
						if (node2 === agentNodes[j]) break;
					}
				}
				ipos += pieces[i].length + 1;
			}
		}
		function autoFind() {
			var j = nodesBranch.length - 1,
			    node0 = 0,
			    node = void 0;
			while (j >= 0) {
				nodes.push(node = nodesBranch[j]);
				if (!node0) node0 = node;else if (node === node0) break; // кольцо замкнулось
				j--;
			}
		}
		var n = void 0,
		    listDef = def['#'];
		if (listDef) {
			// Разбор описания списка узлов
			parseListDef(listDef);
		} else {
			// Включаем все узлы подряд с конца. Либо до замыкания кольца, либо до начала ветки
			autoFind();
		}
		n = nodes.length;
		// Признак цикличности: число узлов 4 или больше И первый узел в цепи совпадает с последним
		if (n > 3 && nodes[0] === nodes[n - 1]) {
			nodes.length = n - 1; // Убрать последний узел
			bond.o = 1;
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
		//let s = bond.slope, b=bond.bNeg;
		if (!slope) {
			// Либо горизонтальная, либо вертикальная
			if (bHoriz) {
				return bNeg ? 9 : 3;
			} else {
				return bNeg ? 12 : 6;
			}
		}
		// остаются наклонные, у которых s 1 или -1
		if (slope > 0) {
			// 4,5,10,11
			if (bCorr) {
				// 5,11
				return bNeg ? 11 : 5;
			} else {
				// 4,10
				return bNeg ? 10 : 4;
			}
		}
		// 1,2, 7,8
		if (bCorr) {
			return bNeg ? 7 : 1;
		}
		return bNeg ? 8 : 2;
	}
	function bondSlopeId(bond) {
		return calcSlopeId(bond.slope, bond.bNeg, _Point2.default.is0(bond.pt.y), bond.bCorr);
	}

	// Создание связи из краткого описания
	function createBondShort() {
		// Извлечение максимально длинной связи
		// TODO: этот алгоритм можно ускорить, если заранее построить дерево проверок
		var i = void 0,
		    l = void 0,
		    maxLen = 0,
		    bestId = void 0,
		    bestDef = void 0,
		    n1 = void 0;
		for (i in BondDefs) {
			if (text.indexOf(i, pos) === pos) {
				l = i.length;
				if (l > maxLen) {
					maxLen = l;
					bestId = i;
				}
			}
		}
		bestDef = BondDefs[bestId];
		pos += maxLen;
		// 0=кратность, 1=угол, 2=знак уклона, 3=признак мягкой связи, 4=текст
		var slope = bestDef[2],
		    angle0 = bestDef[1],
		    def = { N: bestDef[0], slope: slope, soft: bestDef[3], tx: bestDef[4] || bestId };
		loadSuffix(def);

		var linkSlope = userSlope || defaultSlope,
		    angle = bestDef[1] + slope * linkSlope;

		var bsid1 = 0,
		    bsid2 = 0,
		    prevL = prevBond,
		    bCorr = 0,
		    bHoriz = !angle0 && !slope;
		// Автокоррекция. Шаг 1.
		// Не используется, если угол наклона явно указан при помощи $slope
		if (!userSlope && prevL && prevL.bAuto) {
			bsid1 = bondSlopeId(prevL);
			bsid2 = calcSlopeId(slope, bNegChar, bHoriz, 0);
			if ((bsid1 === 3 || bsid1 === 9) && slope || // horiz, slope
			(bsid1 === 8 || bsid1 === 7) && bsid2 === 4 || // `/\
			(bsid1 === 4 || bsid1 === 5) && bsid2 === 8 || // \`/
			(bsid1 === 10 || bsid1 === 11) && bsid2 === 2 || // `\/
			(bsid1 === 1 || bsid1 === 2) && bsid2 === 10 //  /`\
			) {
					angle = bestDef[1] + slope * Math.PI / 3;
					bCorr = 1;
				}
		}
		if (bNegChar) angle += Math.PI;

		def.pt = new _Point2.default().fromRad(angle).muli(stdLen);

		createBondStd(def);

		curBond.bAuto = 1;
		curBond.bCorr = bCorr;
		curBond.bNeg = bNegChar;
		bNegChar = 0;
		n1 = curBond.nodes[0];

		// Коррекция предыдущей связи:
		// Коррекция разрешена, есть предыдущая связь, она автоматическая и не корректировалась
		if (!userSlope && prevL && prevL.bAuto && !prevL.bCorr && !n1.fixed) {
			// Либо сочетание наклонной связи с горизонтальной.
			// Либо сочетание разнонаправленных наклонных связей
			if ((bsid1 === 4 || bsid1 === 5) && bsid2 === 8 || // \`/
			(bsid1 === 2 || bsid1 === 1) && bsid2 === 10 || // /`\
			(bsid1 === 10 || bsid1 === 11) && bsid2 === 2 || // `\/
			(bsid1 === 8 || bsid1 === 7) && bsid2 === 4 || // `/\
			(bsid1 === 10 || bsid1 === 8 || bsid1 === 2 || bsid1 === 4) && bHoriz) {
				var a = prevL.nodes[0].pt,
				    d = n1.pt.subx(a),
				    sx = d.x < 0 ? -1 : 1,
				    sy = d.y < 0 ? -1 : 1,
				    d1 = new _Point2.default(Math.abs(d.y) * sx, Math.abs(d.x) * sy),
				    newPt = d1.addi(a),
				    corr = newPt.subx(n1.pt);
				prevL.bCorr = 100;
				n1.pt = newPt;
				// возможно, требуется откорректировать боковую ветку...
				/* TODO: закомментировано временно, пока нет боковых веток
     let chL=chains[curChain].L;
     let j=chL.length-2;
     while (chL[j]!=prevL && j>=0) chL[--j].nodes[1].ufl=0;
     if (j<chL.length-2) {
     while (j<chL.length-2) {
     let ndj=chL[++j].nodes[1];
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
		var lst = curNode.items,
		    L = lst.length;
		return L ? lst[L - 1] : 0;
	}
	function closeNodeItem() {
		//let item=getLastItem();
		//if (item && !item.pB) item.pB=pos;
	}
	function addNodeItem(obj) {
		if (bracketEnds.length) {
			closeNode();
			chainSys.closeSC();
		}
		if (!curNode) smartCreateNode();
		closeNodeItem();
		var item = new _ChemNodeItem2.default(obj);
		item.setPos(itemPos0, pos);
		curNode.items.push(item);
		curNodeEnd = pos;

		if (bNegChar) {
			// Назначить явным образом центральный элемент узла
			item.bCenter = true;
			bNegChar = 0;
		}

		// Предыдущие настройки...
		item.M = specMass;
		specMass = 0;
		item.atomNum = bAtomNum;
		bAtomNum = 0;
		if (curItemColor1) {
			item.color = curItemColor1;
			curItemColor1 = 0;
		} else if (curItemColor) {
			item.color = curItemColor;
		} else {
			item.color = curColor;
		}
		if (curAtomColor1) {
			item.atomColor = curAtomColor1;
			curAtomColor1 = 0;
		} else {
			item.atomColor = curAtomColor;
		}
		item.dots = nextDots;
		item.dashes = nextDashes;
		nextDots = nextDashes = 0;
	}

	//------------- ссылки

	// Найти существующий узел по описанию (номер, обозначение элемента)
	function findNode(ref) {
		var i = void 0,
		    n = +ref,
		    lst = curEntity.nodes;
		if (n) {
			if (n < 0) {
				// Отрицательные номера использовать для обратной индексации
				n += lst.length;
				if (n < 0) return 0;
				return lst[n];
			}
			if (n > lst.length) return 0; // Выход за пределы списка
			return lst[--n]; // Т.к. нумерация с 1
		}

		// Возможно, метка...
		// Если была указана метка, совпадающая с обозначением элемента, то метка имеет приоритет выше
		nd = nodesMap[ref];
		if (nd) return nd;

		// если указан элемент (возможно с номером)
		var nodes = void 0,
		    nd = void 0,
		    elId = ref,
		    el = _findElem(elId);
		if (el) {
			nodes = curEntity.nodes;
			n = nodes.length;
			for (i = 0; i < n; i++) {
				nd = nodes[i];
				if (nd.items.length === 1 && nd.items[0].obj === el) {
					return nd;
				}
			}
		}
		return 0;
	}
	function findNodeEx(refId, startPos) {
		var node = findNode(refId);
		if (!node) error("Invalid node reference '[ref]'", { ref: refId, pos: startPos });
		return node;
	}

	// Final state machine for syntax analyzer
	var fsm = {
		begin: function begin() {
			skipSpace();
			if (pos >= textLen) {
				return 0;
			}
			// Previous comment
			if (c === '"') {
				return setState('commPre', 1);
			}
			// Если операция, обрабатываем её
			var r = checkOp();
			if (r !== null) return r;

			// Возможно наличие коэффициента
			koeffPrePos = pos;
			koeffPre = scanKoeff();
			skipSpace();
			if (pos === textLen) return 0;

			c = text[pos];
			// Здесь возможно открытие суперскобки...
			if (c === '(' && isSpace(nextChar())) {
				_notImpl('Superbracket');
			}

			// Иначе считаем, что это начало реагента
			return setState('agent');
		}, // begin
		commPre: function commPre() {
			commentPrePos = pos;
			commentPre = scanComment();
			return setState('begin', 1);
		},
		agent: function agent() {
			// Начало распознавания реагента
			createEntity(new _ChemAgent2.default());
			openAgent();
			return setState('agentIn');
		},
		agentIn: function agentIn() {
			var res = parseNode();
			if (res < 0) error("Unknown element character '[C]'", { C: c, pos: pos });
			return res;
		},
		agentMid: function agentMid() {
			var res = parseNode();
			if (res < 0) {
				// Конец агента
				closeAgent();
				return setState('begin');
			}
			return res;
		},
		agentElem: function agentElem() {
			// Извлечение элемента. Первая буква уже пройдена, pos указывает на вторую
			var pos0 = pos - 1;
			while (pos < textLen && isSmallAlpha(text[pos])) {
				pos++;
			}var elemId = _substr(pos0),
			    obj = _findElem(elemId);
			if (!obj) error("Unknown element '[Elem]'", { pos: pos0, Elem: elemId });
			addNodeItem(obj);
			return setState('postItem');
		},
		// Сразу после элемента узла
		postItem: function postItem() {
			var item = void 0,
			    k = scanKoeff();
			if (k !== null) {
				item = getLastItem();
				item.n = k;
				item.pB = pos;
				return setState('postItem');
			}
			// Возможно, степень окисления в скобках
			k = scanOxidation();
			if (k) {
				item = getLastItem();
				item.charge = k;
				item.pB = pos;
				return setState('postItem');
			}
			curNodeEnd = pos;
			return setState(st_agentMid);
		},
		funcName: function funcName() {
			// Извлечение имени функции до скобки
			var p0 = pos,
			    name = void 0,
			    args = [],
			    argPos = [];
			while (pos < textLen && text[pos] !== '(') {
				pos++;
			}if (pos === textLen) error("Expected '(' after [S]", { S: '$', pos: p0 });
			name = _substr(p0);
			pos++;
			scanArgs(args, argPos);
			// Если имя функции не найдено, функция игнорируется
			// с целью совместимости со следующими версиями
			if (funcs[name]) {
				funcs[name](args, argPos);
			}
			return setState(st_agentMid);
		},
		// Создание абстрактного элемента или радикала
		custom: function custom() {
			var p0 = pos,
			    s = void 0,
			    radical = void 0;
			while (pos < textLen && text[pos] !== '}') {
				pos++;
			}if (pos >= textLen) error('Abstract element is not closed', { pos: p0 - 1 });
			s = _substr(p0);pos++;
			radical = _ChemRadical2.default.Map[s];
			addNodeItem(radical || new _ChemCustom2.default(s));
			return setState('postItem');
		},
		// Заряд узла (после ^)
		nCharge: function nCharge() {
			if (!chargeOwner) error('Expected node declaration before charge', { pos: pos - 1 });
			var p0 = pos,
			    charge = scanCharge();
			if (!charge) error('Invalid charge declaration', { pos: p0 });
			if (bNegChar) {
				// Наличие ` перед объявлением заряда означает, что заряд нужно вывести слева
				charge.bLeft = 1;
				bNegChar = 0;
			}
			chargeOwner.charge = charge;
			return setState(st_agentMid);
		},
		// Первый символ ссылки на узел
		nodeRef: function nodeRef() {
			var p0 = pos,
			    refId = void 0,
			    node = void 0;
			if (isDigit(c) || c === '-') {
				// Извлечение числовой ссылки
				pos++;
				while (pos < textLen && isDigit(text[pos])) {
					pos++;
				}
			} else if (/[A-Z]/i.test(c)) {
				// Извлечение текстовой ссылки
				pos++;
				while (pos < textLen && /^[A-Z\d]$/i.test(text[pos])) {
					pos++;
				}
			} else if (isSpace(c)) {
				// Пропуск
				return setState('agentSpace', 1);
			}
			refId = _substr(p0);
			node = findNodeEx(refId, p0);

			// Установить признак, означающий конец мостика,
			// чтобы мягкие связи между уже существующими узлами не сливались
			// возможно, стоило переместить в linkNode...
			if (curBond) curBond.brk = 1;

			linkNode(node);
			return setState(st_agentMid);
		},
		agentSpace: function agentSpace() {
			while (pos < textLen && isSpace(text[pos])) {
				pos++;
			}return setState(st_agentMid);
		},
		uniBond: function uniBond() {
			checkCurNode();
			var pa = pos - 1,
			    args = [],
			    argsPos = [],
			    bCreate = 1;
			if (c === '(') {
				pos++;
				scanArgs(args, argsPos);
			} else if (c === 'p' || c === 'q') {
				createEdgeBond(c, pa);
				bCreate = 0;
			} else if (c === 'm') {
				createMiddlePoint();
				bCreate = 0;
			} else if (c === 'o') {
				pos++;
				createRing(pa);
				bCreate = 0;
			} else if (c === 's') {
				if (text[++pos] !== '(') error("Expected '(' after [S]", { S: c, pos: pos });
				pos++;
				scanArgs(args, argsPos);
				createPolyBond(args, argsPos, pa);
				bCreate = 0;
			}
			if (bCreate) createBondFull(pa, args, argsPos);
			return setState(st_agentMid);
		},
		mul: function mul() {
			// Мультипликатор. pos указывает на следующий символ после *
			checkMul();
			var pa = pos - 1,
			    n = scanKoeff(),
			    cmd = new _ChemMul2.default(n || 1);
			cmd.setPos(pa, pos);
			addCmd(cmd);
			closeNode();
			chainSys.closeSC(); // нужно прекратить подцепь
			branchStack.unshift({ m: cmd }); // внести команду в стек веток со свойством m
			// Извлечение произойдёт при закрытии > ), в конце агента или в начале нового мультипликатора
			return setState(st_agentMid);
		}

	}; // fsm

	//////////////////////////////////////////////
	//		Собственно алгоритм компиляции
	try {
		// В различных источниках часто встречается символ, похожий на минус, но с другим кодом...
		text = text.replace(/−/g, '-');
		// Выполнить препроцесс
		text = result.src = (0, _preprocess.preProcess)(text);

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
		result.error = err instanceof _ChemError2.default ? err : new _ChemError2.default('Internal error: [msg]', { msg: err.message });
	}

	result.src0 = text; // source text

	return result;
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ChargeCalc;
/**
 * Created by PeterWin on 09.05.2017.
 */

////////////////////////////////////////////////////////////
//		visitor ChargeCalc
//	Вычисление суммы зарядов узлов
// Example:
//	var visitor = new ChargeCalc();
//	expr.walk(visitor);
//	var chargeValue = visitor.result();

/**
 *
 * @constructor
 */
function ChargeCalc() {
	var me = this,
	    stack = [0];

	/**
  * @returns {number}
  */
	me.result = function () {
		return stack[0];
	};

	me.agentPre = me.bracketBegin = me.mul = function () {
		stack.unshift(0);
	};
	me.agentPost = function (obj) {
		var n = stack.shift() * obj.n;
		stack[0] += n;
	};
	me.bracketEnd = function (obj) {
		var v = stack.shift();
		if (obj.charge) {
			// заряд, указанный для скобки, игнорирует все заряды внутри скобок
			// например, для комплексного иона можно указать заряды лигандов, но они считаться не будут
			v = obj.charge.val;
		}
		stack[0] += v * obj.n;
	};
	me.nodePost = function (obj) {
		stack[0] += obj.chargeVal();
	};
	me.mulEnd = function (obj) {
		var n = stack.shift() * obj.beg.n;
		stack[0] += n;
	};
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 07.05.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ElemListMaker;

var _ElemList = __webpack_require__(8);

var _ElemList2 = _interopRequireDefault(_ElemList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function ElemListMaker() {
	var visitor = this,
	    stack = [new _ElemList2.default()];

	/**
  * Get calculated elements list
  * @returns {ElemList}
  */
	visitor.result = function () {
		return stack[0];
	};

	visitor.agentPre = visitor.itemPre = visitor.bracketBegin = visitor.mul = function () {
		stack.unshift(new _ElemList2.default());
	};

	var pop = function pop(obj) {
		var lst = stack.shift();
		lst.scale(obj.n);
		stack[0].addList(lst);
	};
	visitor.agentPost = visitor.itemPost = visitor.mulEnd = pop;

	visitor.bracketEnd = function (obj) {
		// save charge, what calculated for internal brackets
		// Сохранить заряд, вычисленный для внутренностей скобок
		var svCharge = stack[0].charge;
		pop(obj);
		if (obj.charge) {
			// If bracket have specified charge, then ignore calculated charge
			// Если для скобки указан отдельный заряд, то вычисленный нужно игнорировать
			stack[0].charge += obj.charge.val * obj.n - svCharge;
		}
	};

	/**
  * before node handler
  * @param {ChemNode} node
  */
	visitor.nodePost = function (node) {
		stack[0].charge += node.chargeVal();
	};

	/**
  * Chemical element handler
  * @param {ChemAtom} chemElement
  */
	visitor.atom = function (chemElement) {
		stack[0].addElem(chemElement);
	};
	visitor.custom = function (obj) {
		stack[0].addCustom(obj.tx);
	};
	visitor.radical = function (obj) {
		stack[0].addRadical(obj);
	};
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = IsAbstract;

var _core = __webpack_require__(2);

/**
 * visitor for abstract items detection
 * Example
 * if (expr.walk(new IsAbstract())) alert('expr is abstract');
 * @constructor
 */
function IsAbstract() {
	var me = this;
	me.ok = false;
	var testK = function testK(k) {
		return me.ok = me.ok || (0, _core.isAbsK)(k);
	};

	// Агент и элемент узла могут иметь коэффициент ========= Скобка тоже!!!!!!!!!!
	me.agentPre = me.itemPre = me.bracketEnd = function (obj) {
		return testK(obj.n);
	};
	// Абстрактный элемент
	me.custom = function () {
		return me.ok = true;
	};
} /**
   * Created by PeterWin on 06.05.2017.
   */

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 07.05.2017.
 */


// visitor для вычисления масс
// Для выражения вычисляется список масс (для каждого агента отдельно)
// Для агента, узла, элемента узла или атома вычисляется одно значение
// Список масс доступен через getList
// Суммарная масса - getSum
// Example:
// var massCalc = new MassCalc();
// expr.walk(massCalc)
// var totalMass = massCalc.getSum()
//
// Внимание! Наличие абстрактных коэффициентов или элементов делает результат непредсказуемым!
// Рекомендуется сначала проверять выражение на абстрактность

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MassCalc = function () {
	function MassCalc() {
		_classCallCheck(this, MassCalc);

		this.list = [];
		this.stack = [0];
		this.itemPre = this.bracketBegin = this.mul = this.enter;
		this.itemPost = this.bracketEnd = this.leave;
	}

	// Список масс. Если визитор использован для выражения, то для каждого агента будет своя масса. Иначе в списке один элемент.
	/**
  * List of mass each agent of expression
  * @returns {number[]}
  */


	_createClass(MassCalc, [{
		key: 'getList',
		value: function getList() {
			return this.list.length ? this.list : this.stack;
		}

		// Сумма всех масс.
		// Штатный метод для тех случаев, когда масса ожидается в виде одного числа
		/**
   * Calculate total mass of expression
   * @returns {number}
   */

	}, {
		key: 'getSum',
		value: function getSum() {
			/*
   var sum=0, i, a=this.getList();
   for (i in a)
   	sum += a[i];
   return sum;
   */
			return this.getList().reduce(function (acc, mass) {
				return acc + mass;
			}, 0);
		}

		//--------- internal handlers

	}, {
		key: 'atom',
		value: function atom(obj) {
			this.stack[0] += obj.M;
		}
	}, {
		key: 'radical',
		value: function radical(obj) {
			var list = obj.items,
			    j = 0,
			    rec = void 0;
			for (; j < list.length; j++) {
				rec = list[j];
				this.stack[0] += rec.elem.M * rec.n;
			}
		}
	}, {
		key: 'enter',
		value: function enter() {
			this.stack.unshift(0);
		}
	}, {
		key: 'leave',
		value: function leave(obj) {
			var m = this.stack.shift();
			if (obj.M) m = obj.M; // Если масса явно указана для элемента ($M), то собственная масса подчинённого объекта игнорируется
			m *= obj.n; // Умножить массу на количественный коэффициент при элементе
			this.stack[0] += m;
		}
	}, {
		key: 'mulEnd',
		value: function mulEnd(obj) {
			var m = this.stack.shift();
			m *= obj.beg.n; // Умножить массу на количественный коэффициент, указанный при объявлении мультипликатора
			this.stack[0] += m;
		}
	}, {
		key: 'agentPost',
		value: function agentPost() {
			this.list.push(this.stack[0]);
			this.stack = [0];
		}
	}]);

	return MassCalc;
}();

exports.default = MassCalc;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chains system.
 * This is a part of CharChem compiler
 * Created 2015-05-26 by PeterWin
 */


/**
 * Create instance of sub chain
 * @constructor
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.SubChain = SubChain;
exports.Chain = Chain;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function SubChain() {
	var _this = this;

	this.index = SubChain.s_next++;
	/**
  * private node list
  * @type {ChemNode[]}
  */
	var nodes = [];

	/**
  * Get nodes for this SubChain
  * @returns {ChemNode[]}
  */
	this.getNodes = function () {
		return nodes;
	};

	/**
  * Set chain number for all nodes
  * @param {number} nChain
  */
	this.setCh = function (nChain) {
		return nodes.forEach(function (node) {
			return node.ch = nChain;
		});
	};

	/**
  * Find node by coordinates
  * @param {Point} pt
  * @returns {ChemNode|null}
  */
	this.findByPt = function (pt) {
		return nodes.find(function (node) {
			return node.pt.eq(pt);
		}) || null;
	};

	/**
  * Add node to sub chain
  * @param {ChemNode} node
  */
	this.addNode = function (node) {
		nodes.push(node);
		node.sc = _this.index;
	};

	this.delNode = function (node) {
		var i = nodes.length;
		while (i > 0) {
			i--;
			if (node === nodes[i]) {
				nodes.splice(i, 1);
				return;
			}
		}
	};

	/**
  * Add nodes list to NON-EMPTY SubChain!
  * Coordiantes of added nodes moves to delta
  * @param {ChemNode[]} srcNodes
  * @param {Point} delta
  */
	this.add = function (srcNodes, delta) {
		var node0 = nodes[0]; // SubChain must be non-empty!
		srcNodes.forEach(function (node) {
			node.pt.addi(delta);
			node.ch = node0.ch;
			node.sc = node0.sc;
			nodes.push(node);
		});
	};
}
SubChain.s_next = 1;

// =========================================================
// Chain

function Chain() {
	var _this2 = this;

	this.index = Chain.s_next++;
	/**
  * Current subChain
  * @type {SubChain}
  */
	var curSC = null;

	/**
  * Map of subChains by index
  * @type {Object<number,SubChain>}
  */
	var subChains = {};

	this.getLst = function () {
		return subChains;
	};

	/**
  * Find node by coordinates in current subChain
  * @param {Point} pt
  * @returns {ChemNode|null}
  */
	this.findByPt = function (pt) {
		return !curSC ? null : curSC.findByPt(pt);
	};

	/**
  * Add node to chain and it current subChain
  * if current subChain is null, then create new subChain
  * @param {ChemNode} node
  */
	this.addNode = function (node) {
		if (!curSC) {
			curSC = new SubChain();
			subChains[curSC.index] = curSC;
		}
		node.ch = _this2.index;
		curSC.addNode(node);
	};

	/**
  * Close current subChain and remove specified node into new subChain
  * @param {ChemNode=} node
  */
	this.closeSC = function () {
		var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

		if (curSC && node) curSC.delNode(node);
		curSC = null;
		if (node) {
			_this2.addNode(node);
			node.pt.init(0, 0);
		}
	};

	/**
  * get specified subChain
  * @param {number} n
  * @returns {SubChain|null}
  */
	this.getSC = function (n) {
		return subChains[n];
	};

	/**
  * Get current subChain
  * @returns {SubChain|null}
  */
	this.getCurSC = function () {
		return curSC;
	};

	/**
  * Set current subChain
  * @param {SubChain} subChain
  */
	this.setCur = function (subChain) {
		curSC = subChain;
	};

	/**
  * Delete subChain
  * @param {number} index
  * @returns {ChemNode[]|undefined}
  */
	this.delSC = function (index) {
		var subChain = subChains[index];
		if (subChain) {
			delete subChains[index];
			return subChain.getNodes();
		}
	};

	/**
  * add subChains list
  * @param {Object<number,SubChain>} subChainsMap
  */
	this.addLst = function (subChainsMap) {
		for (var key in subChainsMap) {
			var subChain = subChainsMap[key];
			subChains[subChain.index] = subChain;
			subChain.setCh(_this2.index); // Assign a new chain number to the sub-chain nodes (the number of the sub-chain remains)
		}
	};
}
Chain.s_next = 1;

// ==========================================================
// Chain system

var ChainSys = function () {
	function ChainSys() {
		_classCallCheck(this, ChainSys);

		/**
   * Current chain
   * @type {Chain}
   */
		this.curCh = null;

		/**
   * Chains map
   * @type {Object<number,Chain>}
   */
		this.chains = {};
	}

	/**
  * Add node to ChainSys
  * @param {ChemNode} node
  */


	_createClass(ChainSys, [{
		key: 'addNode',
		value: function addNode(node) {
			if (!this.curCh) {
				var chain = this.curCh = new Chain();
				this.chains[chain.index] = chain;
			}
			this.curCh.addNode(node);
		}

		/**
   * Search for an existing node by coordinates in the current chain and the current sub-chain
   * @param pt
   * @returns {*}
   */

	}, {
		key: 'findByPt',
		value: function findByPt(pt) {
			return this.curCh ? this.curCh.findByPt(pt) : null;
		}

		/**
   * Close the current sub-chain and move node to the new one
   * @param {ChemNode} node
   */

	}, {
		key: 'closeSC',
		value: function closeSC(node) {
			if (this.curCh) this.curCh.closeSC(node);
		}
	}, {
		key: 'closeChain',
		value: function closeChain() {
			this.curCh = 0;
		}

		/**
   * Set current chain by node, that owns it
   * @param {ChemNode} node
   */

	}, {
		key: 'setCur',
		value: function setCur(node) {
			var ch = this.curCh = this.chains[node.ch];
			ch.setCur(ch.getSC(node.sc));
		}

		/**
   * get current sub-chain
   * @returns {SubChain|null}
   */

	}, {
		key: 'getCurSC',
		value: function getCurSC() {
			return this.curCh ? this.curCh.getCurSC() : null;
		}

		/**
   * Merge
   * sub-cain srcSc deleted from it chain
   * @param {ChemNode} srcNode
   * @param {ChemNode} dstNode
   * @param {ChemBond} bond
   */

	}, {
		key: 'merge',
		value: function merge(srcNode, dstNode, bond) {
			var nSrcCh = srcNode.ch,
			    nSrcSc = srcNode.sc,
			    nDstCh = dstNode.ch,
			    nDstSc = dstNode.sc;
			if (nSrcSc === nDstSc) return;
			var srcCh = this.chains[nSrcCh],
			    dstCh = this.chains[nDstCh];
			//srcSc = srcCh.getSC(nSrcSc),
			var dstSc = dstCh.getSC(nDstSc);

			// Для жесткой связи нужно присоединить исходную подцепь к конечной
			if (!bond.soft) {
				var pos1 = bond.calcPt();
				var delta = dstNode.pt.subx(pos1);
				dstSc.add(srcCh.delSC(nSrcSc), delta);
			}
			// Переместить все подцепи из srcCh в dstCh
			dstCh.addLst(srcCh.getLst());

			// Удалить исходную цепь
			delete this.chains[nSrcCh];
			// Сменить текущую цепь и подцепь
			this.curCh = dstCh;
			dstCh.setCur(dstSc);
		}
	}]);

	return ChainSys;
}();

exports.default = ChainSys;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Ctx = exports.Macros = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.defMacro = defMacro;
exports.scanPar = scanPar;
exports.readRealPars = readRealPars;
exports.readFormalPars = readFormalPars;
exports.execMacros = execMacros;
exports.bodyPreprocess = bodyPreprocess;
exports.preProcess = preProcess;

var _ChemSys = __webpack_require__(0);

var _ChemSys2 = _interopRequireDefault(_ChemSys);

var _ChemError = __webpack_require__(7);

var _ChemError2 = _interopRequireDefault(_ChemError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by PeterWin on 02.05.2017.
                                                                                                                                                           */


var Macros =
/**
 * @constructor
 * @param {string} name
 */
exports.Macros = function Macros(name) {
	_classCallCheck(this, Macros);

	this.name = name;
	this.body = ''; // string with @A and & instructions
};

var M1st = /[A-Z]/i; // Possible first characters of macros name
var TmParam = /^[A-Z][A-Z\d]*$/i;

// context for preprocessing

var Ctx = exports.Ctx = function () {
	/**
  * @constructor
  * @param {string|Ctx} def
  * @param {int=} pos
  */
	function Ctx(def) {
		var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		_classCallCheck(this, Ctx);

		this.src = '';
		this.dst = '';
		this.stk = [];
		this.pos = pos;
		// из другого контекста
		if (def instanceof Ctx) {
			this.src = def.src;
			this.pos = def.pos;
		} else if (typeof def === 'string') {
			this.src = def;
		}
	}

	_createClass(Ctx, [{
		key: 'err',
		value: function err(msg, pos) {
			if (pos) {
				if (pos < 0) this.pos += pos;else this.pos = pos;
			}
			throw new _ChemError2.default(msg);
		}

		/**
   * Read specified count of characters from context
   * @param {number=1} count
   * @returns {string}
   */

	}, {
		key: 'n',
		value: function n() {
			var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

			if (count === 0) return '';
			if (this.pos + count > this.src.length) this.err('Unexpected end of macros');
			var startPos = this.pos,
			    finishPos = startPos + count,
			    result = this.src.slice(startPos, finishPos);
			this.pos = finishPos;
			return result;
		}

		/**
   * Substring search
   * @param {string} needle
   * @param {boolean=} bNoErr
   * @returns {number|null}
   */

	}, {
		key: 's',
		value: function s(needle) {
			var bNoErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var curPos = this.pos,
			    needlePos = this.src.indexOf(needle, curPos);
			if (needlePos < 0) {
				if (bNoErr) return null;
				this.err('Expected ' + needle + ' character in macros');
			}
			this.pos = needlePos + needle.length;
			return curPos === needlePos ? '' : this.src.slice(curPos, needlePos);
		}

		/**
   * Is there an end?
   * @returns {boolean}
   */

	}, {
		key: 'end',
		value: function end() {
			return this.pos >= this.src.length;
		}

		/**
   * output to dst
   * @param {string} text
   */

	}, {
		key: 'w',
		value: function w(text) {
			this.dst += text;
		}

		/**
   * Write reminder of src into dst buffer
   */

	}, {
		key: 'wf',
		value: function wf() {
			this.w(this.src.slice(this.pos));
			this.pos = this.src.length;
		}
	}, {
		key: 'push',
		value: function push() {
			this.stk.push(this.dst);
			this.dst = '';
		}
	}, {
		key: 'pop',
		value: function pop() {
			var tmp = this.dst;
			this.dst = this.stk.pop();
			return tmp;
		}
	}, {
		key: 'clr',
		value: function clr() {
			this.dst = '';
		}
	}]);

	return Ctx;
}();

/**
 * Define new macro
 * name, formal params, body
 * Position of ctx must point to begin of macros name
 * if end by @;, then nothing write
 * if end by @(..., then write @name(...
 * @param ctx
 */


function defMacro(ctx) {
	var c = void 0,
	    p0 = ctx.pos,
	    name = ctx.s('('),
	    macro = new Macros(name);

	if (!M1st.test(name[0])) ctx.err('Invalid macro name', p0);

	// Reading the body of the macro
	// Parameters are read together with the body and parsed each time it is called.
	// This makes it possible to include the parameters of the parent macro in them.
	ctx.push();
	bodyPreprocess(ctx);
	macro.body = ctx.pop();

	// Analysis of the end
	c = ctx.n();
	if (c === ';') {
		// Just an ending
	} else if (c === '(') {
		// End with call macro
		ctx.w('@' + name + c);
	} else {
		ctx.err('Invalid macros end');
	}
	_ChemSys2.default.macros[name] = macro;
}

/**
 * Define the parameter boundary. The stopper is a sign , or )
 * @param {string} src
 * @param {number} pos
 * @returns {number}
 */
function scanPar(src, pos) {
	// balance of parentheses and quotes is very important
	var c = void 0,
	    lock = 0,
	    bComm = 0;
	while (pos < src.length) {
		c = src[pos];
		if (c === '"') bComm = !bComm;else if (c === '(' && !bComm) lock++;else if (c === ',' && !bComm && lock === 0) break;else if (c === ')' && !bComm) {
			if (lock > 0) lock--;else break;
		}
		pos++;
	}
	return pos;
}

/**
 * Read parameters list from context
 * @param {Ctx} ctx
 * @param {string[]} params
 * @param {number} offset
 */
function readRealPars(ctx, params, offset) {
	ctx.pos += offset;
	var ndx = 0;
	for (;;) {
		var p0 = ctx.pos,
		    p1 = scanPar(ctx.src, p0);
		if (p1 >= ctx.src.length) {
			ctx.err('Real params list is not closed');
		}
		params[ndx++] = ctx.n(p1 - p0);
		var c = ctx.n();
		if (c === ')') break;
	}
}

/**
 * Read formal parameters
 * Context position point = position of bracket + 1
 * @param {Ctx} ctx
 * @param {Object<string,string>} paramsMap
 * @param {string[]} paramsIndex
 * @param {number=} offset
 */
function readFormalPars(ctx, paramsMap, paramsIndex) {
	var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;

	ctx.pos += offset;
	for (;;) {
		var k = void 0,
		    c = void 0,
		    name = void 0,
		    posStart = ctx.pos;
		var posFinish = scanPar(ctx.src, posStart);
		if (posFinish >= ctx.src.length) ctx.err('Formal params list is not closed');

		var par = ctx.n(posFinish - posStart); // parameter declaration accepted
		k = par.indexOf(':');
		if (k < 0) {
			// without default value
			name = par;
			par = '';
		} else {
			// with default value
			name = par.slice(0, k);
			par = par.slice(k + 1);
		}

		// Check parameter name
		// Контролируем правильность описания названия параметра
		if (!TmParam.test(name)) ctx.err('Invalid parameter name: ' + (0, _ChemSys.esc)(name));

		paramsMap[name] = par;
		paramsIndex.push(name);
		c = ctx.n();
		if (c === ')') break;
	}
}

/**
 * Macros execution
 * @param {string} src	Macros with formal params without first (. For example: x,y)&x,&y
 * @param {string[]} params	Index list of actual parameters, in the text of which there can be names
 * This is done because the number of formal parameters is not known exactly before the call
 */
function execMacros(src, params) {
	var ctx = new Ctx(src);
	// extract formal parameters
	var c = ctx.n(),
	    pmap = {},
	    pndx = [];
	if (c !== ')') {
		readFormalPars(ctx, pmap, pndx);
	}
	if (pndx.length > 0) {
		var k = void 0,
		    id = void 0,
		    actualParam = void 0,
		    i = void 0,
		    j = 0;
		// Substitute the actual values
		for (i in params) {
			actualParam = params[i];
			// If the parameter starts at <param name>:..., then instead of the index, use the name
			k = actualParam.indexOf(':');
			if (k > 0) {
				id = actualParam.substring(0, k);
				if (id in pmap) {
					// Parameter found to be addressed by key
					pmap[id] = actualParam.slice(k + 1);
				}
				continue;
			}
			id = pndx[j++];
			if (actualParam) // The index parameter can be omitted if it is empty. Then the default value will be used instead
				pmap[id] = actualParam;
		}
		// Replace parameters with values
		ctx.wf();
		var chunks = ctx.dst.split('&');
		for (i = 1; i < chunks.length; i++) {
			// Looking for the most suitable parameter
			id = '';
			for (actualParam in pmap) {
				if (chunks[i].slice(0, actualParam.length) === actualParam && actualParam.length > id.length) id = actualParam;
			}
			// If there is a sign & in the formula with which no parameters are associated, skip
			if (!id) {
				chunks[i] = '&' + chunks[i];
			} else {
				// Replace a parameter with a value
				chunks[i] = pmap[id] + chunks[i].slice(id.length);
			}
		}
		// Gathering a new context ...
		ctx = new Ctx('');
		chunks.forEach(function (chunk) {
			return ctx.src += chunk;
		});
	}
	// Decrypt all macros @A()
	for (;;) {
		c = ctx.s('@', true);
		if (c === null) {
			// End of macros
			ctx.wf();
			break;
		}
		// The declaration was found. It can only be a @A
		// The other cases are filtered in bodyPreprocess
		ctx.w(c);
		var name = ctx.s('('),
		    m = _ChemSys2.default.macros[name],
		    pars = [];
		if (!m) ctx.err('Macros not found: ' + name);
		// Извлечение фактических параметров
		c = ctx.n();
		if (c !== ')') {
			readRealPars(ctx, pars, -1);
		}
		ctx.w(execMacros(m.body, pars));
	}
	return ctx.dst;
}

// Функция, которая ищет конец макроопределения. При этом, на вывод не идут объявления @:
// Конструкция @:A()...@() заменяется на @A()
// Окончание либо по концу буфера, либо по конструкции, отличающейся от @: и @A
/**
 * Search the end of macros
 * Declarations @: do not output. Instruction @:A()...@() replaced by @A()
 * @param {Ctx} ctx
 */
function bodyPreprocess(ctx) {
	var c = void 0,
	    plain = void 0;
	for (;;) {
		plain = ctx.s('@', 1);
		if (plain === null) {
			// макросов больше нет
			ctx.wf(); // пишем остаток строки и заканчиваем обработку
			break;
		}
		ctx.w(plain); // Previous text output
		c = ctx.n(); // next character
		if (c === ':') {
			// new macros declaration
			defMacro(ctx);
		} else if (M1st.test(c)) {
			// call to declared macros
			ctx.w('@' + c);
			// continue
		} else {
			// Остальные символы расцениваются как окончание тела. их разбор делает вызывающий код
			ctx.pos--;
			break;
		}
	} // for(;;)
}

/**
 * Preprocess
 * @param {string} src
 * @returns {string}
 * @throws {ChemError}
 */
function preProcess(src) {
	var ctx = new Ctx(src);
	bodyPreprocess(ctx);
	// This situation is impossible
	// if (ctx.pos !== src.length)
	//	ctx.err('Invalid preprocessor finish')

	// execute
	var dummyBody = ')' + ctx.dst;
	return execMacros(dummyBody, []);
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.dashes = dashes;
exports.dots = dots;
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
 * @param {string[]} args
 * @param {number[]} argsPos
 * @param {function} toNum
 * @returns {number[]}
 */
function dashes(args, argsPos, toNum) {
	var nextDashes = [];
	var i = void 0,
	    arg = args[0];
	if (/^[-_.\/\\<>|]+$/.test(arg)) {
		var dashFlags = 0,
		    c = void 0,
		    nu = 0,
		    nm = 0,
		    nd = 0,
		    m = void 0;
		for (i = 0; i < arg.length; i++) {
			c = arg[i];
			switch (c) {
				case '.':
					nu++;
					nm++;
					nd++;
					break;
				case '-':
					dashFlags |= 64;
					nu++;
					nm++;
					nd++;
					break;
				case '_':
					dashFlags |= 4;
					nu++;
					nm++;
					nd++;
					break;
				case '|':
					dashFlags |= nm ? 1 : 16;
					nm++;
					break;
				case '/':
					dashFlags |= nu ? 2 : 32;
					nu++;
					break;
				case '\\':
					dashFlags |= nd ? 128 : 8;
					nd++;
					break;
				case '<':
					dashFlags |= 40;
					nu++;
					nd++;
					break;
				case '>':
					dashFlags |= 130;
					break;
			}
		}
		for (i = 0, m = 1; i < 8; i++, m <<= 1) {
			if (m & dashFlags) nextDashes.push(i * 45);
		}
	} else {
		for (i in args) {
			nextDashes.push(toNum(args[i], argsPos[i]));
		}
	}
	return nextDashes;
}

var SideSyn = { U: 'T', D: 'B', u: 't', d: 'b' },
    SideMap = { R: 0x81, L: 0x18, T: 0x60, B: 0x06 },

// Битовые значения для вычёркивания лишнего. По сути = SideMap[i] ^ SubSideMap[i]
SubSideMapNeg = { Rt: 1, Bl: 2, Br: 4, Lt: 8, Lb: 16, Tr: 32, Tl: 64, Rb: 128 };

/**
 * Dots for item
 * @param {string[]} args
 * @param {number[]} argsPos
 * @param {function} toNum
 * @returns {number[]}
 */
function dots(args, argsPos, toNum) {
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
	var nextDots = [];
	var arg = args[0],
	    i = void 0;
	if (/^[!UTBDLR]+$/i.test(arg)) {
		// Старый формат
		var c = void 0,
		    s = '',
		    inv = 0,
		    map = 0,
		    m = void 0;
		for (i = 0; i < arg.length; i++) {
			c = arg[i];
			c = SideSyn[c] || c;
			if (c === '!') {
				inv = 255;
			} else if (SideMap[c]) {
				map |= SideMap[c];
				s = c;
			} else {
				s += c;
				if (SubSideMapNeg[s]) {
					map &= ~SubSideMapNeg[s];
				}
			}
		}
		map ^= inv;
		for (i = 0, m = 1; i < 8; i++, m <<= 1) {
			if (m & map) nextDots.push(22.5 + i * 45);
		}
	} else {
		// list of angles
		for (i in args) {
			nextDots.push(toNum(args[i], argsPos[i]));
		}
	}
	return nextDots;
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 01.05.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChemAgent = function () {
	function ChemAgent() {
		_classCallCheck(this, ChemAgent);

		/**
   * Nodes
   * @type {ChemNode[]}
   */
		this.nodes = [];

		/**
   * Bonds
   * @type {ChemBond[]}
   */
		this.bonds = [];

		/**
   * Commands: nodes, bonds, brackets. Order same as in description
   * Команды: узлы, связи, скобки в том порядке, в котором они следуют в описании
   * @type {Array}
   */
		this.cmds = [];

		/**
   * Quantity coefficient
   * @type {number|string}
   */
		this.n = 1;

		/**
   * Index of expression part. For expression H2 + O2 = H2O, H2 and O2 in part 0. H2O in part 1
   * Номер части выражения, в которой находится агент. Если выражение H2 + O2 = H2O, то H2=O2=0, H2O=1
   * @type {number}
   */
		this.part = 0;
	}

	_createClass(ChemAgent, [{
		key: 'walk',
		value: function walk(visitor) {
			var res = void 0,
			    cmd = void 0,
			    list = this.cmds;
			if (visitor.agentPre) {
				res = visitor.agentPre(this);
				if (res) return res;
			}
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					cmd = _step.value;

					res = cmd.walk(visitor);
					if (res) break;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			if (visitor.agentPost) res = visitor.agentPost(this) || res;
			return res;
		}
	}]);

	return ChemAgent;
}();

exports.default = ChemAgent;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chemical bond, part of agent
 * Created by PeterWin on 30.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj2 = __webpack_require__(1);

var _ChemObj3 = _interopRequireDefault(_ChemObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemBond = function (_ChemObj) {
	_inherits(ChemBond, _ChemObj);

	function ChemBond() {
		_classCallCheck(this, ChemBond);

		var _this = _possibleConstructorReturn(this, (ChemBond.__proto__ || Object.getPrototypeOf(ChemBond)).call(this));

		_this.index = null; // index of bond in ChemAgent.bonds array
		// TODO: может быть нарушена в closeAgent при удалении дублирующих связей !!!

		_this.N = 1; // multiplicity of the bond
		_this.nodes = [0, 0]; // nodes
		_this.pt = 0; // bond vector
		_this.tx = ''; // text description
		_this.slope = 0; // для связи, созданной из описания / = -1, для \ = 1, для остальных =0
		// Закомментированные поля используются, но не всегда. Для повышения производительности они инициализируются там, где они нужны
		//	this.bText = 0;	// Возможно ли текстовое представление связи
		//	this.color = 0;	// цвет связи
		//	this.w0 = 0;	// Толщина начала линии, 0 для обычной толщины, 1 для жирной
		//	this.w1 = 0;	// толщина конца линии
		//	this.bAuto = 0; // Признак связи, пригодной для автокоррекции
		//	this.soft = 0;
		//	this.style = 0;	// Строковый стиль линии. Для двойных и тройных связей каждая линия указывается отдельно
		//	this.align = 0;	// Возможные режимы выравнивания двойной связи. x:перекрещенная, m:по центру, l:влево, r:вправо
		//	this.arr0 = 0;	// Стрелка в обратную сторону
		//	this.arr1 = 0;	// Стрелка по направлению линии
		//	this.ext = 0;	// Для _o = 'o', для _s = 's'
		//	this.brk = 0;	// Устанавливается для конструкции типа -#a-#b-#c-, для связи, предшествующей существующему узлу
		return _this;
	}

	/**
  * Position calculate for second part of bond
  * @returns {Point}
  */


	_createClass(ChemBond, [{
		key: 'calcPt',
		value: function calcPt() {
			return this.nodes[0].pt.addx(this.pt);
		}

		// Получить другой узел
		/**
   * Get another node of bond
   * @param {ChemNode} node
   * @returns {ChemNode|null}
   */

	}, {
		key: 'other',
		value: function other(node) {
			var i = 0,
			    nodes = this.nodes,
			    result = void 0;
			if (nodes.length === 2) {
				result = nodes[0] === node ? nodes[1] : nodes[1] === node ? nodes[0] : null;
			} else {
				result = null;
			}
			return result;
		}
	}, {
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.bond) return visitor.bond(this);
		}
	}]);

	return ChemBond;
}(_ChemObj3.default);

exports.default = ChemBond;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ChemBrEnd = exports.ChemBrBegin = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj3 = __webpack_require__(1);

var _ChemObj4 = _interopRequireDefault(_ChemObj3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Brackets
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by PeterWin on 06.05.2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// ==================================================
// Begin of bracket

var ChemBrBegin = exports.ChemBrBegin = function (_ChemObj) {
	_inherits(ChemBrBegin, _ChemObj);

	function ChemBrBegin(text) {
		_classCallCheck(this, ChemBrBegin);

		var _this = _possibleConstructorReturn(this, (ChemBrBegin.__proto__ || Object.getPrototypeOf(ChemBrBegin)).call(this));

		_this.tx = text; // Text of open bracket
		_this.end = null; // pointer to ChemBrEnd
		_this.nodes = [null, null];
		_this.bond = null;
		return _this;
	}

	_createClass(ChemBrBegin, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.bracketBegin) return visitor.bracketBegin(this);
		}
	}]);

	return ChemBrBegin;
}(_ChemObj4.default);

ChemBrBegin.Map = { '(': ')', '[': ']', '{(': ')}' }; // Pairs of open and closed brackets

// ================================================
// End of bracket

var ChemBrEnd = exports.ChemBrEnd = function (_ChemObj2) {
	_inherits(ChemBrEnd, _ChemObj2);

	function ChemBrEnd(text, begin) {
		_classCallCheck(this, ChemBrEnd);

		var _this2 = _possibleConstructorReturn(this, (ChemBrEnd.__proto__ || Object.getPrototypeOf(ChemBrEnd)).call(this));

		_this2.begin = begin; // pointer to ChemBrBegin
		_this2.tx = text;
		_this2.n = 1;
		_this2.charge = null;
		_this2.nodes = [null, null];
		_this2.bond = null;
		return _this2;
	}

	_createClass(ChemBrEnd, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.bracketEnd) return visitor.bracketEnd(this);
		}
	}]);

	return ChemBrEnd;
}(_ChemObj4.default);

ChemBrEnd.Lst = ')]'; // Possible bracket

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chemical charge
 * Created by PeterWin on 28.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemSys = __webpack_require__(0);

var _ChemSys2 = _interopRequireDefault(_ChemSys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChemCharge = function () {
	/**
  * Attention!
  * Do not try to call the constructor directly! Use a static function ChemCharge.create()
  * @constructor
  */
	function ChemCharge() {
		_classCallCheck(this, ChemCharge);

		/**
   * Text description, for example: '2+'
   * @type {string}
   */
		this.tx = '';

		/**
   * number value, for example: 2
   * @type {number}
   */
		this.val = 0;

		/**
   * ⁺N
   * @type {boolean}
   */
		this.bLeft = false;

		/**
   * A sign of drawing a charge inside a circle
   * @type {boolean}
   */
		this.bRound = false;
	}

	/**
  * Create charge object from text description
  * @param {string} text	Examples: - + -- ++
  * @returns {ChemCharge|null}
  */


	_createClass(ChemCharge, null, [{
		key: 'create',
		value: function create(text) {

			var makeCharge = function makeCharge(value, bRound, tx) {
				var charge = new ChemCharge();
				charge.tx = tx || text;
				charge.val = +value;
				charge.bRound = !!bRound;
				return charge;
			};

			if (text && typeof text === 'string') {
				text = text.replace(/–/g, '-'); // Replace similar characters
				var len = text.length;
				if (/^-+$/.test(text)) // One or more minuses:	O^--
					return makeCharge(-len);

				if (/^\++$/.test(text)) // One or more pluses: Zn^++
					return makeCharge(len);

				if (/(^|(^[-+]))\d+$/.test(text)) // A number with a plus or minus front: S^+6, O^-2
					return makeCharge(text);

				if (/^\d+[-+]$/.test(text)) // A number with plus or minus behind: Ca^2+, PO4^3-
					return makeCharge(text.charAt(len - 1) + text.slice(0, -1));

				if (text == '+o') {
					return makeCharge(1, 1, '+');
				}
				if (text == '-o') {
					return makeCharge(-1, 1, '-');
				}
				var v = _ChemSys2.default.RomanNum[text];
				if (v) {
					text = text.toUpperCase();
					return makeCharge(v);
				}
			}
			return null;
		}
	}]);

	return ChemCharge;
}();

exports.default = ChemCharge;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Comment
 * For example "Anion"-SO4^2-
 * Created by PeterWin on 29.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemSubObj2 = __webpack_require__(3);

var _ChemSubObj3 = _interopRequireDefault(_ChemSubObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemComment = function (_ChemSubObj) {
	_inherits(ChemComment, _ChemSubObj);

	/**
  * @constructor
  * @param {string} text
  */
	function ChemComment(text) {
		_classCallCheck(this, ChemComment);

		var _this = _possibleConstructorReturn(this, (ChemComment.__proto__ || Object.getPrototypeOf(ChemComment)).call(this));

		_this.tx = text;
		return _this;
	}

	_createClass(ChemComment, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.comm) return visitor.comm(this);
		}
	}]);

	return ChemComment;
}(_ChemSubObj3.default);

exports.default = ChemComment;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Abstract component
 * For example: {R}-OH
 * Created by PeterWin on 29.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemSubObj2 = __webpack_require__(3);

var _ChemSubObj3 = _interopRequireDefault(_ChemSubObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemCustom = function (_ChemSubObj) {
	_inherits(ChemCustom, _ChemSubObj);

	/**
  * @constructor
  * @param {string} text		Text content of abstract component
  */
	function ChemCustom(text) {
		_classCallCheck(this, ChemCustom);

		var _this = _possibleConstructorReturn(this, (ChemCustom.__proto__ || Object.getPrototypeOf(ChemCustom)).call(this));

		_this.tx = text;
		return _this;
	}

	_createClass(ChemCustom, [{
		key: "walk",
		value: function walk(visitor) {
			if (visitor.custom) return visitor.custom(this);
		}
	}]);

	return ChemCustom;
}(_ChemSubObj3.default);

exports.default = ChemCustom;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chemical expression
 * Created by PeterWin on 28.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj2 = __webpack_require__(1);

var _ChemObj3 = _interopRequireDefault(_ChemObj2);

var _IsNonText = __webpack_require__(10);

var _IsNonText2 = _interopRequireDefault(_IsNonText);

var _TextMaker = __webpack_require__(5);

var _TextMaker2 = _interopRequireDefault(_TextMaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemExpr = function (_ChemObj) {
	_inherits(ChemExpr, _ChemObj);

	function ChemExpr() {
		_classCallCheck(this, ChemExpr);

		/**
   * Error
   * @type {ChemError}
   */
		var _this = _possibleConstructorReturn(this, (ChemExpr.__proto__ || Object.getPrototypeOf(ChemExpr)).call(this));

		_this.error = null;

		/**
   * Source description
   * @type {string}
   */
		_this.src0 = '';

		/**
   * Description after preprocessing
   * @type {string}
   */
		_this.src = '';

		/**
   * Entities: reagents and operations
   * @type {Array}
   */
		_this.ents = [];
		return _this;
	}

	/**
  * Check for success. If false, then an error.
  * @returns {boolean}
  */


	_createClass(ChemExpr, [{
		key: 'isOk',
		value: function isOk() {
			return !this.error;
		}

		/**
   * Extended error message. Empty string, if not error
   * @returns {string}
   */

	}, {
		key: 'getMessage',
		value: function getMessage() {
			return this.error ? this.error.getMessage() : '';
		}

		/**
   * Bypass the whole structure
   * @param {Object} visitor
   * @returns {*}
   */

	}, {
		key: 'walk',
		value: function walk(visitor) {
			var res = void 0,
			    entity = void 0,
			    entitiesList = this.ents,
			    pre = visitor.entityPre,
			    post = visitor.entityPost;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = entitiesList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					entity = _step.value;

					if (pre) res = visitor.entityPre(entity);

					res = res || entity.walk(visitor);

					if (post) res = visitor.entityPost(entity) || res;

					if (res) return res;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		/**
   * Convert expression to html
   * This shell for TextMaker visitor
   * @param {Object<string,string>} rules
   * @returns {string}
   */

	}, {
		key: 'html',
		value: function html(rules) {
			if (this.isLinear()) {
				var textMaker = new _TextMaker2.default(rules);
				this.walk(textMaker);
				return textMaker.res();
			} else {
				return '';
			}
		}

		/**
   * Convert expression to text
   * This shell for TextMaker visitor
   * @param {Object<string,string>} rules		default value='text', u can use ChemSys.rulesHTML
   * @returns {string}
   */

	}, {
		key: 'text',
		value: function text() {
			var rules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text';

			return this.html(rules);
		}

		/**
   * Get source code for object
   * (Text after preprocess)
   * @returns {string}
   */

	}, {
		key: 'getObjSrc',
		value: function getObjSrc(obj) {
			return this.src.slice(obj.pA, obj.pB);
		}

		// Является ли формула линейной (т.е. может быть представлена в виде html-текста)
		// добавлена для удобства и совместимости с предыдущей версией

	}, {
		key: 'isLinear',
		value: function isLinear() {
			var isNonText = new _IsNonText2.default();
			this.walk(isNonText);
			return !isNonText.ok;
		}
	}]);

	return ChemExpr;
}(_ChemObj3.default);

exports.default = ChemExpr;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by PeterWin on 08.05.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ChemMulEnd = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj3 = __webpack_require__(1);

var _ChemObj4 = _interopRequireDefault(_ChemObj3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Начало конструкции, умножающей последующее содержимое на указанный коэффициент
// Кроме того, является мостиком, т.е. образует новую подцепь
// example: CuSO4*5H2O
var ChemMul = function (_ChemObj) {
	_inherits(ChemMul, _ChemObj);

	function ChemMul(n) {
		_classCallCheck(this, ChemMul);

		var _this = _possibleConstructorReturn(this, (ChemMul.__proto__ || Object.getPrototypeOf(ChemMul)).call(this));

		_this.n = n;
		return _this;
	}

	_createClass(ChemMul, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.mul) visitor.mul(this);
		}
	}]);

	return ChemMul;
}(_ChemObj4.default);

// Конец множителя.
// Не участвует в выводе. Предназначен для вычислительных алгоритмов, использующих стек, чтобы выполнить pop


exports.default = ChemMul;

var ChemMulEnd = exports.ChemMulEnd = function (_ChemObj2) {
	_inherits(ChemMulEnd, _ChemObj2);

	function ChemMulEnd(begin) {
		_classCallCheck(this, ChemMulEnd);

		var _this2 = _possibleConstructorReturn(this, (ChemMulEnd.__proto__ || Object.getPrototypeOf(ChemMulEnd)).call(this));

		_this2.beg = begin;
		_this2.n = begin.n;
		return _this2;
	}

	_createClass(ChemMulEnd, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.mulEnd) visitor.mulEnd(this);
		}
	}]);

	return ChemMulEnd;
}(_ChemObj4.default);

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Node is a part of reagent.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * For example, CH3-CH2-OH contains 3 nodes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by PeterWin on 30.04.2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _Point = __webpack_require__(9);

var _Point2 = _interopRequireDefault(_Point);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChemNode = function () {
	function ChemNode() {
		var pt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _Point2.default();

		_classCallCheck(this, ChemNode);

		this.index = null; // index of node in CAgent.nodes array
		this.pt = pt; // node coordinates in subchain
		this.ch = 0; // chain number
		this.sc = 0; // subchain number
		this.bAuto = false; // auto node
		this.fixed = false; // fixed node

		/**
   * node charge
   * @type {ChemCharge}
   */
		this.charge = null;

		/**
   * Example: node CH4 contains 2 items
   * @type {ChemNodeItem[]}
   */
		this.items = [];

		/**
   * bonds, what contains this node
   * @type {ChemBond[]}
   */
		this.bonds = [];
	}

	/**
  * get number charge value
  * @returns {number}
  */


	_createClass(ChemNode, [{
		key: 'chargeVal',
		value: function chargeVal() {
			return this.charge ? this.charge.val : 0;
		}
	}, {
		key: 'walk',
		value: function walk(visitor) {
			var res = void 0,
			    i = 0,
			    lst = this.items;
			if (visitor.nodePre) {
				res = visitor.nodePre(this);
				if (res) return res;
			}
			while (i < lst.length && !res) {
				res = lst[i++].walk(visitor);
			}
			if (visitor.nodePost) res = visitor.nodePost(this) || res;
			return res;
		}
	}]);

	return ChemNode;
}();

exports.default = ChemNode;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Item of node
 * This is shell, containing internal object. Usually, ChemAtom
 * NodeItem have koefficient and charge
 * Created by PeterWin on 29.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj2 = __webpack_require__(1);

var _ChemObj3 = _interopRequireDefault(_ChemObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChemNodeItem = function (_ChemObj) {
	_inherits(ChemNodeItem, _ChemObj);

	/**
  * @constructor
  * @param {ChemSubObj} obj
  */
	function ChemNodeItem(obj) {
		_classCallCheck(this, ChemNodeItem);

		/**
   * sub object
   * @type {ChemSubObj}
   */
		var _this = _possibleConstructorReturn(this, (ChemNodeItem.__proto__ || Object.getPrototypeOf(ChemNodeItem)).call(this));

		_this.obj = obj;

		/**
   * Koefficient. Can be string for abstract component H'n'
   * @type {number|string}
   */
		_this.n = 1;

		/**
   * Charge
   * @type {number}
   */
		_this.charge = 0;

		/**
   * Special mass.
   * If specified, then ignore mass of sub object
   * @type {number}
   */
		_this.M = 0;

		//this.atomNum = 0;	//0/1 - признак вывода атомного номера (для ядерных реакций)
		//this.color = 0;	// общий цвет
		//this.atomColor = 0;	// цвет атомов
		//this.bCenter = 0;	// Необяз. признак приоритетности элемента, задаваемый при помощи обратного апострофа: H3C`O|
		//this.dots = [];
		//this.dashes = [];
		return _this;
	}

	_createClass(ChemNodeItem, [{
		key: "walk",
		value: function walk(visitor) {
			var res = void 0;
			if (visitor.itemPre) {
				res = visitor.itemPre(this);
				if (res) return res;
			}
			res = this.obj.walk(visitor);
			if (visitor.itemPost) res = visitor.itemPost(this) || res;
			return res;
		}
	}]);

	return ChemNodeItem;
}(_ChemObj3.default);

exports.default = ChemNodeItem;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ChemObj2 = __webpack_require__(1);

var _ChemObj3 = _interopRequireDefault(_ChemObj2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Chemical operation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     commentPre
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * CaCO3 --> CaO + CO2
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     commentPost
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by PeterWin on 01.05.2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var ChemOp = function (_ChemObj) {
	_inherits(ChemOp, _ChemObj);

	/**
  * @constructor
  * @param {string=} srcText, for example ->
  * @param {string=} dstText, for ex →
  * @param {boolean=false} bEq	sign of equation operation (=, ->, <=>)
  */
	function ChemOp(srcText, dstText, bEq) {
		_classCallCheck(this, ChemOp);

		var _this = _possibleConstructorReturn(this, (ChemOp.__proto__ || Object.getPrototypeOf(ChemOp)).call(this));

		_this.srcText = srcText;
		_this.dstText = dstText;
		_this.eq = !!bEq;
		//this.commentPre=0;	// ChemComment objects
		//this.commentPost=0;
		return _this;
	}

	_createClass(ChemOp, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.operation) return visitor.operation(this);
		}
	}]);

	return ChemOp;
}(_ChemObj3.default);

exports.default = ChemOp;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Chemical radical
 * Created by PeterWin on 29.04.2017.
 */


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ElemList = __webpack_require__(8);

var _ElemList2 = _interopRequireDefault(_ElemList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChemRadical = function () {
	/**
  * @constructor
  * @param {string} label
  * @param {ElemList} elemsList
  */
	function ChemRadical(label, elemsList) {
		_classCallCheck(this, ChemRadical);

		this.label = label; // radical label
		this.items = elemsList; // list of records {id,elem, n} (=ElemList)
	}

	_createClass(ChemRadical, [{
		key: 'walk',
		value: function walk(visitor) {
			if (visitor.radical) return visitor.radical(this);
		}
	}], [{
		key: 'Map',
		get: function get() {
			if (!isMapInit) {
				initMap();
			}
			return chemRadicalMap;
		}
	}]);

	return ChemRadical;
}();

//======= radicals list


exports.default = ChemRadical;
var radicals = ['Me:C,H*3', 'Et:C*2,H*5', 'Ph:C*6,H*5', 'Pr,n-Pr,Pr-n:C*3,H*7', 'iPr,i-Pr,Pr-i:C*3,H*7', 'Bu,nBu,n-Bu,Bu-n:C*4,H*9', 'i-Bu,Bu-i:C*4,H*9', 'Ac:C,H*3,C,O'];

/**
 * Radicals dictionary
 * @type {Object<string, ChemRadical>}	id=>ChemRadical
 */
var chemRadicalMap = {};

var isMapInit = false;

var initMap = function initMap() {
	isMapInit = true;
	radicals.forEach(function (descr) {
		var L = descr.split(':'),
		    elemList = new _ElemList2.default(),
		    ids = L[0].split(','),
		    elems = L[1].split(',');
		elems.forEach(function (elem) {
			var e = elem.split('*');
			elemList.addElemRec(new _ElemList.ElemRec(e[0], e[1] ? +e[1] : 1));
		});
		ids.forEach(function (id) {
			chemRadicalMap[id] = new ChemRadical(id, elemList);
		});
	});
};

/***/ })
/******/ ]);
//# sourceMappingURL=charchem.js.map