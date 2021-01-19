import React, { Component } from 'react';
import { TRACK_HEIGHT } from '../utils/chartConstants';
import _ from 'lodash';
import { min, scaleLinear, scaleBand } from 'd3';

import {
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateRdBu, interpolatePuOr,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma
} from 'd3';



export default class TraitMap extends Component {

    render() {
        const { trait = '', traitMapID = 'tree_ID_default',
            traitList = [], traitMap = [] } = this.props;

        const selectedTrait = _.find(traitList, (d) => d == trait) || traitList[0];
        const height = 51 * TRACK_HEIGHT, width = 350;

        const xScale = scaleLinear()
            .domain([0, traitList.length])
            .range([0, width]);

        const xBoxSize = width / (traitList.length)

        const yScale = scaleLinear()
            .domain([0, traitMap.length - 1])
            .range([14, height]);

        let boxList = [], textList = [], labelList = [], SelectedTraitMarker;

        const sortedTraitMap = _.sortBy(traitMap, (d) => d[selectedTrait]);

        const traitMatrix = _.map(traitList, (trait, traitIndex) => {

            const traitValues = _.map(sortedTraitMap, (d) => d[trait]),
                isCategorical = isNaN(+traitValues[0]),
                maxValue = _.max(traitValues),
                minValue = _.min(traitValues);

            if (selectedTrait == trait) {
                SelectedTraitMarker = <rect width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                    fill={"#1997c6"}
                    x={xScale(traitIndex)} y={0} />
            }

            labelList.push(<text className='trait-label' x={xScale(traitIndex) + 10} y={10}>{trait}</text>);

            const colorScale = scaleLinear().domain([minValue, maxValue]).range([0, 1]);
            const customColorScale = interpolateViridis;

            if (!isCategorical) {
                _.map(traitValues, (traitValue, traitInnerIndex) => {
                    boxList.push(<rect width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                        fill={customColorScale(colorScale(traitValue))}
                        x={xScale(traitIndex)} y={yScale(traitInnerIndex) + 0.5}
                    />)

                    textList.push(<text
                        fill={(colorScale(traitValue) > 0.6) ? 'black' : 'white'}
                        x={xScale(traitIndex) + 10} y={yScale(traitInnerIndex) + 4 + (TRACK_HEIGHT / 2)}>
                        {('' + traitValue).slice(0, 5)}</text>);
                });
            }
            else {

                const groupedDataList = Object.keys(_.groupBy(traitValues));

                const ordinalColorScale = scaleBand()
                    .domain(groupedDataList)
                    .range([0, 1]);

                _.map(traitValues, (traitValue, traitInnerIndex) => {
                    boxList.push(<rect width={xBoxSize * 0.9} height={TRACK_HEIGHT - 0.5}
                        fill={customColorScale(ordinalColorScale(traitValue))}
                        x={xScale(traitIndex)} y={yScale(traitInnerIndex) + 0.5}
                    />)

                    textList.push(<text
                        fill={(ordinalColorScale(traitValue) > 0.6) ? 'black' : 'white'}
                        x={xScale(traitIndex) + 10} y={yScale(traitInnerIndex) + 4 + (TRACK_HEIGHT / 2)}>
                        {('' + traitValue).slice(0, 5)}</text>);
                });
            }
        });

        return (<div className='traitmap-container visible-lg-inline-block'>
            <svg id={traitMapID} className="mx-auto text-center"
                width={width} height={height + 20}>
                {SelectedTraitMarker}
                {labelList}
                {boxList}
                {textList}
            </svg>
        </div>);
    }
}
