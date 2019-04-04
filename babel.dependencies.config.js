/** @format */
const path = require( 'path' );

const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

// Use lodash-es for client and lodash for server.
const [ from, to ] = isBrowser ? [ 'lodash', 'lodash-es' ] : [ 'lodash-es', 'lodash' ];

const config = {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/env',
			{
				modules: false,
				useBuiltIns: 'entry',
				corejs: 2,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
	],
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
		[ path.join( __dirname, 'server', 'bundler', 'babel', 'babel-lodash-es' ), { from, to } ],
		[
			'@babel/transform-runtime',
			{
				corejs: false, // we polyfill so we don't need core-js
				helpers: true,
				regenerator: false,
				useESModules: false,
			},
		],
	],
};

module.exports = config;
