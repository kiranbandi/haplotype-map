import React, { Component } from 'react';
import { TRACK_HEIGHT } from '../utils/chartConstants';
import _ from 'lodash';
import { scaleLinear, scaleBand } from 'd3';
import { interpolateViridis, interpolateInferno, interpolatePlasma, interpolateMagma } from 'd3';


export default class TraitMap extends Component {

    render() {
        const { trait = '', traitMapID = 'tree_ID_default',
            traitList = [], lineCount, traitMap = [], verticalShift } = this.props;


        const selectedTrait = _.find(traitList, (d) => d == trait) || traitList[0];
        const height = (lineCount - 1) * TRACK_HEIGHT, width = 300;

        const xScale = scaleLinear()
            .domain([0, traitList.length])
            .range([0, width]);

        const xBoxSize = width / (traitList.length);
        // Each text character takes around 8px so 
        // so only trim to the size the text can fit in the box
        const trimFactor = xBoxSize / 8;

        const yScale = scaleLinear()
            .domain([0, traitMap.length - 1])
            .range([14, height]);

        let boxList = [], textList = [], labelList = [];

        const sortedTraitMap = _.sortBy(traitMap, (d) => d[selectedTrait]);

        const traitMatrix = _.map(traitList, (trait, traitIndex) => {

            const traitValues = _.map(sortedTraitMap, (d) => d[trait]),
                isCategorical = isNaN(+traitValues[0]),
                maxValue = _.max(traitValues),
                minValue = _.min(traitValues);


            const [trait_code, trait_description = ''] = trait.split('-');

            labelList.push(
                <g key={'trait-label-' + traitIndex}>
                    <rect width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                        fill={selectedTrait == trait ? "#1997c6" : '#414141'} x={xScale(traitIndex)} y={0}></rect>
                    <text className='trait-label' x={xScale(traitIndex) + 10} y={10}>
                        {trait_code}
                        <title>{trait_description}</title>
                    </text>
                </g>
            );

            const colorScale = scaleLinear().domain([minValue, maxValue]).range([0, 1]);
            const customColorScale = interpolateViridis;

            if (!isCategorical) {
                _.map(traitValues, (traitValue, traitInnerIndex) => {
                    boxList.push(<rect key={'trait-box-' + traitIndex + '_' + traitInnerIndex}
                        width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                        fill={customColorScale(colorScale(traitValue))}
                        x={xScale(traitIndex)} y={yScale(traitInnerIndex) + 0.5}
                    />)

                    textList.push(<text
                        key={'trait-value-' + traitIndex + '_' + traitInnerIndex}
                        fill={(colorScale(traitValue) > 0.6) ? 'black' : 'white'}
                        x={xScale(traitIndex) + 10} y={yScale(traitInnerIndex) + 4 + (TRACK_HEIGHT / 2)}>
                        {('' + traitValue).trim().slice(0, trimFactor)}
                        <title>{traitValue}</title>
                    </text>);
                });
            }
            else {

                const groupedDataList = Object.keys(_.groupBy(traitValues));

                const ordinalColorScale = scaleBand()
                    .domain(groupedDataList)
                    .range([0, 1]);

                _.map(traitValues, (traitValue, traitInnerIndex) => {
                    boxList.push(<rect
                        key={'trait-box-' + traitIndex + '_' + traitInnerIndex}
                        width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                        fill={customColorScale(ordinalColorScale(traitValue))}
                        x={xScale(traitIndex)} y={yScale(traitInnerIndex) + 0.5}
                    />)

                    textList.push(<text
                        key={'trait-value-' + traitIndex + '_' + traitInnerIndex}
                        fill={(ordinalColorScale(traitValue) > 0.6) ? 'black' : 'white'}
                        x={xScale(traitIndex) + 10} y={yScale(traitInnerIndex) + 4 + (TRACK_HEIGHT / 2)}>
                        {('' + traitValue).trim().slice(0, trimFactor)}
                        <title>{traitValue}</title>
                    </text>);
                });
            }
        });

        return (<div className={'traitmap-container visible-lg-inline-block' + (verticalShift ? ' vertical-shift' : '')}>
            <svg id={traitMapID} className="mx-auto text-center"
                width={width} height={height + 20}>
                {labelList}
                {boxList}
                {textList}
            </svg>
        </div>);
    }
}
