import * as types from './actionTypes';
import _ from 'lodash';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function setGenomicData(data) {
    return { type: types.SET_GENOME_DATA, data };
}

export function setSourceLine(sourceLine) {
    return { type: types.SET_SOURCE_LINE, sourceLine };
}

export function setColorScheme(colorScheme) {
    return { type: types.SET_COLOR_SCHEME, colorScheme };
}

export function setTrait(trait) {
    return { type: types.SET_TRAIT, trait };
}

export function setTooltipData(tooltipData) {
    return { type: types.SET_TOOLTIP_DATA, tooltipData };
}

export function showTooltip(isTooltipVisible, tooltipData) {
    return dispatch => {
        if (!!tooltipData) {
            dispatch(setTooltipData(tooltipData));
        }
        dispatch({ type: types.SET_TOOLTIP_VISIBILITY, isTooltipVisible });
    };
}

export function setActiveTraitList(activeTraitList) {
    return { type: types.SET_ACTIVE_TRAITS, activeTraitList };
}

export function setReferenceTypeChange(referenceType) {
    return { type: types.SET_REFERENCE_TYPE, referenceType };
}

export function setTargetLines(targetLines) {
    return { type: types.SET_TARGET_LINES, targetLines };
}

export function setSelectedChromosome(selectedChromosome) {
    // set both
    return dispatch => {
        dispatch(setRegionWindow({ 'start': 0, 'end': 0 }));
        dispatch({ type: types.SET_SELECTED_CHROM, selectedChromosome });
    };
}

export function setDashboardDefaults(sourceLine, targetLines, selectedChromosome, activeTraitList = []) {
    return {
        type: types.SET_DASHBOARD_DEFAULTS,
        'defaults': {
            sourceLine,
            targetLines,
            selectedChromosome,
            activeTraitList
        }
    };
}

export function setRegionWindow(region) {
    return { type: types.SET_REGION_WINDOW, region };
}







