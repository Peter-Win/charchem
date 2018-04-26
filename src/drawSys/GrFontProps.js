/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'

class GrFontProps {
	/**
	 * Font properties
	 * @param {string} family		for ex: 'Arial'
	 * @param {number} height		for ex: 22
	 * @param {boolean=} bold		*
	 * @param {boolean=} italic		*
	 * @constructor
	 */
	constructor(family, height, bold = false, italic = false) {
		const props = this
		props.family = family
		props.height = height
		props.bold = bold
		props.italic = italic
		props.descent = 0
		props.ascent = height	// = baseline
	}
}

/**
 * Abstract font
 * @abstract
 */
class GrFont extends GrFontProps
{
	/**
	 * @abstract
	 * @param {string} text
	 * @returns {number}	width of text
	 */
	// eslint-disable-next-line no-unused-vars
	textWidth(text) {
		return 0
	}

	/**
	 * @abstract
	 * @param {Point} point
	 * @param {string} text
	 * @param {string} color
	 */
	// eslint-disable-next-line no-unused-vars
	draw(point, text, color) {

	}
}
module.exports = {GrFontProps, GrFont}
