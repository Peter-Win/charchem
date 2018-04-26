/**
 * Created by PeterWin on 13.05.2017.
 */
'use strict'
import GrFigure from './GrFigure'

export default class GrText extends GrFigure
{
	/**
	 * @constructor
	 * @param {string} text
	 * @param {GrFont} font
	 * @param {string} color
	 */
	constructor(text, font, color) {
		super()
		this.type = GrText.T
		this.font = font
		this.text = text
		this.color = color
		this.bounds.B.init(font.textWidth(text), font.height)
	}

	/**
	 * Calculate internal rectangle
	 * @returns {Rect}
	 */
	getIrc() {
		let irc = this.bounds.clone(),
			font = this.font
		irc.A.y = font.descent
		irc.B.y = font.ascent
		return irc
	}
}
GrText.T = 'T'
