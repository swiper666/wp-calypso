/** @format */

module.exports = function( { types } ) {
	return {
		visitor: {
			ImportDeclaration( path, state ) {
				const { source } = path.node;
				let { from, to } = state.opts;

				// Defaults: transform from `lodash` to `lodash-es`.
				from = from || 'lodash';
				to = to || 'lodash-es';

				// Transform any import with exact match, no submodule
				const lodashMatch = source.value.match( new RegExp( `^${ from }$` ) );
				if ( lodashMatch ) {
					source.value = to;
					return;
				}

				// Transform default import from a submodule to named import
				// Example with defaults:
				// In: import theGet from 'lodash/get'
				// Out: import { get as theGet } from 'lodash-es'
				const subMatch = source.value.match( new RegExp( `^${ from }/(.*)` ) );
				if ( subMatch ) {
					const { specifiers } = path.node;
					// If there is anything else than a single default import, throw an error. Such an
					// import is not valid. Example: import { get } from 'lodash/get'
					// There is only the default export in 'lodash/get' and no named one.
					if (
						! specifiers ||
						specifiers.length !== 1 ||
						specifiers[ 0 ].type !== 'ImportDefaultSpecifier'
					) {
						throw path.buildCodeFrameError(
							'babel-lodash-es: Could not transform a non-default import from lodash/submodule'
						);
					}

					// Transforms
					//  `import theGet from 'lodash/get'`
					// to
					//  `import { get as theGet } from 'lodash-es'`
					const localIdentifier = specifiers[ 0 ].local;
					const importedIdentifier = types.identifier( subMatch[ 1 ] );
					const specifier = types.importSpecifier( localIdentifier, importedIdentifier );
					const declaration = types.importDeclaration( [ specifier ], types.stringLiteral( to ) );
					path.replaceWith( declaration );
				}
			},
		},
	};
};
