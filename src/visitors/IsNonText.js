/**
 * Created by PeterWin on 06.05.2017.
 */

// visitor Для определения невозможности вывода выражения (или его части) в виде текста
// example: if (expr.walk(new IsNonText())) alert('This is not textual expression');
class IsNonText {
	constructor() {
		this.ok = false
	}
	bond(obj) {
		// Большинство связей не является текстовыми
		return this.ok = obj.bText ^ 1
	}
}

module.exports = {IsNonText}
