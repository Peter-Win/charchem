/**
 * Created by PeterWin on 13.05.2017.
 */

const {DrawSysSvg} = require('./DrawSysSvg')

/**
 * Use DrawSys.create to create instance of DrawSys
 * @abstract
 */
class DrawSys {
	/**
	 * Create font
	 * @param {GrFontProps} fontProps
	 * @return {GrFont} font
	 * @abstract
	 */
	// eslint-disable-next-line no-unused-vars
	createFont(fontProps) {
		throw new Error('Abstract call of DrawSys.createFont')
	}

	/**
	 * Init draw sys
	 * @param {Point} size
	 * @abstract
	 */
	// eslint-disable-next-line no-unused-vars
	init(size) {
	}

	/**
	 * draw figure
	 * @param {GrFigure} figure
	 * @param {Point} pos
	 * @abstract
	 */
	// eslint-disable-next-line no-unused-vars
	drawFig(figure, pos) {
	}

	// Вывод формулы, предварительно сфомированной, в графическом виде
	view() {
	}

	/**
	 * Create DrawSys object
	 * @param {undefined|string|DrawSys} type Default value = 'canvas', another possible value = 'svg'
	 * @param {Element} owner
	 * @returns {DrawSys}
	 */
	static create(type, owner) {
		type = type || 'canvas'
		if (type instanceof DrawSys) {
			return type
		}
		if (!owner)
			throw new Error('Invalid DOM-node in DrawSys.create()')
		if (typeof type === 'string' && type.toLowerCase() === 'svg') {
			return new DrawSysSvg(owner)
		}
		return new CanvasDrawSys(owner)
	}
}
module.exports = {DrawSys}
