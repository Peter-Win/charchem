/**
 * Created by PeterWin on 06.05.2017.
 */

const {isAbsK} = require('../core')

/**
 * visitor for abstract items detection
 * Example
 * if (expr.walk(new IsAbstract())) alert('expr is abstract');
 * @constructor
 */
function IsAbstract() {
	const me = this
	me.ok = false
	const testK = k =>
		(me.ok = me.ok || isAbsK(k))

	// Агент и элемент узла могут иметь коэффициент ========= Скобка тоже!!!!!!!!!!
	me.agentPre = me.itemPre = me.bracketEnd = function (obj) {
		return testK(obj.n)
	}
	// Абстрактный элемент
	me.custom = function () {
		return me.ok = true
	}
}

module.exports = {IsAbstract}
