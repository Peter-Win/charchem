/**
 * Chemical bond, part of agent
 * Created by PeterWin on 30.04.2017.
 */
'use strict'

import ChemObj from './ChemObj'

export default class ChemBond extends ChemObj
{
	constructor() {
		super()
		this.index = null	// index of bond in ChemAgent.bonds array
		// TODO: может быть нарушена в closeAgent при удалении дублирующих связей !!!

		this.N = 1	// multiplicity of the bond
		this.nodes = [0, 0]	// nodes
		this.pt = 0		// bond vector
		this.tx = ''	// text description
		this.slope = 0 // для связи, созданной из описания / = -1, для \ = 1, для остальных =0
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
	}

	/**
	 * Position calculate for second part of bond
	 * @returns {Point}
	 */
	calcPt() {
		return this.nodes[0].pt.addx(this.pt)
	}

	// Получить другой узел
	/**
	 * Get another node of bond
	 * @param {ChemNode} node
	 * @returns {ChemNode|null}
	 */
	other(node) {
		let i = 0, nodes = this.nodes, result
		if (nodes.length === 2) {
			result = nodes[0] === node ? nodes[1] : (nodes[1] === node ? nodes[0] : null)
		} else {
			result = null
		}
		return result
	}

	walk(visitor) {
		if (visitor.bond)
			return visitor.bond(this)
	}

}
