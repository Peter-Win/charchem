/**
 * Special tool to locate size of text using Canvas
 * Example:
 * let tracer = new CanvasTracer
 * Created by PeterWin on 15.05.2017.
 */

class CanvasTracer
{
	/**
	 * @constructor
	 * @param {number=} width		optional width of bitmap
	 * @param {number=} height		optional height of bitmap
	 */
	constructor(width, height) {
		this.width = width || 16
		this.height = height || 16
		this.canvas = document.createElement('CANVAS')
		// debug only:
		document.body.appendChild(this.canvas)

		this.canvas.width = this.width
		this.canvas.height = this.height

		this.ctx = this.canvas.getContext('2d')
		if (!this.ctx) {
			throw new Error('Canvas is not supported')
		}
	}

	close() {
		this.canvas.remove()
	}

	/**
	 * Set font
	 * @param {GrFontProps} fontProps	*
	 * @return {void}
	 */
	setFont(fontProps) {
		let descr = '',
			// CSS font-size in reality is ascent. Therefore if ascent specified, we use it as css height
			// If ascent is not specified, then use height
			cssHeight = fontProps.ascent || fontProps.height
		if (fontProps.italic)
			descr += 'italic '
		if (fontProps.bold)
			descr += 'bold '
		descr += cssHeight + 'px ' + fontProps.family
		this.ctx.font = descr
	}

	/**
	 * trace char
	 * @param {string} ch	symbol for trace
	 * @param {GrFontProps} fontProps	*
	 * @returns {{y1,y2:number}}	vertical bounds of symbol
	 */
	traceChar(ch, fontProps) {
		let ctx = this.ctx,
			x, y, imageData, pos,
			width = this.width,
			height = this.height,
			pitch = width * 4,
			rect = {}
		ctx.fillStyle = '#000'
		ctx.fillRect(0, 0, width, height)
		ctx.fillStyle = '#FFF'
		ctx.textBaseline = 'top'
		ctx.textAlign = 'left'
		this.setFont(fontProps)
		ctx.fillText(ch, 0, 0)
		imageData = ctx.getImageData(0, 0, width, height).data

		// Сканировать верх
		for (pos = 0, y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				if (imageData[pos]) break
				pos += 4
			}
			if (x < width) break
		}
		rect.y1 = y

		// Сканировать низ
		for (y = height - 1; y >= 0; y--) {
			pos = y * pitch
			for (x = 0; x < width; x++) {
				if (imageData[pos]) break
				pos += 4
			}
			if (x < width) break
		}
		rect.y2 = y

		return rect
	}

	textWidth(text) {
		return this.ctx.measureText(text).width
	}

}
module.exports = {CanvasTracer}
