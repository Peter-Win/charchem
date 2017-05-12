/**
 * Multilanguage support
 * Created by PeterWin on 27.04.2017.
 */
'use strict'

const Lang = {
	/**
	 * Current language
	 * Examples: en, ru - internal languages; zh, zh-TW - external (by addDict)
	 * @var {string}
	 */
	curLang: 'en',

	/**
	 * Browser language
	 * @var {string}
	 */
	navLang: 'en',

	/**
	 * Translate phrase
	 * @param {string} key
	 * @param {Object=} params
	 * @param {string=} lang
	 * @returns {string}
	 */
	tr: function (key, params, lang) {
		let i, k, me = this
		lang = (lang || me.curLang).toLowerCase()

		// find dictionary
		let	curDict = me.Dict[lang]
		if (!curDict && (k = lang.indexOf('-')) > 0) {
			curDict = me.Dict[lang.slice(0, k)]
		}
		curDict = curDict || me.Dict.en
		// find phrase
		let	phrase = curDict[key]
		if (phrase === undefined)
			phrase = key
		// parameters
		if (typeof params === 'object') for (i in params)
			phrase = phrase.replace(new RegExp('\\[' + i + '\\]', 'g'), params[i])
		return phrase
	},

	/**
	 * Add phrases to dictionary
	 * @param {Object<string,Object>} struc	 { locale1: { key1: val1, key2:val2}, locale2: {...} }
	 */
	addDict: function (struc) {
		let loc, srcPart, dstPart, key
		for (loc in struc) {
			srcPart = struc[loc]
			dstPart = this.Dict[loc]
			if (!dstPart) {
				// The simplest case - just insert src -> dst
				this.Dict[loc] = srcPart
			} else {
				// Adding keys to an existing partition
				for (key in srcPart) {
					dstPart[key] = srcPart[key]
				}
			}
		}
	},

	/**
	 * Set current language
	 * Called automatically when the library is loaded
	 * @param {Object|string} config	Can be window.navigator object OR locale string. for ex: "zh-tw"
	 */
	init: function (config) {
		if (typeof config === 'object') {
			// Chrome, FF, Opera - navigator.language
			// IE - navigator.browserLanguage and .userLanguage
			Lang.navLang = config.language || config.browserLanguage || config.userLanguage || Lang.navLang
			Lang.curLang = Lang.navLang
		} else if (typeof config === 'string') {
			Lang.curLang = config
		}
	}
}

// Auto detect browser language
Lang.init(window.navigator)

