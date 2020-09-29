import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 17.5,
    labelWidth = 75;

export default class HapmapChart extends Component {

    componentDidMount() {
        const { lineMap = [], genomeMap, regionStart, regionEnd, width } = this.props;

        let modifiedLineMap = _.map(lineMap, (l) => ({
            'lineName': l.lineName,
            'lineData': l.lineData.slice(regionStart, regionEnd + 1)
        })),
            modifiedGenomeMap = {
                'chromID': genomeMap.chromID,
                'startIndex': regionStart,
                'endIndex': regionEnd,
                'start': genomeMap.referenceMap[regionStart].position,
                'end': genomeMap.referenceMap[regionEnd].position,
                'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd + 1)
            };

        if (lineMap.length > 0) {
            drawChart(this.canvas, width - labelWidth, modifiedLineMap, modifiedGenomeMap);
            drawLabels(this["canvas-label"], modifiedLineMap);
        }

    }

    componentDidUpdate() {
        const { lineMap = [], genomeMap, regionStart, regionEnd, width } = this.props;

        let modifiedLineMap = _.map(lineMap, (l) => ({
            'lineName': l.lineName,
            'lineData': l.lineData.slice(regionStart, regionEnd + 1)
        })),
            modifiedGenomeMap = {
                'chromID': genomeMap.chromID,
                'startIndex': regionStart,
                'endIndex': regionEnd,
                'start': genomeMap.referenceMap[regionStart].position,
                'end': genomeMap.referenceMap[regionEnd].position,
                'referenceMap': genomeMap.referenceMap.slice(regionStart, regionEnd + 1)
            };

        if (lineMap.length > 0) {
            drawChart(this.canvas, width - labelWidth, modifiedLineMap, modifiedGenomeMap);
            drawLabels(this["canvas-label"], modifiedLineMap);
        }
    }

    render() {
        const { width, lineMap } = this.props,
            lineNames = _.map(lineMap, (d) => d.lineName);


        return (<div className='chromsomemap-container'>
            <div style={{ 'width': width }} className='chromsomemap-canvas-wrapper'>
                <canvas
                    className='chromsomemap-canvas'
                    width={width - labelWidth}
                    height={(lineNames.length * trackLineHeight) + 55}
                    ref={(el) => { this.canvas = el }} />
                <canvas className='chromsomemap-canvas-label'
                    width={labelWidth}
                    height={(lineNames.length * trackLineHeight)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>)
    }
}

function drawLineGroup(context, lineGroup, color) {
    context.beginPath();
    context.strokeStyle = color;
    _.map(lineGroup, (line) => {
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
    });
    context.stroke();
}


function drawChart(canvas, width, lineMap, genomeMap, label) {

    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();

    // set line width 
    context.lineWidth = 15;

    const lineNames = _.map(lineMap, (d) => d.lineName);
    let lineDataLength = genomeMap.referenceMap.length;

    let xScale = scaleLinear()
        .domain([0, lineDataLength])
        .range([0, width]);

    const lineCollection = generateLinesFromMap(lineMap, xScale, trackLineHeight);

    // remove white and base color from the group and draw them first
    drawLineGroup(context, lineCollection[1], matchColor);
    drawLineGroup(context, lineCollection[0], missingColor);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLineGroup(context, lineCollection[d], colorList[d - 2])
        });

    drawXAxisPoisitonalMarkers(genomeMap, lineNames, trackLineHeight, context, xScale, width);
}

function drawLabels(canvas, lineMap) {
    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    const lineNames = _.map(lineMap, (d) => d.lineName);
    // Add label for each line
    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, 10, 15 + (yIndex * trackLineHeight));
    });
}


function drawXAxisPoisitonalMarkers(genomeMap, lineNames, trackLineHeight, context, xScale, width) {

    const { start, end, startIndex, referenceMap } = genomeMap;

    const chromosomeScale = scaleLinear()
        .domain([start, end])
        .range([0, width]);

    const verticalHeight = lineNames.length * trackLineHeight;

    // for every marker get the corresponding point on the chromosome scale
    // and draw a line between them
    const chromosomePointerLines = _.map(referenceMap, (d) => {
        return {
            'x1': chromosomeScale(d.position), 'x2': xScale(d.index - startIndex),
        }
    });

    // first draw a thick line indicating the chromosome
    context.strokeStyle = "grey";
    context.fillStyle = "white";

    // draw a rectangle for the chromosome container
    context.beginPath();
    context.lineWidth = 2;
    context.rect(xScale.range()[0], verticalHeight + 25,
        xScale.range()[1] - xScale.range()[0], trackLineHeight);
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
        context.lineTo(cp.x1, verticalHeight + 25 + trackLineHeight);
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
        tickFormat = chromosomeScale.tickFormat();
    context.fillStyle = "grey";
    context.textAlign = "center";
    context.textBaseline = "top";
    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), chromosomeScale(d), 25 + trackLineHeight + verticalHeight + tickSize);
    });

}
