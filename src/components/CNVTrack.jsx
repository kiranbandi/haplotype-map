import React, { Component } from 'react';
import { TRACK_HEIGHT } from '../utils/chartConstants';

export default class GeneTrack extends Component {

    render() {
        const { cnvMap, lineNames, genomeMap, chartScale, width, height } = this.props;

        // // transform genomic coordinates to chart scale point and create list 
        let cnvMarkersPositions = _.reduce(lineNames, (acc, line, lineIndex) => {
            // For each line get the CNV markers in it then for each set the
            return acc.concat(_.map(cnvMap[line],
                (d) => seekGenomeCoords(genomeMap, chartScale, d, lineIndex)))
        }, []);

        let cnvMarkers = _.map(_.filter(cnvMarkersPositions, (c) => c.inside), (cnvPoint, ci) => {
            return <circle key={'cnv-' + ci}
                r={5}
                className={'cnv-circle ' + (cnvPoint.type == 'DUP' ? ' duplicate' : 'deletion')}
                cx={cnvPoint.x}
                cy={cnvPoint.y}></circle>
        });
        return (<svg className="cnv-track" width={width} height={height}>{cnvMarkers}</svg>);
    }
}


