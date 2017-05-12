/**
 * Brackets
 * Created by PeterWin on 06.05.2017.
 */
import ChemObj from './ChemObj'

// ==================================================
// Begin of bracket

export class ChemBrBegin extends ChemObj
{
	constructor(text) {
		super()
		this.tx = text	// Text of open bracket
		this.end = null	// pointer to ChemBrEnd
		this.nodes = [null, null]
		this.bond = null
	}

	walk(visitor) {
		if (visitor.bracketBegin)
			return visitor.bracketBegin(this)
	}
}

ChemBrBegin.Map = { '(':')', '[':']', '{(':')}' }	// Pairs of open and closed brackets

// ================================================
// End of bracket

export class ChemBrEnd extends ChemObj
{
	constructor(text, begin) {
		super()
		this.begin = begin	// pointer to ChemBrBegin
		this.tx = text
		this.n = 1
		this.charge = null
		this.nodes = [null, null]
		this.bond = null
	}

	walk(visitor) {
		if (visitor.bracketEnd)
			return visitor.bracketEnd(this)
	}
}
ChemBrEnd.Lst = ')]'	// Possible bracket

