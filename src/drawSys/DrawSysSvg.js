/**
 * Created by PeterWin on 15.05.2017.
 */
const {CanvasTracer} = require('./CanvasTracer')
const {ChemSys} = require('../ChemSys')
const {DrawSys} = require('./DrawSys')
const {esc} = require('../core')
const {GrEllipse} = require('./figures/GrEllipse')
const {GrLines} = require('./figures/GrLines')
const {GrText} = require('./figures/GrText')
const {Point} = require('../math/Point')

const escx = x => '"' + esc(x + '') + '"'

/**
 * Conver map to string with format key1="value1" [key2="value2" ]
 * @param {Object<string,string>=} props -
 * @returns {string}	-
 */
const strProps = props => {
	let s = ''
	if (props) {
		for (let field in props) {
			s += ' ' + field + '=' + escx(props[field])
		}
	}
	return s
}

/**
 * Convert map to string with format key1:value1; [key2:value2; ]
 * @param {Object<string,string>=} props -
 * @returns {string} -
 */
const cssProps = props => {
	let s = ''
	if (props) {
		for (let field in props) {
			s += ' ' + field + ':' + props[field] + '; '
		}
	}
	return s
}

/**
 * Make tag
 * Example: tag('input', {name:'count',value:15}, 1) => <input name="count" value="15" />
 * @param {string} name		for ex: 'circle'
 * @param {Object=} params	for ex: {x: 10, y: 33}
 * @param {boolean=} bClosed	true, if <tag />
 * @returns {string}		result
 */
const tag = (name, params = null, bClosed = false) => {
	let s = '<' + name + strProps(params)
	if (bClosed) {
		s += ' /'
	}
	return s + '>'
}

/**
 * Global cache of fonts
 * @type {Object<string,GrFont>}
 */
const svgFontCache = {}

class DrawSysSvg extends DrawSys {
	/**
	 * @constructor
	 * @param {HTMLElement} owner 	html element
	 */
	constructor(owner) {
		super()
		this.owner = owner
		this.svgText = ''
		this.totalSize = new Point()	// Общий размер холста
		this.coordFactor = 1
		this.styles = {}	// Стили в виде словаря: ключ -> объект свойств. {name, props}
		this.styleIndex = 1
	}

	coord(a) {
		return Math.floor(a * this.coordFactor) / this.coordFactor
	}

	/**
	 * Find style by attributes map
	 * If not found, then style will be created and included to this.styles
	 * @param {Object} props -
	 * @param {string=} prefix = style
	 * @return {string} style name (can access to attributes:  this.styles[name])
	 */
	findStyle(props, prefix = 'style') {
		let key = JSON.stringify(props),
			item = this.styles[key]
		if (!item) {
			this.styles[key] = item = {name: prefix + this.styleIndex++, props: props}
		}
		return item.name
	}

	renderStyle() {
		let key, rec, text = '<style type="text/css">\n  <![CDATA[\n'
		for (key in this.styles) {
			rec = this.styles[key]
			text += `  .${rec.name} {${cssProps(rec.props)} }\n`
		}
		text += '  ]]>\n</style>\n'
		return text
	}

	/**
	 * @override
	 */
	createFont(fontProps) {
		let cssHeight = fontProps.height
		// Ключ для кеширования свойств шрифта
		let key = [fontProps.family, cssHeight, fontProps.bold, fontProps.italic].join('@'),
			descr = svgFontCache[key]

		if (!descr) {
			// Первое обращение. Вычислить ascent, descent и height
			// font-height в CSS определяет только высоту базовой линии. Поэтому для вычисления реального размера трассируем букву g
			let tracer = new CanvasTracer(fontProps.height, fontProps.height * 1.4),
				rcE = tracer.traceChar('E', fontProps),
				rcg = tracer.traceChar('g', fontProps)
			tracer.close()
			fontProps.descent = rcE.y1
			fontProps.ascent = rcE.y2
			fontProps.height = rcg.y2
			fontProps.W = {} // Кеш для ширины строк
			svgFontCache[key] = descr = fontProps
		} else {
			fontProps.descent = descr.descent
			fontProps.ascent = descr.ascent
			fontProps.height = descr.height
		}

		//	float textWidth(text)
		// Ширина текста может не совпадать с суммой ширин отдельных символов. Особенно для наклонных шрифтов
		// Поэтому используем функцию canvas для определения ширины цельного текста
		fontProps.textWidth = function (text) {
			if (!text)
				return 0
			let cached = descr.W[text]
			if (!cached) {
				let tracer = new CanvasTracer()
				tracer.setFont(fontProps)
				cached = descr.W[text] = tracer.textWidth(text)
				tracer.close()
			}
			return cached
		}

		//	draw(point, text, color)
		fontProps.draw = (point, text, color) => {
			let props = {fill: color, 'font-family': fontProps.family, 'font-size': cssHeight + 'px'}
			if (fontProps.bold)
				props['font-weight'] = 'bold'
			if (fontProps.italic)
				props['font-style'] = 'italic'
			this.svgText += tag('text', {
				x: this.coord(point.x),
				y: this.coord(point.y + fontProps.ascent),
				'class': this.findStyle(props),
			}) + esc(text + '') + '</text>\n'
			// Отладочный вывод рамки
			/*
			let w = this.textWidth(text)
			let d = 'M' + this.coord(point.x) + ' ' + this.coord(point.y + fontProps.descent)
			d += ' L' + this.coord(point.x + w) + ' ' + this.coord(point.y + fontProps.descent)
			d += 'M' + this.coord(point.x) + ' ' + this.coord(point.y + fontProps.ascent)
			d += ' L' + this.coord(point.x + w) + ' ' + this.coord(point.y + fontProps.ascent)
			this.svgText += tag('path', { fill:'none', stroke:'#AAA', d:d }, 1) + '\n'
			*/
		}
		return fontProps
	}

