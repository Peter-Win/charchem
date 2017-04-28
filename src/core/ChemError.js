/**
 * Created by PeterWin on 27.04.2017.
 */

export default class ChemError extends Error
{
	constructor(msgId, params) {
		super()
		this.msgId = msgId
		this.params = params
		this.message = this.getMessage()
	}

	getMessage() {
		return 'TODO'
	}
}