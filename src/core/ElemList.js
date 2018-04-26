/**
 * Elements list
 * Each element is record {id, elem, n}
 * For abstract  elem is null
 * Created by PeterWin on 29.04.2017.
 */

const {findElem} = require('./MenTbl')

class ElemRec {

	/**
	 * @constructor
	 * @param {string|ChemAtom|ElemRec|{id,elem,n}} src element
	 * @param {number} koeff coefficient
	 */
	constructor(src, koeff = 1) {
		let rec = this
		rec.n = koeff

		if (typeof src === 'string') {	// Строковое описание элемента
			rec.id = src
			rec.elem = findElem(src)
		} else if (src.M) {	// ChemAtom
			rec.elem = src
			rec.id = src.id
		} else {	// Другой ElemRec
			rec.elem = src.elem
			rec.id = src.id
			rec.n *= src.n
		}
	}

	/**
	 * For abstract elems: {R}, for else: H, He
	 * @returns {string} key of element
	 */
	get key() {
		return this.elem ? this.id : '{' + this.id + '}'
	}
}

class ElemList extends Array
{
	constructor() {
		super()
		const list = this
		list.charge = 0

		// it's look like a bug in Babel: prototype functions are invisible

		/**
		 * Find element
		 * @param {string|ChemAtom} elem	Examples: 'He', 'Li', MenTbl.Be
		 * @returns {number} index of element in list. -1, if not foubd
		 */
		list.findElem = elem => {
			if (typeof elem === 'string') {
				elem = findElem(elem)
			}
			let i = 0, n = list.length
			for (; i < n; i++) {
				if (list[i].elem === elem)
					return i
			}
			return -1
		}

		/**
		 * Find custom element
		 * @param {string} id custom element description
		 * @returns {int} index of custom element or -1, if not found
		 */
		list.findCustom = function (id) {
			const n = list.length
			for (let i = 0; i < n; i++) {
				const rec = list[i]
				if (!rec.elem && rec.id === id)
					return i
			}
			return -1
		}

		/**
		 * Find element by key: 'H' or '{R}'
		 * @param {string} key element key
		 * @returns {int} index or -1, if not found
		 */
		list.findKey = function (key) {
			let j = 0, n = list.length, rec
			for (; j < n; j++) {
				rec = list[j]
				if (rec.key === key)
					return j
			}
			return -1
		}

		/**
		 * Find ElemRec
		 * @param {ElemRec|{id:string,elem:ChemAtom,n:number}} rec element record
		 * @returns {int} index or -1, if not found
		 */
		list.findRec = rec => {
			if (rec.elem) {
				return list.findElem(rec.elem)
			} else {
				return list.findCustom(rec.id)
			}
		}

		/**
		 * Add element record
		 * Attantion! Don't add one instance of record in different lists!
		 * Use addElem to safe add operation
		 * @param {ElemRec} rec element record
		 * @return {void}
		 */
		list.addElemRec = rec => {
			let k = list.findRec(rec)
			if (k < 0) {
				list.push(rec)
			} else {
				list[k].n += rec.n
			}
		}

		/**
		 * Add element
		 * @param {string|ChemAtom|ElemRec} elem element
		 * @param {number=} n	coefficient. default value = 1
		 * @return {void}
		 */
		list.addElem = (elem, n = 1) =>
			list.addElemRec(new ElemRec(elem, n))


		/**
		 * Add abstract element.
		 * @param {string} text	Without { and }
		 * @param {number=} n	coefficient
		 * @return {void}
		 */
		list.addCustom = (text, n = 1) =>
			list.addElemRec(new ElemRec({id:text, elem:null, n}))


		/**
		 * Add another elements list
		 * @param {ElemList} srcList	source list will not change
		 * @return {void}
		 */
		list.addList = srcList => {
			srcList.forEach(rec => list.addElemRec(new ElemRec(rec)))
			list.charge += srcList.charge
		}


		/**
		 * add chemical radical
		 * @param {ChemRadical} radical radical object
		 * @return {void}
		 */
		list.addRadical = radical => {
			list.addList(radical.items)
		}

		/**
		 * Scale all items by coefficient
		 * @param {number} k coefficient
		 * @return {void}
		 */
		list.scale = k => {
			if (k !== 1) {
				list.forEach(item => item.n *= k)
				list.charge *= k
			}
		}

		list.toString = () => {
			let result = list.reduce((acc, item) => acc + item.key + (item.n === 1 ? '' : item.n), '')
			if (list.charge) {
				result += '^'
				let ach = Math.abs(list.charge)
				if (ach !== 1) result += ach
				result += (list.charge < 0) ? '-' : '+'
			}
			return result
		}

		// sort by Hill system
		list.sortByHill = () => {
			const cmp = (a, b) => a < b ? -1 : (a > b ? 1 : 0)

			list.sort((a, b) => {
				let aid = a.id, bid = b.id
				if (!a.elem && !b.elem)
					return cmp(aid, bid)
				if (!a.elem)
					return 1
				if (!b.elem)
					return -1
				if (aid === bid)
					return 0
				if (aid === 'C')
					return -1
				if (bid === 'C')
					return 1
				if (aid === 'H')
					return -1
				if (bid === 'H')
					return 1
				return cmp(aid, bid)
			})
		}

	}

}

module.exports = {
	ElemRec,
	ElemList,
}
