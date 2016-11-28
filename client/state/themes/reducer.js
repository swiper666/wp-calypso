/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import themes from './themes/reducer';
import themeDetails from './theme-details/reducer';
import themesList from './themes-list/reducer';
import ThemeQueryManager from 'lib/query-manager/theme';
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
	THEME_CLEAR_ACTIVATED,
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	getSerializedThemesQuery
} from './utils';
import { createReducer, isValidStateWithSchema } from 'state/utils';
import { queriesSchema, activeThemesSchema } from './schema';
import themesUI from './themes-ui/reducer';
import uploadTheme from './upload-theme/reducer';

/**
 * Returns the updated active theme state after an action has been
 * dispatched. The state reflects a mapping of site ID to theme ID where
 * theme ID represents active theme for the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const activeThemes = createReducer( {}, {
	[ THEME_ACTIVATE_REQUEST_SUCCESS ]: ( state, { siteId, theme } ) => ( {
		...state,
		[ siteId ]: theme.id
	} ),
	[ ACTIVE_THEME_REQUEST_SUCCESS ]: ( state, { siteId, themeId } ) => ( {
		...state,
		[ siteId ]: themeId
	} ) },
	activeThemesSchema
 );

/**
 * Returns the updated theme activation state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a theme is being activated on that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function activationRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_ACTIVATE_REQUEST:
		case THEME_ACTIVATE_REQUEST_SUCCESS:
		case THEME_ACTIVATE_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: THEME_ACTIVATE_REQUEST === action.type
			};

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated completed theme activation requess state after an action has been
 * dispatched. The state reflects a mapping of site ID to boolean, reflecting whether
 * activation request has finished or has been cleared.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const completedActivationRequests = createReducer( {}, {
	[ THEME_ACTIVATE_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: true,
	} ),
	[ THEME_CLEAR_ACTIVATED ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: false,
	} ) }
);

/**
 * Returns the updated active theme request state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a request for active theme is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function activeThemeRequests( state = {}, action ) {
	switch ( action.type ) {
		case ACTIVE_THEME_REQUEST:
		case ACTIVE_THEME_REQUEST_SUCCESS:
		case ACTIVE_THEME_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: ACTIVE_THEME_REQUEST === action.type
			};

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated site theme requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * boolean reflecting whether a request for the theme is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function themeRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_REQUEST:
		case THEME_REQUEST_SUCCESS:
		case THEME_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.themeId ]: THEME_REQUEST === action.type
				} )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated theme query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEMES_REQUEST:
		case THEMES_REQUEST_SUCCESS:
		case THEMES_REQUEST_FAILURE:
			const serializedQuery = getSerializedThemesQuery( action.query, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: THEMES_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated theme query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of theme IDs
 * for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: ( new ThemeQueryManager( null, { itemKey: 'id' } ) )[ method ]( ...args )
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );
		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager
		};
	}
	return createReducer( {}, {
		[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query, themes, found } ) => {
			return applyToManager( state, siteId, 'receive', true, themes, { query, found } );
		},
		[ THEMES_RECEIVE ]: ( state, { siteId, themes } ) => {
			return applyToManager( state, siteId, 'receive', true, themes );
		},
		[ SERIALIZE ]: ( state ) => {
			return mapValues( state, ( { data, options } ) => ( { data, options } ) );
		},
		[ DESERIALIZE ]: ( state ) => {
			if ( ! isValidStateWithSchema( state, queriesSchema ) ) {
				return {};
			}

			return mapValues( state, ( { data, options } ) => {
				return new ThemeQueryManager( data, options );
			} );
		}
	} );
} )();

/**
 * Returns the updated themes last query state.
 * The state reflects a mapping of site Id to last query that was issued on that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const lastQuery = createReducer( {}, {
	[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query } ) => ( {
		...state,
		[ siteId ]: query
	} )
} );

export default combineReducers( {
	// Old reducers:
	themes,
	themeDetails,
	themesList,
	// New reducers:
	queries,
	// queryRequests,
	// lastQuery
	themeRequests,
	activeThemes,
	activeThemeRequests,
	activationRequests,
	completedActivationRequests,
	themesUI,
	uploadTheme
} );
