/**
 * Created by PeterWin on 27.04.2017.
 */
"use strict"

import Lang from '../Lang'

// extends Error
function ChemError(msgId, params) {

	/**
	 * Get localized message.
	 * Language of message init by Lang.locale
	 * @const
	 * @returns {string}
	 */
	this.getMessage = function() {
		return Lang.tr(this.msgId, this.params)
	}

	this.msgId = msgId
	this.params = params
	this.message = this.getMessage()
}
ChemError.prototype = new Error

export default ChemError