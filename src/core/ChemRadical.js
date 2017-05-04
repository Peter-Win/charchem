/**
 * Chemical radical
 * Created by PeterWin on 29.04.2017.
 */
"use strict"

import ElemList, {ElemRec} from './ElemList'

export default class ChemRadical
{
	/**
	 * @constructor
	 * @param {string} label
	 * @param {ElemList} elemsList
	 */
	constructor(label, elemsList) {
		this.label = label;		// radical label
		this.items = elemsList;	// list of records {id,elem, n} (=ElemList)
	}

	walk(visitor) {
		if (visitor.radical)
			return visitor.radical(this)
	}
}

//======= radicals list
const radicals = [
	"Me:C,H*3",
	"Et:C*2,H*5",
	"Ph:C*6,H*5",
	"Pr,n-Pr,Pr-n:C*3,H*7",
	"iPr,i-Pr,Pr-i:C*3,H*7",
	"Bu,nBu,n-Bu,Bu-n:C*4,H*9",
	"i-Bu,Bu-i:C*4,H*9",
	"Ac:C,H*3,C,O"
]


/**
 * Radicals dictionary
 * @type {Object<string, ChemRadical>}	id=>ChemRadical
 */
ChemRadical.Map = {}

let isMapInit = false

ChemRadical.initMap = () => {
	if (isMapInit)
		return;

	isMapInit = true
	radicals.forEach(descr => {
		let L = descr.split(':'),
			elemList = new ElemList(),
			ids = L[0].split(','),
			elems = L[1].split(',')
		elems.forEach(elem => {
			let e = elem.split('*')
			elemList.addElemRec(new ElemRec(e[0], e[1] ? +e[1] : 1))
		})
		ids.forEach( id => {
			ChemRadical.Map[id] = new ChemRadical(id, elemList);
		})

	})
}