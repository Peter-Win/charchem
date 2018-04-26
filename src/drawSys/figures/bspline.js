/**
 * Created by PeterWin on 14.05.2017.
 */
import GrLines from '..'

////////////////////////////////////////////////////////
//	B-splines

// Добавить фиктивные (не рисуемые) точки.
// В режиме цикла:
// - проверяется совпадение первой и последней точки. Если не совпадают, то добавляется.
// - для фиктивных точек тоже используются существующие точки
// Для незамкнутого сплайна фиктивные точки строятся на продолжении крайних сегментов
/**
 *
 * @param {Point[]} points
 * @param {boolean} bCyclic
 * @constructor
 */
export function BSplineExt(points, bCyclic) {
	let n = points.length, d,
		pb = points[0], pe = points[n - 1]
	if (bCyclic) {
		if (pe.equals(pb)) {
			pe = points[n - 2]	// Последовательность уже замкнута. Конечная точка отступает назад
		} else {
			points.push(pb)	// Добавляем в конец точку (используемую при выводе), совпадающую с первой
		}
		// Добавить три фиктивные точки: две назад, одна вперёд
		points.push(points[1])
		points.push(points[2])
		points.unshift(pe)
	} else {
		d = pe.subx(points[n - 2])
		points.push(pe.addx(d))
		points.push(points[n].addx(d))
		d = points[1].subx(pb)
		points.unshift(pb.subx(d))
	}
}

// Создать фигуру B-сплайна.
// Список точек должен иметь три фиктивные точки, которые не выдны при выводе. Одна в начала, две в конце. Для их вычисления можно использовать BSplineExt
// фиктивные точки: points[0], points[n-1], points[n-2]
export function createBSpline(points, segmentLength, color, lineWidth, bDashed) {
	let i, fig = new GrLines(color, lineWidth),
		n = points.length, L = n - 3,
		sumLen = 0, edgesLen = [0],	// длины видимых кусков
		bCycled = points[1].equals(points[L]),	// Сплайн циклический, если совпадают крайние видимые точки
		len, nSegs, curEdge = 0, newEdge = 1, edgeVec, edgeK, pt,
		a3, a2, a1, a0
	// Вычислить длину каждой видимой грани и их сумму
	for (i = 1; i < L; i++) {
		sumLen += (len = points[i].dist(points[i + 1]))
		edgesLen[i] = len
	}
	nSegs = Math.floor(sumLen / segmentLength + .5)	// Количество сегментов
	if (bDashed) {
		// Для прерывистой линии нужно скорректировать количество сегментов
		// число сегментов должно быть нечётным для разомкнутой кривой и чётной для зацикленной
		if (nSegs & 1) {
			// нечётное число сегментов не годится для цикла
			if (bCycled) nSegs++
		} else {
			// Чётное число не годится для разомкнутой кривой
			if (!bCycled) nSegs++
		}
	}
	// скорректировать длину сегмента
	segmentLength = sumLen / nSegs
	// Теперь движемся одновременно по сегментам и по граням
	for (i = 0, len = 0;;i++) {
		if (newEdge !== curEdge) {
			if (newEdge >= L)
				break
			// Переход на новое ребро. Пересчёт коэффициентов
			curEdge = newEdge
			edgeVec = points[curEdge + 1].subx(points[curEdge])
			edgeK = 1 / edgesLen[curEdge]

			a3 = points[curEdge].mulx(3)
			a3.subi(points[curEdge - 1])
			a3.addi(points[curEdge + 1].mulx(-3))
			a3.addi(points[curEdge + 2])
			a3.muli(1 / 6)

			a2 = points[curEdge].mulx(-2)
			a2.addi(points[curEdge - 1]).addi(points[curEdge + 1]).muli(.5)

			a1 = points[curEdge + 1].subx(points[curEdge - 1]).muli(.5)

			a0 = points[curEdge].mulx(4)
			a0.addi(points[curEdge - 1]).addi(points[curEdge + 1]).muli(1 / 6)
		}
		let t = len * edgeK
		pt = a3.mulx(t).addi(a2).muli(t).addi(a1).muli(t).addi(a0)
		fig.add(pt, bDashed && (i & 1))

		len += segmentLength
		// вохможно, переход на новое ребро
		while (len >= edgesLen[newEdge]) {
			len -= edgesLen[newEdge]
			newEdge++
		}
	}
	fig.add(bCycled ? fig.points[0].clone() : points[newEdge]) // Последний сегмент
	return fig
}

