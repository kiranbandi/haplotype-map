import React, { Component } from 'react';
import {
    scaleSequential,
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma, select
} from 'd3';
// create custom color groups
const colorGroup = {
    'red': interpolateReds, 'green': interpolateGreens,
    'blue': interpolateBlues, 'orange': interpolateOranges,
    'viridis': interpolateViridis, 'inferno': interpolateInferno,
    'plasma': interpolatePlasma, 'magma': interpolateMagma,
    'blue and green': interpolateBuGn,
    'red and blue': interpolateRdBu, 'purple and orange': interpolatePuOr,
    'red,yellow and blue': interpolateRdYlBu, 'red, yellow and green': interpolateRdYlGn
};



import { legendColor } from 'd3-svg-legend';

export default class Legend extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {
        const { title = '', activeColorScale } = this.props;

        var sequentialScale = scaleSequential(colorGroup[activeColorScale])
            .domain([0, 1]);

        var legendSequential = legendColor()
            .shapeWidth(20)
            .shapePadding(0)
            .cells(20)
            .orient("horizontal")
            .title(title)
            .titleWidth(500)
            .labels(e => (e['i'] == 0 ? 'Low' : e['i'] == 19 ? 'High' : ''))
            .scale(sequentialScale)

        select(".legendSequential")
            .call(legendSequential);

    }


    render() {

        const { width = 500 } = this.props, translateLeft = 25, translateTop = 10;
        return (
            <svg style={{ 'fill': 'white' }} className='custom-legend' ref={node => this.node = node} width={width}>
                <g className='legendSequential' transform={'translate(' + translateLeft + ',' + translateTop + ')'}></g>
            </svg>
        );
    }
}