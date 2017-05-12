/**
 * Created by PeterWin on 05.05.2017.
 */
const path = new require('path')

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: './src/ChemSys.js',

	output: {
		filename: 'charchem.js',
		path: path.resolve(__dirname, 'dst')
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}
			}
		]
	}
}
