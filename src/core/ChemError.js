/**
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

const Lang = require('../Lang')

// extends Error
function ChemError(msgId, params) {

	/**
	 * Get localized message.
	 * Language of message init by Lang.locale
	 * @const
	 * @returns {string} error message
	 */
	this.getMessage = () =>
		Lang.tr(this.msgId, this.params)


	this.msgId = msgId
	this.params = params
	this.message = this.getMessage()
}
ChemError.prototype = new Error

module.exports = ChemError