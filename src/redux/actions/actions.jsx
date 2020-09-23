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







