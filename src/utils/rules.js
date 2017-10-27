/*
 * Rules for text formulas
 * For example, H2SO4 can be transfromed into H<sub>2</sub>SO<sub>4</sub>
 */

// Правила для формирования HTML-представления формулы
const rulesHtml = {
	AgentK: '<b>*</b>',
	ItemMass: '<sup>*</sup>',
	ItemCnt: '<sub>*</sub>',
	BracketCnt: '<sub>*</sub>',
	ItemCharge: '<sup class="echem-item-charge">*</sup>',
	ColorPre: '<span style="color:*">',
	ColorPost: '</span>',
	NodeCharge: '<sup>*</sup>',
	Custom: '<i>*</i>',
	Radical: '*',
	Comment: '<em>*</em>',
	OpComment: '<span class="echem-opcomment">*</span>',
	Operation: '<span class="echem-op">*</span>',
	// Правило для вывода атомной массы и номера слева от элемента. Имеет два аргумента @=масса, *=номер
	MassAndNum: '<span class="echem-mass-and-num">@<br/>*</span>',
	$InvisibleBond: ' ',	// Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
	Mul: '*',	// Конструкция умножения внутри агента CuSO4_*5_H2O
	MultiK: '*',	// Коэффициент 5 в конструкции CuSO4*5H2O
	$MulChar: '∙',	// Символ умножения. Варианты: x * × ∙
}

// Правила для формирования BB-кода представления формулы (для вставки в форумы)
const rulesBB = {
	AgentK: '[b]*[/b]',
	ItemMass: '[sup]*[/sup]',
	ItemCnt: '[sub]*[/sub]',
	BracketCnt: '[sub]*[/sub]',
	ItemCharge: '[sup]*[/sup]',
	ColorPre: '[color=*]',
	ColorPost: '[/color]',
	NodeCharge: '[sup]*[/sup]',
	Custom: '[i]*[/i]',
	Radical: '*',
	Comment: '[i]*[/i]',
	// Правило для вывода атомной массы и номера слева от элемента. Имеет два аргумента @=масса, *=номер
	MassAndNum: '[sup]@[/sup][sub]*[/sub]',
	$InvisibleBond: ' ',	// Для вывода невидимой связи типа -0 или _(x1,N0). Можно заменить на &nbsp;
	$MulChar: '∙',	// Символ умножения. Варианты: x * × ∙
}

// Правила для текстового представления формул
const rulesText = {
	AgentK: '*',
	ItemCnt: '*',
	ItemCharge: '*',
	NodeCharge: '*',
	Custom: '*',
	ColorPre: '',
	ColorPost: '',
}

module.exports = {rulesHtml, rulesBB, rulesText}