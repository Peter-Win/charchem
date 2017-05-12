/**
 * Created by PeterWin on 09.05.2017.
 */

////////////////////////////////////////////////////////////
//		visitor ChargeCalc
//	Вычисление суммы зарядов узлов
// Example:
//	var visitor = new ChargeCalc();
//	expr.walk(visitor);
//	var chargeValue = visitor.result();

/**
 *
 * @constructor
 */
export default function ChargeCalc() {
	let me = this,
		stack = [0]

	/**
	 * @returns {number}
	 */
	me.result = () => stack[0]

	me.agentPre = me.bracketBegin = me.mul = () => {
		stack.unshift(0)
	}
	me.agentPost = obj => {
		let n = stack.shift() * obj.n
		stack[0] += n
	}
	me.bracketEnd = obj => {
		let v = stack.shift()
		if (obj.charge) {
			// заряд, указанный для скобки, игнорирует все заряды внутри скобок
			// например, для комплексного иона можно указать заряды лигандов, но они считаться не будут
			v = obj.charge.val
		}
		stack[0] += v * obj.n
	}
	me.nodePost = obj => {
		stack[0] += obj.chargeVal()
	}
	me.mulEnd = obj => {
		let n = stack.shift() * obj.beg.n
		stack[0] += n
	}
}

