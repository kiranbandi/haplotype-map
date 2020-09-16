import React, { Component } from 'react';
import { schemeCategory10 } from 'd3';
import HapmapTrack from './HapmapTrack';

export default class Dashboard extends Component {

    render() {
        let { colorMap = [], germplasmLines = [] } = this.props;
        const width = 1000;

        return (
            <svg className='hapmap-svg m-a' width={width} height='1000'>
                {_.map(colorMap, (track, trackIndex) => <HapmapTrack
                    key={'track-' + trackIndex}
                    width={width}
                    yPosition={(trackIndex * 50) + 10}
                    trackID={germplasmLines[trackIndex]}
                    matchColor={schemeCategory10[0]}
                    // repeat over 9 colors
                    diffColor={schemeCategory10[1 + (trackIndex % 9)]}
                    trackData={track.slice(0,1000)} />)}
            </svg>
        );
    }
}


