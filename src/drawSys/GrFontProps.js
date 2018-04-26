/**
 * Created by PeterWin on 12.05.2017.
 */
'use strict'

/**
 * Font properties
 * @param {string} family
 * @param {number} height
 * @param {boolean} bold
 * @param {boolean} italic
 * @constructor
 */
export default function GrFontProps(family, height, bold, italic) {
	let props = this
	props.family = family
	props.height = height
	props.bold = bold
	props.italic = italic
	props.descent = 0
	props.ascent = height	// = baseline
}

/**
 * Abstract font
 * @abstract
 */
export class GrFont extends GrFontProps
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
