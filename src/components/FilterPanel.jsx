import React, { Component } from 'react';
import ReactSelect from 'react-select';
import {
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma
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

const colorScaleOptions = _.keys(colorGroup).map((d) => ({ 'label': d, 'value': d }));

export default class FilterPanel extends Component {

    render() {

        let { chromosomeKeys, activeChromosomeID, activeColorScale } = this.props,
            chromosomOptions = _.map(chromosomeKeys, (d, i) => ({ 'label': d, 'value': i })),
            activeChromosome = _.find(chromosomOptions, (d) => d.value == activeChromosomeID),
            selectedColorScale = _.find(colorScaleOptions, (d) => d.value == activeColorScale);

        return (
            <div className='filter-panel m-t text-center'>
                <div className="compare-select">
                    <span className='inner-span'>Select Chromosome</span>
                    <ReactSelect
                        isSearchable={false}
                        className='select-box color-scheme'
                        value={activeChromosome}
                        options={chromosomOptions}
                        styles={selectStyle}
                        onChange={this.props.setActiveChromosomeID} />
                </div>
                <div className="compare-select">
                    <span className='inner-span'>Select Colour Scheme</span>
                    <ReactSelect
                        isSearchable={false}
                        className='select-box color-scheme'
                        value={selectedColorScale}
                        options={colorScaleOptions}
                        styles={selectStyle}
                        onChange={this.props.setActiveColorScale} />
                </div>
            </div>
        );
    }
}

const selectStyle = {
    option: (styles) => ({
        ...styles,
        color: 'black', textAlign: 'left'
    })
};