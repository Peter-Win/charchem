/**
 * Created by PeterWin on 08.05.2017.
 */
'use strict'

import ChemObj from './ChemObj'

// Начало конструкции, умножающей последующее содержимое на указанный коэффициент
// Кроме того, является мостиком, т.е. образует новую подцепь
// example: CuSO4*5H2O
export default class ChemMul extends ChemObj {
	constructor(n) {
		super()
		this.n = n
	}

	walk(visitor) {
		if (visitor.mul)
			visitor.mul(this)
	}
}

// Конец множителя.
// Не участвует в выводе. Предназначен для вычислительных алгоритмов, использующих стек, чтобы выполнить pop
export class ChemMulEnd extends ChemObj {
	constructor(begin) {
		super()
		this.beg = begin
		this.n = begin.n
	}

	walk(visitor) {
		if (visitor.mulEnd)
			visitor.mulEnd(this)
	}
}

