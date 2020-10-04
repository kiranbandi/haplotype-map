import React, { Component } from 'react';
import { TRACK_HEIGHT } from '../utils/chartConstants';

export default class GeneTrack extends Component {

    render() {
        const { cnvMap, lineNames, genomeMap, markerCount, chartScale, width, height } = this.props;

        // // transform genomic coordinates to chart scale point and create list 
        let cnvMarkersPositions = _.reduce(lineNames, (acc, line, lineIndex) => {
            // For each line get the CNV markers in it then for each set the
            return acc.concat(_.map(cnvMap[line],
                (d) => seekGenomeCoords(genomeMap, markerCount, chartScale, d, lineIndex)))
        }, []);

        let cnvMarkers = _.map(cnvMarkersPositions, (cnvPoint, ci) => {
            return <circle key={'cnv-' + ci}
                r={5}
                className={'cnv-circle ' + (cnvPoint.type == 'DUP' ? ' duplicate' : 'deletion')}
                cx={cnvPoint.x}
                cy={cnvPoint.y}></circle>
        });
        return (<svg className="cnv-track" width={width} height={height}>{cnvMarkers}</svg>);
    }
}


function seekGenomeCoords(genomeMap, markerCount, chartScale, genePoint, yIndex) {
    let startIndex = 0, endIndex = 0;
    // typecast to numbers
    let genomicStart = +genePoint.start, genomicEnd = +genePoint.end;
    // check only if start and end positions are valid numbers
    // and one of them is non empty
    if (!isNaN(genomicStart) && !isNaN(genomicEnd)) {
        startIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= genomicStart) || 0;
        endIndex = _.findIndex(genomeMap.referenceMap, (d) => +d.position >= genomicEnd) || markerCount;
    }
    // we need a minimum gap for a gene if not we make it atleast a 10 pixels wide
    const minGeneWidth = Math.round(chartScale.invert(10));
    if (endIndex - startIndex < minGeneWidth) {
        endIndex = startIndex + minGeneWidth;
        // if the endIndex is close to the end clamp it
        endIndex = endIndex >= markerCount ? markerCount - 1 : endIndex;
    }
    return { ...genePoint, 'y': (yIndex * TRACK_HEIGHT) + 10, 'x': Math.round(chartScale(startIndex)), 'dx': Math.round(chartScale(endIndex - startIndex)) };
}