	/**
	 * приготовиться к выводу графики с указанным размером
	 * @param {Point} size -
	 * @return {void}
	 */
	init(size) {
		this.totalSize = size
		let maxSize = Math.max(size.x, size.y)
		this.coordFactor = Math.max(1000, Math.pow(10, Math.floor(Math.log10(maxSize))))
	}

	/**
	 * отрисовка фигуры
	 * @override
	 */
	drawLines(figure, pos) {
		let color = figure.color, fillColor = figure.fillColor
		// Шаг 1. Вычислить координаты точек и записать в массив
		let x, y, mv, path = '', sep = '', curve = 0
		figure.points.forEach(pi => {
			//pi = figure.points[i]
			// вычислить координаты очередной точки
			x = this.coord(pi.x + pos.x)
			y = this.coord(pi.y + pos.y)
			switch (pi.mv) {
			case 1:
				mv = 'M'
				break
			case 2:
				mv = curve++ ? '' : 'C'
				break
			default:
				if (curve) {
					mv = ''
					curve = 0
				} else {
					mv = sep ? 'L' : 'M'
				}
			}
			path += sep + mv + x + ' ' + y
			sep = ' '
		})
		const props = {fill: fillColor || 'none', stroke: color || 'none'}
		if (figure.width) {
			props['stroke-width'] = figure.width
		}
		if (figure.cap) {
			props['stroke-linecap'] = figure.cap
		}
		if (figure.join) {
			props['stroke-linejoin'] = figure.join
		}
		const attrs = {d: path, 'class': this.findStyle(props, fillColor ? 'fill' : 'line')}

		this.svgText += tag('path', attrs, true) + '\n'
	}

	/**
	 * Draw ellipce
	 * @param {GrEllipse} figure -
	 * @param {Point} org -
	 * @return {void}
	 */
	drawEllipse(figure, org) {
		// определить координаты
		let
			d = org.addx(figure.dx, figure.dy),
			xc = this.coord((org.x + d.x) / 2),
			yc = this.coord((org.y + d.y) / 2),
			rx = this.coord(xc - org.x),
			ry = this.coord(yc - org.y),
			props = {}
		props.fill = figure.fillColor ? figure.fillColor : 'none'
		if (figure.color) {
			props.stroke = figure.color
			props['stroke-width'] = figure.width
		} else {
			props.stroke = 'none'
		}
		this.svgText += tag('ellipse', {cx: xc, cy: yc, rx: rx, ry: ry, 'class': this.findStyle(props)}, 1) + '\n'
	}

	/**
	 * draw figure
	 * @param {GrFigure} figure -
	 * @param {Point} pos -
	 * @return {void}
	 */
	drawFig(figure, pos) {
		switch (figure.type) {
		case GrLines.T:
			this.drawLines(figure, pos)
			break
		case GrText.T:
			figure.font.draw(pos, figure.text, figure.color)
			break
		case GrEllipse.T:
			this.drawEllipse(figure, pos)
			break
		}
	}

	//==========================
	getText(attrs) {
		if (!attrs) {
			attrs = {xmlns: 'http://www.w3.org/2000/svg'}
		}
		// Внешний размер
		if (!attrs.width && !attrs.height) {
			attrs.width = this.coord(this.totalSize.x) + 'px'
			attrs.height = this.coord(this.totalSize.y) + 'px'
		} else if (!attrs.width) {

		} else if (!attrs.height) {

		}
		// viewBox
		if (!attrs.viewBox) {
			attrs.viewBox = '0 0 ' + this.coord(this.totalSize.x) + ' ' + this.coord(this.totalSize.y)
		}
		let text = tag('svg', attrs) + '\n'
		text += '<!-- Generated by CharChem v.' + ChemSys.verStr() + ' -->\n'
		text += '<defs>\n'
		text += this.renderStyle()
		text += '</defs>\n'
		text += this.svgText
		text += '</svg>'
		return text
	}

}

module.exports = {DrawSysSvg}
