import React, { Component } from 'react';
import { scaleLinear, format } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import {
    MISSING_COLOR, LABEL_WIDTH, CHART_WIDTH,
    MATCH_COLOR, COLOR_LIST, TRACK_HEIGHT
} from '../utils/chartConstants';
import { drawLines, clearAndGetContext, drawLabels } from '../utils/canvasUtilities';

export default class RegionMap extends Component {

    componentDidMount() {
        let { lineMap = [], lineNames, genomeMap, regionStart = 0, regionEnd = 0 } = this.props;

        // if both are zero then create a xScale and use a 50px wide window
        const lineDataLength = genomeMap.referenceMap.length,
            xScale = scaleLinear()
                .domain([0, lineDataLength - 1])
                .range([0, CHART_WIDTH]);

        if (regionStart == 0 && regionEnd == 0) {
            regionEnd = Math.round(xScale.invert(50));
        }

        let modifiedLineMap = _.map(lineMap, (l) => ({
            'lineName': l.lineName,
            'lineData': l.lineData.slice(regionStart, regionEnd)
        })),
            modifiedGenomeMap = {
                'chromID': genomeMap.chromID,
                'startIndex': regionStart,
                'endIndex': regionEnd,
                'start': genomeMap.referenceMap[regionStart].position,
                'end': genomeMap.referenceMap[regionEnd - 1].position,
                'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd)
            };

        if (lineMap.length > 0) {
            drawChart(this.canvas, modifiedLineMap, modifiedGenomeMap);
            drawLabels(this["canvas-label"], lineNames);
        }

    }

    componentDidUpdate() {
        let { lineMap = [], lineNames, genomeMap, regionStart, regionEnd } = this.props;

        // if both are zero then create a xScale and use a 100px wide window
        const lineDataLength = genomeMap.referenceMap.length,
            xScale = scaleLinear()
                .domain([0, lineDataLength - 1])
                .range([0, CHART_WIDTH]);

        if (regionStart == 0 && regionEnd == 0) {
            regionEnd = Math.round(xScale.invert(50));
        }

        let modifiedLineMap = _.map(lineMap, (l) => ({
            'lineName': l.lineName,
            'lineData': l.lineData.slice(regionStart, regionEnd)
        })),
            modifiedGenomeMap = {
                'chromID': genomeMap.chromID,
                'startIndex': regionStart,
                'endIndex': regionEnd,
                'start': genomeMap.referenceMap[regionStart].position,
                'end': genomeMap.referenceMap[regionEnd - 1].position,
                'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd)
            };

        if (lineMap.length > 0) {
            drawChart(this.canvas, modifiedLineMap, modifiedGenomeMap);
            drawLabels(this["canvas-label"], lineNames);
        }
    }

    render() {
        const { lineNames } = this.props;

        return (<div className='subchart-container'>
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <canvas
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={(lineNames.length * TRACK_HEIGHT) + 65}
                        ref={(el) => { this.canvas = el }} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={(lineNames.length * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}


function drawChart(canvas, lineMap, genomeMap) {

    let context = clearAndGetContext(canvas);

    // set line width 
    context.lineWidth = 15;

    const lineNames = _.map(lineMap, (d) => d.lineName);
    let lineDataLength = genomeMap.referenceMap.length;

    let xScale = scaleLinear()
        .domain([0, lineDataLength - 1])
        .range([0, CHART_WIDTH]);

    const lineCollection = generateLinesFromMap(lineMap, xScale, TRACK_HEIGHT);

    // remove white and base color from the group and draw them first
    drawLines(canvas, lineCollection[1], MATCH_COLOR);
    drawLines(canvas, lineCollection[0], MISSING_COLOR);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLines(canvas, lineCollection[d], COLOR_LIST[d - 2])
        });

    drawXAxisPoisitonalMarkers(genomeMap, lineNames, TRACK_HEIGHT, context, xScale);
}


function drawXAxisPoisitonalMarkers(genomeMap, lineNames, TRACK_HEIGHT, context, xScale) {

    const { start, end, referenceMap } = genomeMap;

    const chromosomeScale = scaleLinear()
        .domain([start, end])
        .range([0, CHART_WIDTH]);

    const verticalHeight = (lineNames.length * TRACK_HEIGHT) + 2;

    // for every marker get the corresponding point on the chromosome scale
    // and draw a line between them
    const chromosomePointerLines = _.map(referenceMap, (d, dIndex) => {
        return {
            'x1': chromosomeScale(d.position), 'x2': xScale(dIndex),
        }
    });


    // first draw a thick line indicating the chromosome
    context.strokeStyle = "grey";
    context.fillStyle = "white";

    // draw a rectangle for the chromosome container
    context.beginPath();
    context.lineWidth = 2;
    context.rect(xScale.range()[0], verticalHeight + 25,
        xScale.range()[1] - xScale.range()[0], TRACK_HEIGHT);
    context.stroke();

    // for each marker draw 3 lines 
    //  the first line is inside the chromosome rect
    //  the second line is a straight line on the linemap
    //  the third line connects these two
    context.beginPath();
    context.lineWidth = 1;

    _.map(chromosomePointerLines, (cp) => {
        // first line inside chromosome container
        context.moveTo(cp.x1, verticalHeight + 25);
        context.lineTo(cp.x1, verticalHeight + 25 + TRACK_HEIGHT);
        // second line is right under the linemap
        context.moveTo(cp.x2, verticalHeight + 2);
        context.lineTo(cp.x2, verticalHeight + 10);
        // 3rd line connects these two
        context.moveTo(cp.x2, verticalHeight + 10);
        context.lineTo(cp.x1, verticalHeight + 25);
    })
    context.stroke();

    var tickCount = 15,
        tickSize = 5,
        ticks = chromosomeScale.ticks(tickCount),
        tickFormat = format('~s');


    // draw lines for each tick
    context.beginPath();
    context.lineWidth = 2;
    ticks.forEach(function (d) {
        context.moveTo(chromosomeScale(d), 20 + TRACK_HEIGHT + verticalHeight + tickSize);
        context.lineTo(chromosomeScale(d), 25 + TRACK_HEIGHT + verticalHeight + tickSize);
    });
    context.stroke();

    context.fillStyle = "grey";
    context.textAlign = "center";
    context.textBaseline = "top";

    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), chromosomeScale(d), 27 + TRACK_HEIGHT + verticalHeight + tickSize);
    });

}
