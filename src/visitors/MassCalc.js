/**
 * Created by PeterWin on 07.05.2017.
 */
'use strict'

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

class MassCalc {
	constructor() {
		this.list = []
		this.stack = [0]
		this.itemPre = this.bracketBegin = this.mul = this.enter
		this.itemPost = this.bracketEnd = this.leave
	}

	// Список масс. Если визитор использован для выражения, то для каждого агента будет своя масса. Иначе в списке один элемент.
	/**
	 * List of mass each agent of expression
	 * @returns {number[]} list of mass values
	 */
	getList() {
		return this.list.length ? this.list : this.stack
	}

	// Сумма всех масс.
	// Штатный метод для тех случаев, когда масса ожидается в виде одного числа
	/**
	 * Calculate total mass of expression
	 * @returns {number} mass summa
	 */
	getSum() {
		return this.getList().reduce((acc, mass) => acc + mass, 0)
	}

	//--------- internal handlers
	atom(obj) {
		this.stack[0] += obj.M
	}

	radical(obj) {
		let list = obj.items, j = 0, rec
		for (; j < list.length; j++) {
			rec = list[j]
			this.stack[0] += rec.elem.M * rec.n
		}
	}

	enter() {
		this.stack.unshift(0)
	}
	leave(obj) {
		let m = this.stack.shift()
		if (obj.M) m = obj.M	// Если масса явно указана для элемента ($M), то собственная масса подчинённого объекта игнорируется
		m *= obj.n	// Умножить массу на количественный коэффициент при элементе
		this.stack[0] += m
	}
	mulEnd(obj) {
		let m = this.stack.shift()
		m *= obj.beg.n	// Умножить массу на количественный коэффициент, указанный при объявлении мультипликатора
		this.stack[0] += m
	}

	agentPost() {
		this.list.push(this.stack[0])
		this.stack = [0]
	}
}

module.exports = {MassCalc}