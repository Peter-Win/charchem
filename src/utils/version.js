/*
 * Version of library
 */
const ver = () =>
	[1, 1, 2] // This values must be equal to version in package.json

const verStr = () =>
	ver().join('.')


module.exports = {
	ver,
	verStr,
}