Lang.Dict = {
	ru: {
		$Native: 'Русский', $English: 'Russian',
		// Ошибки
		'Internal error: [msg]': 'Внутренняя ошибка: [msg]',
		'Browser does not support canvas-graphics':
			'Браузер не поддерживает canvas-графику',
		'Formula can not be displayed as text':
			'Формулу нельзя отобразить в текстовом виде',
		"Expected '(' after [S]":
			" Требуется '(' после [S]",
		"Unexpected '[C]'": "Неверный символ '[C]' в позиции [pos]",
		"Expected '[ok]' instead of '[bad]'":
			"Требуется '[ok]' вместо '[bad]' в позиции [pos]",
		"Invalid character '[C]'":
			"Недопустимый символ '[C]' в позиции [pos]",
		'Russian element character': // param: C
			"Недопустимый русский символ '[C]'. Для описания химического элемента должны использоваться только латинские символы.",
		'Non-latin element character': // param: C
			"Недопустимый символ '[C]'. Для описания химического элемента должны использоваться только латинские символы.",
		"Unknown element character '[C]'":
			"Недопустимый символ '[C]' описания реагента в позиции [pos]",
		"Expected '[C]'":
			"Требуется '[C]' в позиции [pos]",
		"Unknown element '[Elem]'":
			"Ошибочный элемент '[Elem]' в позиции [pos]",
		'Comment is not closed':
			'Не закрыт комментарий, начатый в позиции [pos]',
		'Abstract koefficient is not closed':
			'Не закрыт абстрактный коэффициент, начатый в позиции [pos]',
		'Abstract element is not closed':
			'Не закрыт абстрактный элемент, начатый в позиции [pos]',
		'Expected node declaration before charge':
			'Неизвестно, к чему нужно применить заряд в позиции [pos]',
		'Invalid charge declaration':
			'Ошибка в описании заряда в позиции [pos]',
		'It is necessary to close the bracket':
			'Необходимо закрыть скобку, открытую в позиции [pos]',
		'Undefined variable [name]':
			"Не определена числовая переменная '[name]' в позиции [pos]",
		"Invalid node reference '[ref]'":
			"Неправильная ссылка на узел '[ref]' в позиции [pos]",
		'Invalid branch close':
			'Нельзя закрыть ветку в позиции [pos], которая не открыта',
		'Cant close branch before bracket':
			'Нельзя закрыть ветку в позиции [pos], пока не закрыта скобка в позиции [pos0]',
		'Invalid bracket close':
			'Нет пары для скобки, закрытой в позиции [pos]',
		'It is necessary to close the branch':
			'Необходимо закрыть ветку, открытую в позиции [pos]',
		'Expected [must] instead of [have]':
			'Требуется [must] вместо [have] в позиции [pos]',
		'Invalid middle point':
			'Не используется промежуточная точка',
		'Cant create ring':
			'Невозможно создать кольцо',
		'Cant close ring':
			'Невозможно замкнуть кольцо',
		'Invalid version': 'Для формулы требуется CharChem версии [need] вместо [cur]',

		'(s)':'(тв)', '(l)':'(ж)', '(g)':'(г)', '(aq)':'(р-р)',
		'Periodic Table': 'Периодическая система химических элементов',
		'Table legend': 'Группы химических элементов',
		Group: 'Группа',
		Period: 'Период',
		Row: 'Ряд',
		'[x]-block': '[x]-блок',
		Lanthanides: 'Лантаноиды',
		Actinides: 'Актиноиды',
		'Alkali metals': 'Щелочные металлы',
		'Alkaline earth metals': 'Щёлочноземельные металлы',
		'Transition metals': 'Переходные металлы',
		'Post transition metals': 'Постпереходные металлы',
		Metalloids: 'Полуметаллы',
		'Other nonmetals': 'Неметаллы',
		Halogens: 'Галогены',
		'Noble gases': 'Инертные газы',
		'Unknown props': 'Св-ва неизвестны',
		H:'Водород', He:'Гелий', Li:'Литий', Be:'Бериллий', B:'Бор', C:'Углерод',
		N:'Азот', O:'Кислород', F:'Фтор', Ne:'Неон', Na:'Натрий', Mg:'Магний',
		Al:'Алюминий', Si:'Кремний', P:'Фосфор', S:'Сера', Cl:'Хлор', Ar:'Аргон',
		K:'Калий', Ca:'Кальций', Sc:'Скандий', Ti:'Титан', V:'Ванадий', Cr:'Хром',
		Mn:'Марганец', Fe:'Железо', Co:'Кобальт', Ni:'Никель', Cu:'Медь', Zn:'Цинк',
		Ga:'Галлий', Ge:'Германий', As:'Мышьяк', Se:'Селен', Br:'Бром', Kr:'Криптон',
		Rb:'Рубидий', Sr:'Стронций', Y:'Иттрий', Zr:'Цирконий', Nb:'Ниобий', Mo:'Молибден',
		Tc:'Технеций', Ru:'Рутений', Rh:'Родий', Pd:'Палладий', Ag:'Серебро', Cd:'Кадмий',
		In:'Индий', Sn:'Олово', Sb:'Сурьма', Te:'Теллур', I:'Йод', Xe:'Ксенон',
		Cs:'Цезий', Ba:'Барий', La:'Лантан', Ce:'Церий', Pr:'Празеодим', Nd:'Неодим',
		Pm:'Прометий', Sm:'Самарий', Eu:'Европий', Gd:'Гадолиний', Tb:'Тербий',
		Dy:'Диспрозий', Ho:'Гольмий', Er:'Эрбий', Tm:'Тулий', Yb:'Иттербий', Lu:'Лютеций',
		Hf:'Гафний', Ta:'Тантал', W:'Вольфрам', Re:'Рений', Os:'Осмий', Ir:'Иридий',
		Pt:'Платина', Au:'Золото', Hg:'Ртуть', Tl:'Таллий', Pb:'Свинец', Bi:'Висмут',
		Po:'Полоний', At:'Астат', Rn:'Радон', Fr:'Франций', Ra:'Радий', Ac:'Актиний',
		Th:'Торий', Pa:'Протактиний', U:'Уран', Np:'Нептуний', Pu:'Плутоний', Am:'Америций',
		Cm:'Кюрий', Bk:'Берклий', Cf:'Калифорний', Es:'Эйнштейний', Fm:'Фермий',
		Md:'Менделеевий', No:'Нобелий', Lr:'Лоуренсий', Rf:'Резерфордий', Db:'Дубний',
		Sg:'Сиборгий', Bh:'Борий', Hs:'Хассий', Mt:'Мейтнерий', Ds:'Дармштадтий',
		Rg:'Рентгений', Cn:'Коперниций'
	},
	en: {
		'Invalid version': 'Formula requires CharChem version [need] instead of [cur]',
		$Native: 'English', $English: 'English',
		'Table legend': 'Chemical element groups',
		H:'Hydrogen', He:'Helium', Li:'Lithium', Be:'Beryllium', B:'Boron', C:'Carbon',
		N:'Nitrogen', O:'Oxygen', F:'Fluorine', Ne:'Neon', Na:'Sodium', Mg:'Magnesium',
		Al:'Aluminium', Si:'Silicon', P:'Phosphorus', S:'Sulfur', Cl:'Chlorine', Ar:'Argon',
		K:'Potassium', Ca:'Calcium', Sc:'Scandium', Ti:'Titanium', V:'Vanadium', Cr:'Chromium',
		Mn:'Manganese', Fe:'Iron', Co:'Cobalt', Ni:'Nickel', Cu:'Copper', Zn:'Zinc',
		Ga:'Gallium', Ge:'Germanium', As:'Arsenic', Se:'Selenium', Br:'Bromine', Kr:'Krypton',
		Rb:'Rubidium', Sr:'Strontium', Y:'Yttrium', Zr:'Zirconium', Nb:'Niobium', Mo:'Molybdenum',
		Tc:'Technetium', Ru:'Ruthenium', Rh:'Rhodium', Pd:'Palladium', Ag:'Silver', Cd:'Cadmium',
		In:'Indium', Sn:'Tin', Sb:'Antimony', Te:'Tellurium', I:'Iodine', Xe:'Xenon',
		Cs:'Caesium', Ba:'Barium', La:'Lanthanum', Ce:'Cerium', Pr:'Praseodymium', Nd:'Neodymium',
		Pm:'Promethium', Sm:'Samarium', Eu:'Europium', Gd:'Gadolinium', Tb:'Terbium',
		Dy:'Dysprosium', Ho:'Holmium', Er:'Erbium', Tm:'Thulium', Yb:'Ytterbium', Lu:'Lutetium',
		Hf:'Hafnium', Ta:'Tantalum', W:'Tungsten', Re:'Rhenium', Os:'Osmium', Ir:'Iridium',
		Pt:'Platinum', Au:'Gold', Hg:'Mercury', Tl:'Thallium', Pb:'Lead', Bi:'Bismuth',
		Po:'Polonium', At:'Astatine', Rn:'Radon', Fr:'Francium', Ra:'Radium', Ac:'Actinium',
		Th:'Thorium', Pa:'Protactinium', U:'Uranium', Np:'Neptunium', Pu:'Plutonium', Am:'Americium',
		Cm:'Curium', Bk:'Berkelium', Cf:'Californium', Es:'Einsteinium', Fm:'Fermium',
		Md:'Mendelevium', No:'Nobelium', Lr:'Lawrencium', Rf:'Rutherfordium', Db:'Dubnium',
		Sg:'Seaborgium', Bh:'Bohrium', Hs:'Hassium', Mt:'Meitnerium', Ds:'Darmstadtium',
		Rg:'Roentgenium', Cn:'Copernicium'
	}
}


export default Lang
