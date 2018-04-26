/**
 * Created by PeterWin on 13.05.2017.
 */
'use strict'

import ChemSys from '../ChemSys'
import GrEllipse from '../drawSys/figures/GrEllipse'
import GrFrame from '../drawSys/figures/GrFrame'
import GrLines from '../drawSys/figures/GrLines'
import GrText from '../drawSys/figures/GrText'
import Point from '../math/Point'
import Rect from '../math/Rect'
import {
	last,
	findCenter,
	getTextRect,
	makeArrow,
	makeCharge,
	drawNodeChargeEx,
	calcPerpendicular,
	calcPerpendicularPair
} from './utils'
import { BSplineExt, createBSpline } from '../drawSys/figures/bspline'

/**
 * Build graphics
 * @param {ChemExpr} formula
 * @param {DrawSys} drawSys
 * @param {ChemGrProps} props
 * @returns {GrFrame}
 */
export function chemGrBuilder(formula, drawSys, props) {

	let stdStyle = props.stdStyle,
		scale = props.line,	// коэффициент для преобразования мировых координат в экранные
		lineWidth = props.lineWidth || 1,
		lineWidth2 = lineWidth * 2,
		mainFrame = new GrFrame(),
		entityFrames = [],
		agentFrame,
		/**
		 * @type {GrFrame[]}
		 */
		nodesFrList,	// список фреймов для узлов. соответствуют по node.index
		nodeFrame,
		bAutoNode,
		curItemFrame,
		curColor = stdStyle.col,
		colorStack = [],
		curItemColor,
		curAtomColor,
		/**
		 * L: list of nodes
		 * S: set of sub-chain indexes
		 * @type {{L:ChemNode[],S:Object}[]}
		 */
		groups = []	// Группы подцепей. Описание группы: L=[nodes], S={sc:1}

	/**
	 * Get color of object
	 * @param {Object} obj
	 * @returns {string}
	 */
	const getColor = obj => obj.color || curColor

	const getBracketWidth = () => lineWidth * 7

	const getNodeFrame = node => nodesFrList[node.index]

	function drawArrow(p0, p1, color, frame) {
		frame.addFig(makeArrow(p0, p1, props.arrowL, props.arrowD, color || curColor, lineWidth))
	}

	const drawNodeCharge = (charge, frame) =>
		drawNodeChargeEx(charge, frame, props, curItemColor, lineWidth)

	// Подготовить фигуру заряда скобки
	const prepareBracketCharge = (preObj, charge, color, bLeft) => {
		if (!charge || (charge.bLeft ^ bLeft))
			return 0
		let style = props.getStyleCol('NodeCharge', color),
			fig = makeCharge(charge, style, lineWidth)
		preObj.cf = fig
		preObj.cl = bLeft
		return fig.bounds.W()
	}

	/**
	 * Draw charge of bracket
	 * @param {{cf,cl}} preObj
	 * @param {GrFigure} bracketFig
	 * @param {boolean} bLeft
	 */
	function drawBracketCharge(preObj, bracketFig, bLeft) {
		let fig = preObj.cf
		if (fig) {
			if (bLeft) {
				// Заряд слева
				fig.org.x = bracketFig.org.x + bracketFig.bounds.A.x - fig.bounds.B.x - lineWidth
			} else {
				// Заряд справа
				fig.org.x = bracketFig.org.x + bracketFig.bounds.B.x + fig.bounds.A.x + lineWidth
			}
			fig.org.y = bracketFig.org.y + bracketFig.bounds.A.y - fig.bounds.A.y - fig.yt
				- props.bracketSupKY * (fig.yb - fig.yt)
			agentFrame.add(fig)
		}
	}

	///============ sub-chains

	const findGroupIndex = subChainIndex => {
		let i = 0, N = groups.length
		while (i < N && !groups[i].S[subChainIndex]) i++
		return i === N ? -1 : i
	}

	const addNodeToSubChain = node => {
		let subChainIndex = node.sc,
			i = findGroupIndex(subChainIndex)
		if (i < 0) {
			// create new group
			groups.push({ L:[node], S:{ [subChainIndex]:1 } })
		} else {
			groups[i].L.push(node)
		}
	}

	//--------- Подсистема мостиков

	let preObjects = []	// предварительно обработанные объекты

	// Получить точку стыковки мостика с фреймом исходного узла
	const getSrcPoint = (frame, bReverse) =>
		frame.org.addx(frame.bounds[bReverse ? 'A' : 'B'].x, 0)

	const getDstPoint = (frame, bReverse) =>
		getSrcPoint(frame, !bReverse)

	// Склеить подцепи
	function compactSubChains(agent) {

		preObjects.length = 0
		let delta = new Point(),	// суммарный Вектор смещения мостиков между фреймами узлов
			srcNode = 0, dstNode,	// Узлы для сращивания групп
			srcFrame, dstFrame,
			index,
			prevBrackets = [],
			cmds = agent.cmds

		function createObj(width) {
			let obj = { x:delta.x, y:delta.y, f0:srcFrame, f1:dstFrame, w:width }
			return preObjects[index] = obj
		}

		function setPoints(obj) {
			srcNode = obj.nodes[0]
			dstNode = obj.nodes[1]
			srcFrame = getNodeFrame(srcNode)
			dstFrame = getNodeFrame(dstNode)
		}


		function mergeGroups() {
			let srcIndex = findGroupIndex(srcNode.sc),
				dstIndex = findGroupIndex(dstNode.sc)
			if (srcIndex === dstIndex || srcIndex < 0 || dstIndex < 0)
				return
			let
				srcGroup = groups[srcIndex],
				dstGroup = groups[dstIndex],
				i, node, frame
			for (i in dstGroup.S)
				srcGroup.S[i] = 1

			let	bNeg = delta.x < 0,
				dstPt = getSrcPoint(srcFrame, bNeg).addx(delta)
			let dstOffs = getDstPoint(dstFrame, bNeg).negi().addi(dstPt)
			for (i in dstGroup.L) {
				node = dstGroup.L[i]
				srcGroup.L.push(node)	// Переместить узел из одной группы в другую
				frame = getNodeFrame(node)
				frame.org.addi(dstOffs)
			}
			groups.splice(dstIndex, 1)	// Удалить группу
		}

		function onOpenBracket(bracket) {
			let i, obj, width = getBracketWidth(),
				chargeWidth,
				bond = bracket.bond
			setPoints(bond || bracket)
			obj = createObj(width)
			// Нужно добавить ширину заряда, если у него признак bLeft
			obj.cw = chargeWidth = prepareBracketCharge(obj, bracket.end.charge, getColor(bracket), 1)
			width += chargeWidth

			if ((!bond && !srcNode) || (bond && !bond.soft)) {
				// Скобка в начале агента: (CH3)3C-OH
				prevBrackets.push(obj)
				for (i in prevBrackets) {
					prevBrackets[i].x -= width
				}
				obj.f0 = 0
			} else {
				delta.x += width
			}
		}

		function onCloseBracket(bracket) {
			// Вычисление габаритов
			let width = getBracketWidth(),
				bond = bracket.bond,
				koeff, chargeWidth, koeffWidth = 0
			setPoints(bond || bracket)

			if (bracket.n !== 1) {
				let style = props.getStyleCol('BracketCnt', bracket.color)
				koeff = new GrText(bracket.n, style.fnt, style.col)
				koeffWidth += koeff.bounds.W()
			}

			let obj = createObj(width)
			obj.k = koeff
			// Нужно добавить ширину заряда
			obj.cw = chargeWidth = prepareBracketCharge(obj, bracket.charge, getColor(bracket))

			// вычислить габариты внутренней области скобки
			let i = index - 1, open = 0, commonRect = new Rect()
			while (i >= 0 && !open) {
				cmds[i].walk({
					bracketBegin: function (obj) {
						if (obj.end === bracket) {
							open = obj
							preObjects[index].yt = preObjects[i].yt = commonRect.A.y
							preObjects[index].yb = preObjects[i].yb = commonRect.B.y
						}
					},
					nodePre: function (obj) {
						let frame = getNodeFrame(obj),
							rc = frame.bounds.clone()
						rc.move(frame.org)
						if (rc.is0()) { // Для автоузлов
							rc.grow(scale * .2) // Расширить рамку узла. Основной критерий - скобки не должны быть вплотную к узлу
							// кроме того, для пустой рамки неправильно срабатывает Rect.unite
						}
						commonRect.unite(rc)
					}
				})
				i--
			}

			// rightMargin - расстояние от правого края фрейма внутреннего узла скобки до правого края вычисленной внутренней области скобки
			// leftMargin - расстояние от левого края внутренней области скобки до левого края первого узла внутри скобок
			let rightMargin = commonRect.B.x - (srcFrame.org.x + srcFrame.bounds.B.x),
				startFrame = getNodeFrame(open.nodes[1]),
				leftMargin = startFrame.org.x + startFrame.bounds.A.x - commonRect.A.x

			//agentFrame.addFig(makeGrRect(commonRect.A, commonRect.B, 'red',1));
			//agentFrame.addFig(makeGrRect(commonRect.A, commonRect.LB().addx(leftMargin,0), 'green',2));

			if (!Point.is0(leftMargin)) {
				let i0 = i + 1
				// для каждого узла внутри скобок сдвинуть его вправо на leftMargin
				// Если нет мостика между внутренней и внешней частью скобки, то сдвигать нельзя,
				// т.к. узлы внутри и снаружи в одной подцепи
				if (bond && bond.soft) {
					for (i += 2; i < index; i++) {
						cmds[i].walk({
							nodePre: function (obj) {
								let frm = getNodeFrame(obj)
								frm.org.x += leftMargin
							}
						})
					}
				}
				if (!(open.bond && open.bond.soft)) {
					preObjects[i0].x -= leftMargin
				}
			}

			if (dstNode && (!bond || !bond.soft)) {
				// требуется сдвинуть группу
			}
			let dx = Math.max(koeffWidth, chargeWidth) + rightMargin
			delta.x += width + dx
			obj.x += rightMargin
		}

		function isNode(cmd) {
			return cmd.walk({
				nodePre: () => 1
			})
		}

		function onMul(mul) {
			// Создать мостик между двумя соседними узлами
			let left, right, figMul, figK = 0, style
			left = right = +index
			while (left >= 0 && !isNode(cmds[left])) left--
			while (right < cmds.length && !isNode(cmds[right])) right++
			if (left < 0 || right >= cmds.length)
				return
			setPoints({ nodes:[cmds[left], cmds[right]] })
			// фигура - знак умножения. всегда
			style = props.getStyleCol('std', curColor)
			figMul = new GrText(props.$MulChar || '*', style.fnt, style.col)
			// фигура - множитель. только если не равен 1
			if (mul.n !== 1) {
				style = props.getStyleCol('MultiK', curColor)
				figK = new GrText(mul.n, style.fnt, style.col)
				figK.org.x -= figK.bounds.W()	// Сдвинуть на ширину влево, чтобы при выводе прицепиться к фрейму f1.bounds.A
			}
			// ширина = opSpace + Mul + opSpace [+ Koeff]
			let obj, spc = props.opSpace, w = spc * 2 + figMul.bounds.W()
			if (figK) w += figK.bounds.W()
			figMul.org.x += spc
			figMul.org.y -= figMul.font.descent + (figMul.font.ascent - figMul.font.descent) / 2
			obj = createObj(w)
			obj.m = figMul	// фигуры будут выведены в drawMul
			obj.k = figK
			obj.s = spc
			delta.x += w
		}

		function clearNode() {
			prevBrackets.length = 0
			if (srcNode) {
				mergeGroups()
				srcNode = 0
			}
		}

		let brk = 0

		function onBond(bond) {
			clearNode()
			if (brk)
				delta.init(0, 0) // предыдущая связь была помечена, как конец мостика
			brk = bond.brk
			if (!bond.soft)
				return

			setPoints(bond)
			let
				srcGroupIndex = findGroupIndex(srcNode.sc),
				dstGroupIndex = findGroupIndex(dstNode.sc)

			if (srcGroupIndex === dstGroupIndex)
				return	// TODO: здесь не учитываются скобки!!!

			let obj = createObj(),
				bNeg = bond.pt.x < 0
			//srcPt = getSrcPoint(srcFrame, bNeg).addi(delta);
			// Если связь слева направо, то ищем правый край
			let dir = obj.d = new Point(bond.pt.x * props.horizLine, bond.pt.y * scale * (bNeg ? -1 : 1))

			delta.addi(dir)

		}

		// Пройти по всем командам агента и найти те, которые соединяют подцепи
		for (index in cmds) {
			cmds[index].walk({
				bond: onBond,
				bracketBegin: onOpenBracket,
				bracketEnd: onCloseBracket,
				mul: onMul,
				nodePre: () => {
					clearNode()
					delta.init(0, 0)
				}
			})
		}
		clearNode()
	} // compactSubChains

	// Вычислить графическую толщину линии по атрибутам связи w0, w1
	function bondWidth(w) {
		if (!w)
			return lineWidth
		if (w === 1)
			return props.thickWidth
		// Попытка вычислить нужную толщину
		return lineWidth + (props.thickWidth - lineWidth) * w
	}
	function createBondFigure(bond, color, width) {
		let fig = new GrLines(color || getColor(bond), width || bondWidth(bond.w0) )
		fig.cap = 'round'
		fig.join = 'round'
		return fig
	}

	// BondHead - подсистема объединения вывода связей в одну фигуру
	// Сюда попадают только лнии для связей с w0==w1
	let bondHeapLines = [] // состоит из кусков {b,k,p}. bond (first), key=color:width, points list
	function makeBondHeadKey(bond, width) {
		if (width === undefined) width = bond.w0 || 0
		return getColor(bond) + ':' + width
	}
	function endBondHeap() {
		let i, j, piece, points, fig
		for (i in bondHeapLines) {
			piece = bondHeapLines[i]
			points = piece.p
			fig = createBondFigure(piece.b, 0, piece.w)
			for (j in points) {
				fig.add(points[j])
			}
			agentFrame.addFig(fig)
		}
		bondHeapLines.length = 0
	}
	function addToBondHeap(a, b, bond, width) {
		// искать подходящий конец
		let i = 0, n = bondHeapLines.length, piece, points, end,
			key = makeBondHeadKey(bond, width)
		while (i < n) {
			piece = bondHeapLines[i]
			if (piece.k === key) {
				points = piece.p
				end = last(points)
				if (end.equals(a)) {
					points.push(b)
					break
				} else if (end.equals(b)) {
					points.push(a)
					break
				} else if (points[0].equals(a)) {
					points.unshift(b)
					break
				} else if (points[0].equals(b)) {
					points.unshift(a)
					break
				}
			}
			i++
		}
		if (i === n) {
			// Новый конец
			bondHeapLines.push({ b:bond, k:key, w:width, c:getColor(bond), p:[a, b] })
		}
	}

	function drawSolidBond(p0, p1, bond, width) {
		// TODO: в том случае, когда к графическим объектам нужно прикреплять их исходные хим. объекты, линии не склеиваются
		addToBondHeap(p0, p1, bond, width)
	}

	// Расширяющаяся связь (w+, w-)
	function drawWideBond(p0, p1, bond) {
		let fig = new GrLines(),
			bpair = calcPerpendicularPair(p0, p1, props.thickWidth / 2)
		fig.fillColor = getColor(bond)
		fig.add(p0)
		fig.add(bpair[0])
		fig.add(bpair[1])
		if (props.lineWidth) {
			fig.join = 'round'
			fig.color = fig.fillColor
			fig.width = lineWidth
			fig.add(p0)
		}
		agentFrame.addFig(fig)
	}

	// толстая связь из поперечных штрихов (d2)
	function drawDashedThickBond(p0, p1, bond) {
		let fig = createBondFigure(bond, 0, lineWidth),
			delta = props.thickWidth / 2,
			len = p0.dist(p1),
			bpair = calcPerpendicularPair(p0, p1, delta, len),
			apair = calcPerpendicularPair(p1, p0, -delta, len),
			i = 0, n = Math.floor(len / props.hatch) + 1,
			ar = apair[0], dr = bpair[0].subi(ar).muli(1 / len),
			al = apair[1], dl = bpair[1].subi(al).muli(1 / len),
			ri, li, k = len / n, d, n2 = k / 2
		for (; i < n; i++) {
			d = i * k + n2
			ri = dr.mulx(d).addi(ar)
			li = dl.mulx(d).addi(al)
			fig.add(ri, 1)
			fig.add(li)
		}
		agentFrame.addFig(fig)
	}

	// расширяющаяся связь, стотоящая из поперечных чёрточек d+, d-
	function drawDashedWideBond(p0, p1, bond) {
		let fig = createBondFigure(bond),
			bpair = calcPerpendicularPair(p0, p1, props.thickWidth / 2),
			apair = calcPerpendicularPair(p1, p0, lineWidth / 2),
			ar = apair[1], al = apair[0],
			br = bpair[0], bl = bpair[1],
			// Движемся от широкого конца к узкому, т.к. последний штрих обячно выводится раньше, чем достигнут конец
			dr = ar.subi(br), dl = al.subi(bl),	// точки a нам больше не нужны
			rlen = dr.length(), llen = dl.length(),
			hatch = props.hatch,
			i = 0, n = Math.floor((rlen + llen) / 2 / hatch),
			// i--n; d---xlen  => d =i*xlen/n = i*kx
			k = 1 / n,
			li, ri
		for (; i < n; i++) {
			ri = dr.mulx(i * k).addi(br)
			li = dl.mulx(i * k).addi(bl)
			fig.add(ri, 1)
			fig.add(li)
		}
		agentFrame.addFig(fig)
	}

	// Связь, изображаемая продольными чёрточками (S:, H)
	function drawDashedMonoBond(p0, p1, bond) {
		// Общее число отрезков: n. Число всегда нечётное.
		let fig,
			d = p1.subx(p0),
			len = d.length(),
			dash = props.dash,
			i = 0, n, a, b
		if (len < dash * 2) {	// Отрезок слишком короткий, чтобы выводиться прерывистой линией
			return addToBondHeap(p0, p1, bond)
		}
		n = Math.floor(len / dash)
		if (!(n & 1)) n++	// нечёт
		dash = len / n	// Уточнённая длина штриха
		fig = createBondFigure(bond)
		for (; i < n; i += 2) {
			a = d.mulx(i * dash / len).addi(p0)
			b = d.mulx((i + 1) * dash / len).addi(p0)
			fig.add(a, 1)
			fig.add(b)
		}
		agentFrame.addFig(fig)
	}

	// волнистая линия
	function drawWaveLine(p0, p1, bond) {
		let fig = createBondFigure(bond, 0, lineWidth),
			k, a = p0, b, c1, c2,
			d = p1.subx(p0), len = d.length(),
			Amp = scale / 8, // Амплитуда = длина единичной линии / 6
			step = scale / 6,
			NSegs = Math.floor((len + step / 2) / step), // Число сегментов - целое число
			//vs=d.mulx(step/len),
			va = d.mulx(Amp / len) // Вектор, направленный вдоль основной оси с длиной = амплитуде
		len /= NSegs // Длина одного сегмента
		d.muli(1 / NSegs) // Теперь длина v равна длине сегмента
		fig.add(a)
		for (k = 0; k < NSegs; k++) {
			b = a.addx(d)
			if ((k & 1) === 0)
				c1 = a.addx(va.y, -va.x)
			else
				c1 = a.addx(-va.y, va.x)
			c2 = c1.addx(d)
			fig.add(c1, 2)
			fig.add(c2, 2)
			fig.add(b)
			a = b
		}
		agentFrame.addFig(fig)
	}

	function _drawBond(bond, p0, p1) {
		// определить стиль связи
		let styleEx = '|', N = bond.N
		if (bond.style) {
			styleEx = bond.style
		} else {
			if (N === 0) styleEx = 0
			else if (N === 2) {
				styleEx =  bond.w0 ? 'II' : '||'
			} else if (N === 3) {
				styleEx = '|||'
			}
		}
		if (!styleEx)	// невидимая связь
			return
		if (styleEx === '~') {
			return drawWaveLine(p0, p1, bond)
		}
		if (styleEx === '|') {
			// линии могут оказаться концы разной ширины
			if (bond.w0 || bond.w1) {
				if (bond.w0 === 0 && bond.w1 === 1) {
					drawWideBond(p0, p1, bond)	// w+
				} else if (bond.w0 === 1 && bond.w1 === 0) {
					drawWideBond(p1, p0, bond)	// w-
				} else if (bond.w0 === 0 && bond.w1 === -1) {
					drawDashedWideBond(p0, p1, bond)	// d+
				} else if (bond.w0 === -1 && bond.w1 === 0) {
					drawDashedWideBond(p1, p0, bond)	// d-
				} else if (bond.w0 > 0 && bond.w0 === bond.w1) {
					drawSolidBond(p0, p1, bond) // вывод толстой линии
				} else if (bond.w0 < 0 && bond.w0 === bond.w1) {
					drawDashedThickBond(p0, p1, bond) // d2
				}
			} else {
				drawSolidBond(p0, p1, bond)
			}
			return
		}

		function getStyleWidth(style) {
			return style === 'I' ? props.thickWidth : lineWidth
		}
		// Вывод линии указанным стилем
		function drawStyleBond(p0, p1, style, bond) {
			if (style === 'I') {
				drawSolidBond(p0, p1, bond, getStyleWidth(style))
			} else if (style === ':') {
				drawDashedMonoBond(p0, p1, bond)
			} else if (style !== '0') {	// все остальные стили, кроме 0, выводятся прямой линией
				drawSolidBond(p0, p1, bond, lineWidth)
			}
		}

		// Нужно ли делать отступ для внутренней линии, чтобы она была короче внешней
		function isPadding(side) {
			let node = bond.nodes[side]
			// Узел должен быть автоматическим и иметь более одной связи
			return node.bAuto && node.bonds.length > 1
		}

		// Поиск смещения
		// 0 - не смещать, 1 - смещать вправо, -1 - смещать влево
		function findAlign() {
			if (bond.cross)
				return 0	// Для перекрещенных линий выравнивание не применяется
			function alignSide(n0, n1) {
				let p0 = getNodeFrame(n0).org,
					p1 = getNodeFrame(n1).org,
					a = p1.subx(p0),
					b, p2, sa, node, sign, bonds = n1.bonds,
					minSign = 100, maxSign = -100
				bonds.forEach(bond_i => {
					let bSingle = (bond_i.style && bond_i.style.length === 1) || bond_i.N === 1
					// Несколько спорное предположение, что прилегающая связь должна именть кратность =1
					if (bSingle && (node = bond_i.other(n1))) {
						if (node !== n0) {
							p2 = getNodeFrame(node).org
							b = p2.subx(p0)
							sa = a.x * b.y - b.x * a.y
							if (sa > 0) sign = -1
							else if (sa < 0) sign = 1
							else sign = 0
							minSign = Math.min(minSign, sign)
							maxSign = Math.max(maxSign, sign)
						}
					}
				})
				if (minSign === 100)
					minSign = maxSign = 0
				return [minSign, maxSign]
			}
			let nodes = bond.nodes,
				as = alignSide(nodes[0], nodes[1]),
				bs = alignSide(nodes[1], nodes[0]),
				res = 0,
				as0 = as[0], bs0 = bs[0]

			if (as0 && as0 === as[1]) {
				// точка A имеет прилегающую связь с одной стороны
				// Значит смещение нужно провести, если B имеет прилегающую связь с этой же стороны
				// PS. Но для одинаковых сторон знаки противоположны!
				if (as0 > 0 && bs0 < 0)
					res = -1
				else if (as0 < 0 && bs[1] > 0)
					res = 1
				else if (!bs0 && !bs[1]) {
					// Вариант, когда с одной стороны связи нет вообще, а с другой есть в одну сторону: _(A-30,N2)_(A30)
					res = -as0
				}
			} else if (bs0 && bs0 === bs[1]) {
				if (bs0 < 0 && as[1] > 0)
					res = -1
				else if (bs0 > 0 && as0 < 0)
					res = 1
				else if (!as0 && !as[1]) {
					// Вариант, когда с одной стороны связи нет вообще, а с другой есть в одну сторону: _(A-30)_(A30,N2)
					res = bs0
				}
			}
			// Если оба конца двойной связи имеют разветвления, тогда возможен более сложный алгоритм
			// поиска внешней стороны путём трассировки графа для поиска циклов
			// простой вариант: 1,2-дихлорбензол
			return res
		}
		let sn = styleEx.length,
			len = p0.dist(p1)
		if (sn === 2) { // двойная связь
			let
				// режим выравнивания может быть указан персонально для связи или вычислен, если установлен flDblAlign
				alignMode = bond.align,
				align = 0,
				cross = 0
			switch (alignMode) {
			case 'x':	// пересечение
				cross = 1; break
			case 'l':	// выравнивание влево
				align = -1; break
			case 'r':	// выравнивание вправо
				align = 1; break
			case 'm':
				break	// выравнивание по середине
			default:	// автоматический поиск режима выравнивания по соседним связям, если задан flDblAlign
				align = props.flDblAlign && findAlign()
			}

			let wr = getStyleWidth(styleEx[0]), wl = getStyleWidth(styleEx[1]),
				space = props.lineSpace2, ar, al, br, bl, d, offsL, offsR
			switch (align) {
			case -1:	// Смещение влево
				ar = p0
				br = p1
				offsL = space + (wr + wl) / 2
				bl = calcPerpendicular(p0, p1, -offsL, len)
				al = calcPerpendicular(p1, p0, offsL, len)
					// отступ для внутренней линии (чтобы она была короче внешней
				d = bl.subx(al).muli(offsL / len)
				if (isPadding(0)) al.addi(d)	// Отступы не делаются, если узел на конце
				if (isPadding(1)) bl.subi(d)
				break
			case  1:	// Смещение вправо
				al = p0
				bl = p1
				offsR = space + (wr + wl) / 2
				br = calcPerpendicular(p0, p1, offsR, len)
				ar = calcPerpendicular(p1, p0, -offsR, len)
				d = br.subx(ar).muli(offsR / len)
				if (isPadding(0)) ar.addi(d)
				if (isPadding(1)) br.subi(d)
				break
			default:
				offsR = (space + wr) / 2
				offsL = (space + wl) / 2
				br = calcPerpendicular(p0, p1, offsR, len)
				bl = calcPerpendicular(p0, p1, -offsL, len)
				ar = calcPerpendicular(p1, p0, -offsR, len)
				al = calcPerpendicular(p1, p0, offsL, len)
			}
			// TODO: cross not used!
			drawStyleBond(ar, br, styleEx[0], bond)
			drawStyleBond(al, bl, styleEx[1], bond)
		} else if (sn === 3) { // тройная связь
			let space = props.lineSpace3,
				wl = getStyleWidth(styleEx[2]),
				wm = getStyleWidth(styleEx[1]),
				wr = getStyleWidth(styleEx[0]),
				offsL = space + (wl + wm) / 2,
				offsR = space + (wr + wm) / 2,
				br = calcPerpendicular(p0, p1, offsR, len),
				bl = calcPerpendicular(p0, p1, -offsL, len),
				ar = calcPerpendicular(p1, p0, -offsR, len),
				al = calcPerpendicular(p1, p0, offsL, len)
			drawStyleBond(al, bl, styleEx[2], bond)
			drawStyleBond(p0, p1, styleEx[1], bond)
			drawStyleBond(ar, br, styleEx[0], bond)
		} else {
			drawStyleBond(p0, p1, styleEx, bond)
		}
	}

	// Тр>етий этап вывода агента - вывод связей и других компонент, требующих финального положения узлов.
	function drawPostNodes(agent) {
		let index, cmds = agent.cmds

		// Вывод химической связи, объединяющей более двух узлов
		function drawBondPoly(bond) {
			let nodes = bond.nodes, n = nodes.length
			if (bond.ext === 'o') {
				// Кольцо
				let fig,
					frame, v, r,
					center = new Point(),
					vertices = []
				nodes.forEach(node => {
					frame = getNodeFrame(node)
					vertices.push(v = frame.org)
					center.addi(v)
				})
				center.muli(1 / n)	// Вычислить центральную точку
				v = vertices[0].addx(vertices[1]).muli(.5)	// Середина первого ребра
				r = center.dist(v) * .7	// Радиус окружности равен расстоянию от центра до середины ребра (минус 20% отступ)
				fig = new GrEllipse(r * 2, r * 2, 0, getColor(bond), lineWidth)
				fig.org = center.addin(-r, -r)
				agentFrame.addFig(fig)
			}
			if (bond.ext === 's' && n > 1) {
				//===== Связь, объединяющая несколько узлов при помощи Би-сплайна
				let fig, i, d, p,
					center = new Point(), points = []
				// Получить список точек и центральную точку
				for ( i in nodes) {
					points.push(p = getNodeFrame(nodes[i]).org.clone())
					center.addi(p)
				}
				center.muli(1 / points.length)	// центральная точка

				i = 0
				if (!bond.o) {
					// не циклический вариант
					// Линия выходит из концов и проходит на некотором расстоянии от остальных точек, смещаясь к центру
					i++; n--
				}
				for (; i < n; i++) {
					p = points[i]
					d = center.subx(p)
					p.addi(d.muli(.2))
				}
				BSplineExt(points, bond.o)
				fig = createBSpline(points, props.dash, getColor(bond), lineWidth, bond.style === ':')
				agentFrame.addFig(fig)
				drawBondArrow(bond, 0, points[1], points[2])
				drawBondArrow(bond, 1, points[points.length - 4], points[points.length - 3])
			}
		}

		// Отсечение линии ab, с условием что nd-узел, соответствующий точке a
		function clipLine(nd, frame, a, b) {
			if (nd.bAuto)
				return
			// Нет смысла отсекать пустой узел - автоматический или состоящий из пустого коммента или абстрактного элемента
			if (ChemSys.isEmptyNode(nd))
				return
			// Нужно перевести координаты отсекающих фигур в координаты агента...

			let x, y, i, j
			for (i in frame.frames) {
				let iframe = frame.frames[i]
				for (j in iframe.figs) {
					let fig = iframe.figs[j]
					let org = fig.org.addx(iframe.org).addi(frame.org)
					let pa = fig.bounds.A.addx(org)
					let pb = fig.bounds.B.addx(org)
					let font = fig.font
					if (font) {
						pb.y = pa.y + font.ascent
						pa.y += font.descent
					}
					pa.addin(-lineWidth, -lineWidth)
					pb.addin(lineWidth, lineWidth)
					if (b.x > a.x) {
						// Отсечение по правой грани
						x = pb.x
						if (a.x < x ) {
							y = (x - a.x) * (b.y - a.y) / (b.x - a.x) + a.y
							if (pa.y < y && y < pb.y) {
								// требуется отсечение по правой грани
								a.x = x
								a.y = y
							}
						}
					} else {
						// Отсечение по левой грани
						x = pa.x
						if (x < a.x) {
							y = (x - a.x) * (b.y - a.y) / (b.x - a.x) + a.y
							if (pa.y < y && y < pb.y) {
								// требуется отсечение по левой грани
								a.x = x
								a.y = y
							}
						}
					}
					if (b.y > a.y) {	// Проверка отсечения по нижней грани
						y = pb.y
						if (a.y < y) {
							x = (y - a.y) * (b.x - a.x) / (b.y - a.y) + a.x
							if (pa.x < x && x < pb.x) {
								// Необходимо отсечение по нижней грани
								a.x = x
								a.y = y
							}
						}
					} else {	// Проверка отсечения по верхней грани
						y = pa.y
						if (y < a.y) {
							x = (y - a.y) * (b.x - a.x) / (b.y - a.y) + a.x
							if (pa.x < x && x < pb.x) {
								// Необходимо отсечение по нижней грани
								a.x = x
								a.y = y
							}
						}
					}
				}
			}
		}

		// Вывод кривой линии
		function drawCurveBond(bond, p0, p1) {
			//   d -:- bond.pt   spt = wpt*d/bond.pt
			// spt -:- wpt       spt = wpt*k,   k=d/bond.pt
			let k = p0.dist(p1) / bond.pt.length(),
				i, wpt, midPts = bond.midPt, n = midPts.length,
				prevPt = p0, curPt,
				fig = new GrLines(getColor(bond), lineWidth)
			fig.add(prevPt)
			for (i = 0; i < n; i++) {
				wpt = midPts[i]
				curPt = wpt.mulx(k).addi(prevPt)
				fig.add(curPt, i === n - 1 ? 0 : 2)
				prevPt = curPt
			}
			agentFrame.addFig(fig)
		}

		// arr1 - по ходу связи, arr0 - против хода
		function drawBondArrow(bond, side, p0, p1) {
			if (side) {
				if (bond.arr1)
					drawArrow(p0, p1, bond.color, agentFrame)
			} else {
				if (bond.arr0)
					drawArrow(p1, p0, bond.color, agentFrame)
			}
		}

		// вывод связи
		function drawBond(bond) {
			let preObj = preObjects[index]
			if (preObj) {
				// Вывод мягкой связи
				let bNeg = bond.pt.x < 0,
					sign = bNeg ? -1 : 1,
					p0 = getSrcPoint(preObj.f0, bNeg).addi(preObj),
					p1 = p0.addx(preObj.d),
					w = preObj.d.x,
					margin = props.lineWidth || 1
				p0.x += margin * sign	// небольшой отступ, чтобы связь не сливалась с узлами или скобками
				p1.x -= margin * sign
				_drawBond(bond, p0, p1)
			} else if (bond.nodes.length !== 2) {
				drawBondPoly(bond)
			} else {
				let node0 = bond.nodes[0],
					node1 = bond.nodes[1],
					frame0 = getNodeFrame(node0),
					frame1 = getNodeFrame(node1),
					midPts = bond.midPt,
					p0 = frame0.org.clone()
				if (midPts) {
					// Вывод кривой линии
					let	i, n, scrPoints = [p0],
						fig = new GrLines(getColor(bond), lineWidth)
					for (i in midPts)
						scrPoints.push(midPts[i].mulx(scale).addi(scrPoints[i]))
					n = scrPoints.length
					clipLine(node0, frame0, scrPoints[0], scrPoints[1])
					clipLine(node1, frame1, scrPoints[n - 1], scrPoints[n - 2])
					drawBondArrow(bond, 0, scrPoints[0], scrPoints[1])
					drawBondArrow(bond, 1, scrPoints[n - 2], scrPoints[n - 1])
					for (i = 0; i < n; i++)
						fig.add(scrPoints[i], i === 0 ? 1 : (i === n - 1 ? 0 : 2))
					agentFrame.addFig(fig)
				} else {
					let	p1 = frame1.org.clone()
					clipLine(node0, frame0, p0, p1)
					clipLine(node1, frame1, p1, p0)
					_drawBond(bond, p0, p1)
					drawBondArrow(bond, 0, p0, p1)
					drawBondArrow(bond, 1, p0, p1)
				}
			}
		}

		function makeRoundBracket(x0, yt, x1, yb, bracket) {
			let h = yb - yt, w = Math.abs(x1 - x0) / 3, dx, x2
			if (x0 < x1) {
				x2 = x0 + lineWidth2
				dx = lineWidth
			} else {
				dx = -lineWidth
				x2 = x0 - lineWidth2
			}
			let fig = new GrLines()
			fig.fillColor = getColor(bracket)
			fig.addA([
				x1, yt, 1,	// верх
				x0, yt + w, 2,
				x0, yt + h / 3, 2,
				x0, yt + h / 2, 0,	// середина (внешняя)
				x0, yb - h / 3, 2,
				x0, yb - w, 2,
				x1, yb, 0,	// Крайняя точка
				x1 + dx, yb - lineWidth, 0,	// нижняя перегородка
				x2, yb - w - lineWidth, 2,
				x2, yb - h / 3, 2,
				x2, yt + h / 2, 0,	// середина (внутренняя)
				x2, yt + h / 3, 2,
				x2, yt + w + lineWidth, 2,
				x1 + dx, yt + lineWidth, 0	// верхняя перегородка
			])
			return fig
		}

		function drawBracket(bracket) {
			// Ищем заранее подготовленные данные
			let preObj = preObjects[index]
			if (!preObj) return
			let fig, frame0 = preObj.f0, frame1 = preObj.f1, pt
			if (frame0) {
				pt = getSrcPoint(frame0)
			} else {
				pt = getDstPoint(frame1)
			}
			pt.addi(preObj)
			let w = getBracketWidth(), x0 = pt.x + preObj.cw, x1 = x0 + w, xw = x0,
				yt = preObj.yt, yb = preObj.yb
			x0 += lineWidth
			xw += 3 * lineWidth
			x1 -= lineWidth
			if (bracket.tx === '(') {
				fig = makeRoundBracket(x0, yt, x1, yb, bracket)
			} else {
				//fig = new GrLines(bracket.color, props.lineWidth);
				fig = new GrLines()
				fig.fillColor = getColor(bracket)
				fig.cap = fig.join = 'square'
				let yt1 = yt + lineWidth, yb1 = yb - lineWidth
				fig.addA([
					x1, yt, 1,
					x0, yt, 0,
					x0, yb, 0,
					x1, yb, 0,
					x1, yb1, 0,
					xw, yb1, 0,
					xw, yt1, 0,
					x1, yt1, 0
				])
			}
			agentFrame.addFig(fig)
			drawBracketCharge(preObj, fig, 1)
		}

		// Вывод закрывающейся скобки
		function drawBracketEnd(bracket) {
			let fig, preObj = preObjects[index]
			if (!preObj) return
			let frame0 = preObj.f0
			let w = getBracketWidth(),
				pt = getSrcPoint(frame0).addi(preObj),
				x0 = pt.x,
				x1 = x0 + w, xw = x1,
				yt = preObj.yt, yb = preObj.yb
			x0 += lineWidth
			x1 -= lineWidth
			xw -= 3 * lineWidth
			if (bracket.tx === ')') {
				fig = makeRoundBracket(x1, yt, x0, yb, bracket)
			} else {
				//fig = new GrLines(bracket.color, props.lineWidth);
				fig = new GrLines(0, 0)
				fig.fillColor = getColor(bracket)
				fig.cap = fig.join = 'square'
				//  x0 xw x1
				//  0*****1  yt
				//  7***6 *  yt1
				//      * *
				//      * *
				//  4***5 *  yb1
				//  3*****2  yb
				let yt1 = yt + lineWidth, yb1 = yb - lineWidth
				fig.addA([
					x0, yt, 1,	// 0
					x1, yt, 0,	// 1	0----->1
					x1, yb, 0,	// 2	       2
					x0, yb, 0,	// 3	3<-----2
					x0, yb1, 0,	// 4
					xw, yb1, 0,	// 5	4--->5
					xw, yt1, 0,	// 6
					x0, yt1, 0	// 7	7<---6
				])
			}
			agentFrame.addFig(fig)

			drawBracketCharge(preObj, fig)

			// вывод коэффициента
			fig = preObj.k
			if (fig) {	// Внимание! здесь нет ошибки. сначала fig присваивается preObj.k. А затем если есть фигура, её рисуем
				let font = fig.font, descent = font.descent, ascent = font.ascent, h = ascent - descent, sub = font.height - ascent
				fig.org.init(x1 + lineWidth, yb - sub - h + h * props.bracketSubKY)
				agentFrame.addFig(fig)
			}
		}

		// вывод конструкции типа *5H2O
		function drawMul(mul) {
			let preObj = preObjects[index],
				spc = preObj.s,
				frame0 = preObj.f0,
				pt = getSrcPoint(frame0).addi(preObj)
			preObj.m.org.addi(pt)
			agentFrame.addFig(preObj.m)
			if (preObj.k) {
				preObj.k.org.addi(preObj.f1.bounds.A).addi(preObj.f1.org)
				agentFrame.addFig(preObj.k)
			}
		}

		for (index in cmds) {
			cmds[index].walk({
				bond: drawBond,
				bracketBegin: drawBracket,
				bracketEnd: drawBracketEnd,
				mul: drawMul
			})
		}
	}

	// Создание текстовых элементов: атомов, комментов, радикалов...
	function makeTextItem(text, styleName, color) {
		let style = props.getStyleCol(styleName, color || curItemColor),
			fig = new GrText(text, style.fnt, style.col)
		curItemFrame.addFig(fig)
		// Задать внутреннюю рамку для фрейма
		curItemFrame.irc = fig.getIrc()
	}

	// Поиск пересечения линии, проходящей через org (с направлением vec) и рамки irc
	// Предполагается, что org внутри irc !
	function insideClip(org, vec, irc) {
		let xv = null, yh = null, xh, yv
		if (!Point.is0(vec.x)) {
			xh = vec.x < 0 ? irc.A.x : irc.B.x
			xh -= org.x
			// vec.x -- vec.y
			//    xh -- yh
			yh = xh * vec.y / vec.x
		}
		if (!Point.is0(vec.y)) {
			yv = vec.y < 0 ? irc.A.y : irc.B.y
			yv -= org.y
			xv = yv * vec.x / vec.y
		}
		if (xv === null) {
			vec.init(xh, yh)
		} else if (yh === null) {
			vec.init(xv, yv)
		} else {
			if (xh * xh + yh * yh < xv * xv + yv * yv) {
				vec.init(xh, yh)
			} else {
				vec.init(xv, yv)
			}
		}
		vec.addi(org)
	}

	function drawShell(frame, angles, space, callBk) {
		frame.update()
		let irc = frame.getIrc().clone()
		irc.grow(space)
		//frame.addFig(makeGrRect(irc.A, irc.B, 'red',1));
		let c = irc.center(), k = irc.H() / irc.W(), d, i
		for (i in angles) {
			// Определить вектор направления
			d = new Point()
			d.fromDeg(angles[i])
			d.y *= k
			// Найти пересечение вектора (его продолжения) с одной из сторон
			insideClip(c, d, irc)
			callBk(c, d)
		}
	}
	// Вывод точек вокруг элемента $dots
	function drawDots(frame, dots, color) {
		drawShell(frame, dots, scale * .1 + lineWidth, function (p0, p1) {
			let D = lineWidth * 3,
				fig = new GrEllipse(D, D, color)
			fig.org.addi(p1).subi(D / 2)
			frame.addFig(fig)
		})
	}
	// Вывод чёрточек вокруг элемента $dashes
	function drawDashes(frame, dashes, color) {
		drawShell(frame, dashes, scale * .05, function (p0, p1) {
			let fig = new GrLines(color, lineWidth),
				d = p1.subx(p0)
			fig.cap = 'butt'
			// Необходимо немного придвигать конечную точку к центру в углах
			let factor = Math.min(Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y)),
				len = d.length()
			d.muli(1 - .4 * factor / len)
			let p = calcPerpendicularPair(p0, p0.addx(d), scale / 6)
			fig.add(p[0])
			fig.add(p[1])
			frame.addFig(fig)
		})
	}

	formula.walk({
		agentPre: () => {
			// фрейм агента
			entityFrames.push(agentFrame = new GrFrame())
			nodesFrList = []
			groups = []
		},
		agentPost: obj => {
			compactSubChains(obj)	// 2-й шаг вывода агента
			drawPostNodes(obj)		// 3-й шаг вывода агента
			endBondHeap()
			agentFrame.update()
		},
		nodePre: obj => {
			agentFrame.addFr(nodeFrame = new GrFrame())
			nodesFrList[obj.index] = nodeFrame
			nodeFrame.org = obj.pt.mulx(scale)
			addNodeToSubChain(obj)
			bAutoNode = obj.bAuto
			//drawNodeCharge(obj.charge, nodeFrame, 1);
		},
		nodePost: obj => {
			if (bAutoNode) return
			// Расставить в ряд элементы узла
			let x = 0, ci, items = nodeFrame.frames
			items.forEach(frame => {
				frame.org.x = x
				x += frame.bounds.r
			})
			// Назначить центр узла
			ci = findCenter(obj)
			let centerItem = items[ci],
				cpt = getTextRect(centerItem).addi(centerItem.org)
			cpt.negi()
			nodeFrame.moveChilds(cpt)

			/*
			 // debug output !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			 let cntr = new GrLines(), D=7;
			 cntr.color = 'red';
			 cntr.addxy(0,-D); cntr.addxy(0,D);
			 cntr.addxy(-D,0,1); cntr.addxy(D,0);
			 nodeFrame.addFig(cntr);
			 */
			nodeFrame.update()
			drawNodeCharge(obj.charge, nodeFrame)
		},
		itemPre: obj => {
			if (bAutoNode) return
			colorStack.push(curColor)
			curColor = obj.color || stdStyle.col
			curItemColor = obj.itemColor || curColor
			curAtomColor = obj.atomColor || curItemColor
			curItemFrame = new GrFrame()
			nodeFrame.addFr(curItemFrame)
		},
		itemPost: obj => {
			if (bAutoNode) return
			curColor = colorStack.pop()
			curItemFrame.update()
			curItemFrame.ir = curItemFrame.bounds.B.x	// internal right
			let fig0 = curItemFrame.figs[0]
			curItemFrame.it = fig0 ? fig0.org.y + fig0.font.descent : new Point()
			// Коэффициент элемента
			if (obj.n !== 1) {
				let style = props.getStyleCol('ItemCnt', curItemColor),
					fig = new GrText(obj.n, style.fnt),
					subTop = style.fnt.descent,
					subBottom = style.fnt.ascent
				fig.color = style.col
				fig.org.x = curItemFrame.bounds.R()
				fig.org.y = curItemFrame.figs[0].font.ascent - subBottom + props.subKY * (subBottom - subTop)
				curItemFrame.addFig(fig)
				curItemFrame.update()	// !!!
			}
			// Степень окисления
			if (obj.charge) {
				let style = props.getStyleCol('ItemCharge', curItemColor),
					fig = new GrText(obj.charge.tx, style.fnt, style.col),
					irc = curItemFrame.getIrc()
				fig.org.y = irc.A.y - fig.bounds.H()
				fig.org.x = (irc.A.x + irc.B.x) / 2 - fig.bounds.W() / 2
				curItemFrame.addFig(fig)
				curItemFrame.update()	// !!!
			}
			if (obj.dots)
				drawDots(nodeFrame, obj.dots, curItemColor)
			if (obj.dashes)
				drawDashes(nodeFrame, obj.dashes, curItemColor)
		},
		atom: obj => {
			if (bAutoNode) return
			makeTextItem(obj.id, 'Atom', curAtomColor)
		},
		radical: obj => {
			makeTextItem(obj.label, 'Radical')
		},
		comm: obj => {
			makeTextItem(obj.tx, 'Comment')
		},
		custom: obj => {
			makeTextItem(obj.tx, 'Custom')
		},

		operation: obj => {
			function makeCommFig(comm) {
				let fig = 0, style
				if (comm) {
					style = props.getStyleCol('OpComment', curColor)
					fig = new GrText(comm.tx, style.fnt, style.col)
				}
				return fig
			}
			let frm = new GrFrame(), fig,
				style = props.getStyleCol('op', obj.color || curColor),
				text = obj.dstText,
				commFig = [makeCommFig(obj.commentPre), makeCommFig(obj.commentPost)],
				i, w, f
			if (text === '—→') {
				// Отдельная реализация для длинной линии
				w = scale * 1.4	// Минимальная длина стрелки (без полей)
				for (i = 0; i < 2; i++) {
					if (commFig[i]) w = Math.max(w, commFig[i].bounds.W())
				}
				w += props.arrowL * 3 // Добавить поля, чтобы стрелка всегда была длиннее комментов
				let p0 = new Point(), p1 = p0.addx(w, 0)
				fig = new GrLines(style.col, lineWidth)
				fig.add(p0); fig.add(p1)
				frm.addFig(fig)
				drawArrow(p0, p1, style.col, frm)
				frm.cy = 0	// Назначить сентральную точку по оси y для выравнивания всех сущностей выражения
				//frm.update();
				frm.bounds.grow(0, lineWidth2) // Добавить отсупы по высоте, чтобы комментарий не был слишком близко к линии
			} else if (obj.srcText === '<==>') {
				// Реализация двойной стрелки
				w = scale * 1.4
				for (i = 0; i < 2; i++) {
					if (commFig[i]) w = Math.max(w, commFig[i].bounds.W())
				}
				w += props.arrowL * 3 // Добавить поля, чтобы стрелка всегда была длиннее комментов
				fig = new GrLines(style.col, lineWidth)
				let L = props.arrowL, D = props.arrowD, dy = lineWidth2
				fig.addA([0, -dy, 1,  w, -dy, 0,  w - L, -dy - D, 0,
					w, dy, 1,  0, dy, 0,  L, dy + D, 0])
				fig.join = 'miter' // TODO: режим с острым углом
				frm.addFig(fig)
				frm.cy = 0	// Назначить сентральную точку по оси y для выравнивания всех сущностей выражения
				frm.bounds.grow(0, lineWidth2) // Добавить отсупы по высоте, чтобы комментарий не был слишком близко к линии
			} else {
				fig = new GrText(text, style.fnt, style.col)
				frm.addFig(fig)
				frm.irc = fig.getIrc()
				frm.cy = frm.irc.cy()
			}
			// comments
			let irc = frm.getIrc()
			//frm.addFig(makeGrRect(irc.A, irc.B, 'red')); // !!!
			for (i = 0; i < 2; i++) {
				f = commFig[i]
				if (f) {
					f.org.init((irc.A.x + irc.B.x - f.bounds.W()) / 2,
						i ? irc.B.y - f.font.descent : (irc.A.y - f.bounds.H())
					)
					frm.addFig(f, 1)
					let xx = f.getIrc(); xx.move(f.org)
					//frm.addFig(makeGrRect(xx.A, xx.B, 'blue'),1); // !!!
				}
			}

			frm.update()
			//frm.addFig(makeGrRect(fig.bounds.A, fig.bounds.B, '#00C', 1));
			entityFrames.push(frm)
		}
	})

	// Заполнение главного фрейма
	function buildMainFrame() {
		let i, n = entityFrames.length, ent, x = 0, cy0, dx = props.opSpace
		function calcCY(frame) {
			let cy = ('cy' in frame) ? frame.cy : (frame.bounds.A.y + frame.bounds.B.y) / 2
			return cy + frame.org.y
		}
		for (i = 0; i < n; i++) {
			ent = entityFrames[i]
			ent.org = ent.bounds.A.negx()
			ent.org.x += x
			if (i) {
				ent.org.y -= calcCY(ent) - cy0
			} else {
				cy0 = calcCY(ent)
			}
			x += ent.bounds.W() + dx
			mainFrame.addFr(ent)
		}
		mainFrame.update()
	}
	buildMainFrame()

	return mainFrame

}
