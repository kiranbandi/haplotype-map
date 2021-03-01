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
    case types.SET_COLOR_SCHEME:
      return Object.assign({}, state, { colorScheme: action.colorScheme })
    case types.SET_TRAIT:
      return Object.assign({}, state, { trait: action.trait })
    case types.SET_TOOLTIP_VISIBILITY:
      return Object.assign({}, state, { isTooltipVisible: action.isTooltipVisible })
    case types.SET_TOOLTIP_DATA:
      return Object.assign({}, state, { tooltipData: action.tooltipData })
    case types.SET_ACTIVE_TRAITS:
      return Object.assign({}, state, { activeTraitList: [...action.activeTraitList] })
    case types.SET_REFERENCE_TYPE:
      return Object.assign({}, state, { referenceType: action.referenceType })
    case types.SET_SELECTED_CHROM:
      return Object.assign({}, state, { selectedChromosome: action.selectedChromosome })
    case types.SET_REGION_WINDOW:
      return Object.assign({}, state, { regionStart: action.region.start, regionEnd: action.region.end })
    case types.SET_DASHBOARD_DEFAULTS:
      return Object.assign({}, state, {
        sourceLine: action.defaults.sourceLine,
        targetLines: action.defaults.targetLines,
        selectedChromosome: action.defaults.selectedChromosome,
        activeTraitList: [...action.defaults.activeTraitList]
      })
    default:
      return state;
  }
}