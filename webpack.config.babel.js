'use strict';

import webpack from 'webpack';
import WebpackShellPlugin from 'webpack-shell-plugin';

export default {
	entry:  './client/js/App.js',
	output: {
		path: './dist',
		filename: '[name]-bundle.js'
	},
	watch: true,
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				exclude: '/node_modules/',
				test: /\.js?$/
			},
			{
				test: /\.scss$/,
				exclude: '/node_modules/',
				loaders: ['style', 'css', 'sass']
			}
		]
	},
	plugins: [
		new WebpackShellPlugin({
			onBuildStart: ['echo "Starting"'],
			onBuildEnd: ['node -r babel-register ./server/server.js']
		})
	],
	node: {
		fs: 'empty'
	},
	resolve: {
		extensions: ['', '.js', '.scss']
	}
}
