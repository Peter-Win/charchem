/**
 * Created by PeterWin on 13.05.2017.
 */
'use strict'

import GrEllipse from '../drawSys/figures/GrEllipse'
import GrFrame from '../drawSys/figures/GrFrame'
import GrLines from '../drawSys/figures/GrLines'
import GrText from '../drawSys/figures/GrText'
import Point from '../math/Point'

/**
 * Get last item of array
 * @param {Array<T>} list
 * @returns T
 */
export const last = list =>
	list.length ? list[list.length - 1] : 0


// Номер элемента, являющегося центральным
// 1 = комментарии
// 2 = абстрактные элементы
// 3 = водород
// 4 - радикалы и все атомы, кроме C и H
// 5 - углерод
// 6 = приоритетные элементы (bCenter), помеченные обратным апострофом
const AtomPriors = { C:5, H:3, _R:4 }

/**
 * Get index of most prior item in node
 * @param {ChemNode} node
 * @returns {number}
 */
export function findCenter(node) {
	let curItemIndex = 0, bestItemIndex = 0, bestPrior = 0, curPrior
	node.walk({
		itemPre: () => {
			curPrior = 1
		},
		atom: obj => {
			curPrior = AtomPriors[obj.id] || AtomPriors._R
		},
		custom: () => {
			curPrior = 2
		},
		radical: () => {
			curPrior = AtomPriors._R
		},
		itemPost: obj => {
			if (obj.bCenter)
				curPrior = 6
			if (curPrior > bestPrior) {
				bestPrior = curPrior
				bestItemIndex = curItemIndex
			}
			curItemIndex++
		}
	})
	return bestItemIndex
}

/**
 * TODO: ?
 * @param {GrFrame} frame
 * @returns {Point}
 */
export function getTextRect(frame) {
	let figure = frame.figs[0], pt = new Point()
	if (figure) {
		pt.x = (figure.bounds.A.x + figure.bounds.B.x) / 2
		pt.y = (figure.font.descent + figure.font.ascent) / 2
	}
	return pt
}

// перпендикуляр считается от точки b вправо (если w>0)
/**                     | negVector
 *   +------------------+ dst
 *   src                | vector
 * @param {Point} srcPoint
 * @param {Point} dstPoint
 * @param {number} w	length of perpendicular vector
 * @param {number=} len	optional length of src to dst line (can be used to increase of calculation speed)
 * @returns {[Point,Point]}
 */
export function calcPerpendicularPair(srcPoint, dstPoint, w, len) {
	let vector = dstPoint.subx(srcPoint), t, negVector
	if (!len) len = vector.length()
	t = vector.x; vector.x = -vector.y; vector.y = t
	vector.muli(w / len)
	negVector = vector.mulx(-1)
	vector.addi(dstPoint)
	negVector.addi(dstPoint)
	return [vector, negVector]
}

/**
 * Calculate perpendicular to line
 * src +------------------+ dst
 *                        | w
 *                        + result
 * @param {Point} srcPoint
 * @param {Point} dstPoint
 * @param {number} w
 * @param {number=} len	Можно передать расстояние между точками, если оно известно (для повышения быстродействия)
 */
export function calcPerpendicular(srcPoint, dstPoint, w, len) {
	let vector = dstPoint.subx(srcPoint), t
	if (!len) len = vector.length()
	t = vector.x; vector.x = -vector.y; vector.y = t
	vector.muli(w / len)
	return vector.addi(dstPoint)
}

/**
 *               \D
 * -------------L->
 *               /
 * @param {Point} p0
 * @param {Point} p1
 * @param L
 * @param D
 * @param color
 * @param lineWidth
 * @returns {GrLines}
 */
export function makeArrow(p0, p1, L, D, color, lineWidth) {
	let d = p0.subx(p1),
		len = d.length(), pair,
		fig = new GrLines(color, lineWidth),
		c = p1.clone()
	d.muli(L / len).addi(p1)
	pair = calcPerpendicularPair(p1, d, D, L)
	fig.add(c); fig.add(pair[0])
	fig.add(c, 1); fig.add(pair[1])
	return fig
}

//=========== Вывод заряда узла или скобки

// charge: ChemCharge, не должен быть пуст!
// return: фигура без позиционирования
/**
 * Make picture for node or bracket charge
 * @param {ChemCharge} charge	Must be valid ChemCharge object
 * @param {string} style
 * @param {number} lineWidth
 * @returns {GrFrame}
 */
export function makeCharge(charge, style, lineWidth) {
	let text = charge.tx, fig, w, wh
	if (text === '-' || text === '+') {
		// Специальный вариант для - и +
		fig = new GrLines(style.col, lineWidth)
		fig.cap = 'square'
		fig.addA([0, 0, 1, w = style.fnt.textWidth('-'), 0, 0])
		if (text === '+') {
			wh = w / 2
			fig.addA([wh, -wh, 1, wh, wh, 0])
		}
		fig.bounds.grow(lineWidth)
		fig.yt = fig.bounds.A.y
		fig.yb = fig.bounds.B.y
	} else {
		fig = new GrText(charge.tx, style.fnt, style.col)
		fig.yt = fig.font.descent
		fig.yb = fig.font.ascent
	}
	if (!charge.bRound) {	// если нет круговой границы - возвращаем просто текст
		return fig
	}
	let frame = new GrFrame(),
		h = Math.max(fig.bounds.W(), fig.yb - fig.yt) + lineWidth * 4,
		r = new GrEllipse(h - lineWidth * 2, h - lineWidth * 2, 0, style.col, lineWidth)
	r.org.init(lineWidth, lineWidth)
	fig.org.x = -fig.bounds.A.x + (h - fig.bounds.W()) / 2
	fig.org.y = -fig.yt + (h - (fig.yb - fig.yt)) / 2
	frame.addFig(r, 1)
	frame.addFig(fig, 1)
	frame.update()
	frame.yt = 0
	frame.yb = h
	return frame
}

/**
 * Draw charge of node
 * @param {ChemCharge} charge
 * @param {GrFrame} frame
 * @param {ChemGrProps} props
 */
export function drawNodeChargeEx(charge, frame, props, curItemColor, lineWidth) {
	if (!charge)
		return
	let lastFr = last(frame.frames),
		style = props.getStyleCol('NodeCharge', curItemColor),
		fig = makeCharge(charge, style, lineWidth)
	frame.add(fig)
	if (charge.bLeft) {
		fig.org.x = frame.bounds.A.x - fig.bounds.W() 
	} else {
		fig.org.x = lastFr.org.x + lastFr.ir
	}
	fig.org.x -= fig.bounds.A.x
	let h = fig.yb - fig.yt
	fig.org.y = frame.bounds.A.y + lastFr.it - fig.yt - h * props.supKY
	frame.update()
}

