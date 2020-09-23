import * as types from '../actions/actionTypes';
import initialState from './initialState';

// Perils of having a nested tree strucutre in the Redux State XD XD XD 
export default function oracleReducer(state = initialState.oracle, action) {
  switch (action.type) {
    case types.SET_LOADER_STATE:
      return Object.assign({}, state, { loaderState: action.loaderState })
    case types.SET_SOURCE_LINE:
      return Object.assign({}, state, { sourceLine: action.sourceLine })
    case types.SET_TARGET_LINES:
      return Object.assign({}, state, { targetLines: action.targetLines })
    default:
      return state;
  }
}