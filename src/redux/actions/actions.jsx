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

export function setTargetLines(targetLines) {
    return { type: types.SET_TARGET_LINES, targetLines };
}

export function setSelectedChromosome(selectedChromosome) {
    return { type: types.SET_SELECTED_CHROM, selectedChromosome };
}

export function setDashboardDefaults(sourceLine, targetLines, selectedChromosome) {
    return { type: types.SET_DASHBOARD_DEFAULTS, 'defaults': { sourceLine, targetLines, selectedChromosome } };
}





