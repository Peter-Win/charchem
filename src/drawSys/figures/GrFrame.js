/**
 * GrFrame is node of hierarchy structure
 * Created by PeterWin on 12.05.2017.
 */
'use strict'
import GrFigure from './GrFigure'

class GrFrame extends GrFigure {

	constructor() {
		super()
		/**
		 * type of figure
		 * @type {string}
		 */
		this.type = GrFrame.T

		/**
		 * child frames list
		 * @type {GrFrame[]}
		 */
		this.frames = []

		/**
		 * figures list
		 * @type {GrFigure[]}
		 */
		this.figs = []
	}

	/**
	 * add frame
	 * @param {GrFrame} frame
	 */
	addFr(frame) {
		this.frames.push(frame)
	}

	/**
	 * add figure
	 * @param {GrFigure} figure
	 * @param {boolean} bNoUpdate    use true for all sequence items, except last
	 */
	addFig(figure, bNoUpdate = false) {
		this.figs.push(figure)
		if (!bNoUpdate) {
			this.bounds.unite(figure.bounds)
		}
	}

	/**
	 * add figure or frame
	 * @param {GrFrame|GrFigure} fig
	 * @param {boolean=} bNoUpdate	Use true for long sequence, except last item
	 */
	add(fig, bNoUpdate = false) {
		if (fig.type === GrFrame.T) {
			this.addFr(fig)
		} else {
			this.addFig(fig, bNoUpdate)
		}
	}

	/**
	 * Update figure
	 * Bounds of frame init or united with figure bounds
	 * @param {GrFigure} figure
	 * @param {boolean=} bInit
	 */
	uf(figure, bInit = false) {
		let srcOrg = figure.org,
			rect = figure.bounds.clone()
		rect.move(srcOrg)
		if (bInit) {
			this.bounds = rect
		} else {
			this.bounds.unite(rect)
		}
	}

	// recalculation of real size (need call after any add operations)
	update() {
		let bFirst = true
		this.frames.forEach(frame => {
			this.uf(frame, bFirst)
			bFirst = false
			let irc = frame.irc
			if (irc) {
				// if internal rectangle is specified
				irc = irc.clone()
				irc.move(frame.org)
				if (!this.irc) {
					this.irc = irc
				} else {
					this.irc.unite(irc)
				}
			}
		})
		this.figs.forEach(figure => {
			this.uf(figure, bFirst)
			bFirst = false
		})
	}

	/**
	 * Move childs
	 * @param {Point} offset
	 */
	moveChilds(offset) {
		const moveList = list =>
			list.forEach(item => item.org.addi(offset))

		moveList(this.frames)
		moveList(this.figs)
	}

	/**
	 * recursive output all subframes and figures into drawSys
	 * @param {DrawSys} drawSys
	 * @param {Point} offset
	 */
	draw(drawSys, offset) {
		this.frames.forEach(frame =>
			frame.draw(drawSys, frame.org.addx(offset))
		)
		this.figs.forEach(figure =>
			drawSys.drawFig(figure, figure.org.addx(offset))
		)

		// debug!!!
		drawSys.drawFig(this, offset)
	}
}


GrFrame.T = 'F'

export default GrFrame
