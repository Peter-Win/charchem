/**
 * Created by PeterWin on 13.05.2017.
 */
'use strict'

// Свойства для отрисовки графической формулы
// Могут быть использованы многократно
// style = {fnt:0, col:0}
export default function ChemGrProps(stdStyle, line, hline, width) {
	let me = this
	me.line = line	// Длина 2D-химической связи (от центра до центра)
	me.horizLine = hline	// Длина 1D-химической связи (от края до края)
	me.lineWidth = width	// Толщина обычной линии. Если 0, значит минимальная толщина (обычно 1px).
	me.thickWidth = 0	// Толщина толстой линии
	me.lineSpace2 = 0	// Отступ между двойными линиями (между краями ##..##)
	me.lineSpace3 = 0	// Отсуп между тройными линиями
	me.subKY = 0.5	// Разница между низом подстрочного символа и низом объекта В долях высоты подстрочного символа!
	me.bracketSubKY = 0.3	// Аналогично subKY, но для скобок
	me.supKY = 0.5	// Разница между верхом надстрочного символа и верхом объекта В долях высоты символа!
	me.bracketSupKY = 0.3	// Аналогично supKY, но для скобок
	me.hatch = 0	// абсолютное расстояние между штрихами в изображении связи типа /d (z<0) -- see getHatch()
	me.dash = 0	// Длина штриха линии типа S:
	me.arrowL = 0	// длина стрелки
	me.arrowD = 0	// ширина половинки стрелки
	me.opSpace = 0	// Расстояние по оси X между агентом и операцией: H2 + O2
	me.$MulChar = '∙'
	me.kw = 40		// Коэффициент для вычисления lineWidth = ceil(line/kw)

	me.flDblAlign = 1 // Смещение двойной связи к центру, если возможно.

	// Стиль объединяет такие свойства: шрифт, цвет
	me.stdStyle = stdStyle
	/**
	 * @type {Object<string,{fnt:GrFont,col:string}>}
	 */
	me.styles = {}

	// Функция вызывается после заполнения части свойств для автоматического заполнения остальных свойств
	me.init = function () {
		// Длина связи вычисляется из высоты стандартного шрифта
		let line = me.line = me.line || (me.stdStyle.fnt.height * 1.6),

			// Ширина линии определяется по длине связи с использованием коэффициента
			lineWidth = me.lineWidth = me.lineWidth || (Math.ceil(line / me.kw))

		// Длина мягкой связи (по оси Х) вычисляется из ширины знака + (потому что минус может быть слишком короткий)
		me.horizLine = me.horizLine || me.stdStyle.fnt.textWidth('+')

		function setVal(id, val) {
			me[id] = me[id] || val
		}
		setVal('thickWidth', lineWidth * 4)
		setVal('hatch', lineWidth * 3)
		setVal('dash',  lineWidth * 3)
		setVal('lineSpace2', lineWidth * 2)
		setVal('lineSpace3', lineWidth * 2)
		setVal('arrowL', line / 6)
		setVal('arrowD', line / 10)
		setVal('opSpace', line / 10)
	}

	/**
	 * Get style by name
	 * @param {string} styleName
	 * @returns {*}
	 */
	me.getStyle = function (styleName) {
		return me.styles[styleName] || me.stdStyle
	}

	/**
	 * Get style with preferred color
	 * @param {string} styleName
	 * @param {string=} color
	 * @returns {{fnt:GrFont, col: string}}
	 */
	me.getStyleCol = function (styleName, color) {
		let style = me.getStyle(styleName)
		if (color && color !== style.color) {
			return { fnt:style.fnt, col:color }
		}
		return style
	}
}
