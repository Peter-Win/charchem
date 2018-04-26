/**
 * Base class for all figures
 * Created by PeterWin on 12.05.2017.
 */
'use strict'

import Point from '../../math/Point'
import Rect from '../../math/Rect'

export default class GrFigure
{
	constructor() {
		this.bounds = new Rect()
		this.org = new Point()
		//this.irc = 0;	// Внутренняя рамка используется для обозначения основного содержимого. Обычно, для текста
	}

	/**
	 * Update bounds
	 * @param {Point} pt
	 * @param {boolean} bFirst
	 * @param {number} delta
	 */
	updateBounds(pt, bFirst = false, delta = 0) {
		let deltaVec = new Point(delta, delta),
			m_bounds = this.bounds
		if (bFirst) {
			m_bounds.LT(pt.subx(deltaVec))
			m_bounds.RB(pt.addx(deltaVec))
		} else {
			m_bounds.minLT(pt.subx(deltaVec))
			m_bounds.maxRB(pt.addx(deltaVec))
		}
	}
	// Получить внутреннюю рамку. Если она не задана, то вместо неё возвращается внешняя граница
	/**
	 * get internal rectangle
	 * If not specified, then return external bounds
	 * @returns {Rect}
	 */
	getIrc() {
		return this.irc ? this.irc : this.bounds
	}
}
