/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );

const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

// Use commonjs for Node
const modules = isBrowser ? false : 'commonjs';
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = {
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	presets: [
		[
			'@babel/env',
			{
				modules,
				useBuiltIns: 'entry',
				corejs: 2,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
	],
	plugins: _.compact( [
		[
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-wpcalypso-async'
			),
			{ async: isBrowser && codeSplit },
		],
		isBrowser && [
			'module-resolver',
			{
				alias: {
					lodash: 'lodash-es',
					'lodash/': ( [ , name ] ) => `lodash-es/${ name }`,
				},
			},
		],
		isBrowser && './inline-imports.js',
	] ),
	overrides: [
		{
			test: [ './client/gutenberg/extensions' ],
			plugins: [
				[
					'@wordpress/import-jsx-pragma',
					{
						scopeVariable: 'createElement',
						source: '@wordpress/element',
						isDefault: false,
					},
				],
				[
					'@babel/transform-react-jsx',
					{
						pragma: 'createElement',
					},
				],
			],
		},
	],
	env: {
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [
				'add-module-exports',
				'babel-plugin-dynamic-import-node',
				[
					'module-resolver',
					{
						alias: {
							'lodash-es': 'lodash',
							'lodash-es/': ( [ , name ] ) => `lodash/${ name }`,
						},
					},
				],
			],
		},
	},
};

module.exports = config;
