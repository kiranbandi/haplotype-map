import React, { Component } from 'react';
import { scaleLinear, format } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import { LABEL_WIDTH, CHART_WIDTH, TRACK_HEIGHT } from '../utils/chartConstants';
import { drawLinesByColor, clearAndGetContext, drawLabels } from '../utils/canvasUtilities';
import GeneTrack from './GeneTrack';

export default class RegionMap extends Component {

    componentDidMount() { this.drawChart() }
    componentDidUpdate() { this.drawChart() }

    drawChart = () => {
        let { lineMap = [], lineNames, genomeMap, chartScale,
            regionStart, regionEnd } = this.props;

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
            },
            modifiedChartScale = chartScale.copy().domain([0, (regionEnd - regionStart) - 1]);

        let context = clearAndGetContext(this.canvas);
        drawLinesByColor(this.canvas, generateLinesFromMap(modifiedLineMap, modifiedChartScale));
        drawXAxisPoisitonalMarkers(modifiedGenomeMap, lineNames, context, modifiedChartScale);
        drawLabels(this["canvas-label"], lineNames);
    }

    render() {
        const { lineNames } = this.props;

        let { lineMap = [], genomeMap, chartScale,
            regionStart, regionEnd, geneMap } = this.props;

        const markerCount = (regionEnd - regionStart) - 1;

        let modifiedGenomeMap = {
            'chromID': genomeMap.chromID,
            'startIndex': regionStart,
            'endIndex': regionEnd,
            'start': genomeMap.referenceMap[regionStart].position,
            'end': genomeMap.referenceMap[regionEnd - 1].position,
            'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd)
        },
            modifiedChartScale = chartScale.copy().domain([0, (regionEnd - regionStart) - 1]),
            modifiedGeneMap = _.filter(geneMap, (d) => ((+d.start > +modifiedGenomeMap.start) && (+d.end < +modifiedGenomeMap.end)))


        return (<div className='subchart-container'>
            <h4 className='text-primary chart-title'>Sub Region</h4>
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <canvas
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={(lineNames.length * TRACK_HEIGHT) + 65}
                        ref={(el) => { this.canvas = el }} />
                    <GeneTrack
                        geneMap={modifiedGeneMap}
                        genomeMap={modifiedGenomeMap}
                        markerCount={markerCount}
                        chartScale={modifiedChartScale}
                        width={CHART_WIDTH} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={(lineNames.length * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}

function drawXAxisPoisitonalMarkers(genomeMap, lineNames, context, xScale) {

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
    context.lineWidth = 0.5;

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

    context.lineWidth = 0.5;
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
