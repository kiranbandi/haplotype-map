import * as types from './actionTypes';
import _ from 'lodash';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function setGenomicData(data) {
    return { type: types.SET_GENOME_DATA, data };
}







