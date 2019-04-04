/** @format */

/**
 * External dependencies
 */
const babel = require( '@babel/core' );

describe( 'babel-lodash-es', () => {
	function transform( code ) {
		return babel.transformSync( code, { configFile: false, plugins: [ require( '..' ) ] } ).code;
	}

	test( 'should transform named import from top-level package', () => {
		const code = transform( "import { get } from 'lodash';" );
		expect( code ).toBe( 'import { get } from "lodash-es";' );
	} );

	test( 'should transform default import from top-level package', () => {
		const code = transform( "import _ from 'lodash';" );
		expect( code ).toBe( 'import _ from "lodash-es";' );
	} );

	test( 'should transform default import from a submodule', () => {
		const code = transform( "import get from 'lodash/get'" );
		expect( code ).toBe( 'import { get } from "lodash-es";' );
	} );

	test( 'should transform aliased default import from a submodule', () => {
		const code = transform( "import theGet from 'lodash/get';" );
		expect( code ).toBe( 'import { get as theGet } from "lodash-es";' );
	} );

	test( 'should report error on a non-default import from a submodule', () => {
		const code = 'import { get } from "lodash/get"';
		expect( () => transform( code ) ).toThrow( /Could not transform a non-default import/ );
	} );
} );
