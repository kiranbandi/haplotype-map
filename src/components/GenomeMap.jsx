import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 17.5;

export default class HapmapChart extends Component {

    componentDidMount() {
        const { lineMap = [], genomeMap, width, label } = this.props;

        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap, label);
        }

    }

    componentDidUpdate() {
        const { lineMap = [], genomeMap, width, label } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap, label);
        }
    }

    render() {
        const { width, lineMap } = this.props,
            lineNames = _.map(lineMap, (d) => d.lineName);

        return (<canvas className='hapmap-canvas'
            width={width}
            height={(lineNames.length * trackLineHeight) + 100}
            ref={(el) => { this.canvas = el }} />);
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


function drawxAxis(xScale, chromosomeScale, context, yPosition) {
    var tickCount = 15,
        tickSize = 5,
        ticks = xScale.ticks(tickCount),
        tickFormat = xScale.tickFormat();


    console.log(ticks);
    
    context.strokeStyle = "grey";
    context.fillStyle = "grey";

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(xScale.range()[0], 5 + yPosition);
    context.lineTo(xScale.range()[1], 5 + yPosition);
    context.stroke();

    context.beginPath();
    context.lineWidth = 1;
    ticks.forEach(function (d) {
        context.moveTo(xScale(d), 5 + yPosition);
        context.lineTo(xScale(d), 5 + yPosition + tickSize);
    });

    context.stroke();
    context.textAlign = "center";
    context.textBaseline = "top";
    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), xScale(d), 5 + yPosition + tickSize);
    });
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
        .range([125, width - 75]);

    const lineCollection = generateLinesFromMap(lineMap, xScale, trackLineHeight);

    // remove white and base color from the group and draw them first
    drawLineGroup(context, lineCollection[1], matchColor);
    drawLineGroup(context, lineCollection[0], missingColor);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLineGroup(context, lineCollection[d], colorList[d - 2])
        });

    drawLabels(context, lineNames, label, trackLineHeight, matchColor, colorList, width);

    const verticalHeight = lineNames.length * trackLineHeight;


    const { start, end, startIndex, referenceMap } = genomeMap;

    const chromosomeScale = scaleLinear()
        .domain([start, end])
        .range([125, width - 75]);


    drawxAxis(xScale, chromosomeScale, context, verticalHeight);
    // drawXAxisPoisitonalMarkers(genomeMap, lineNames, trackLineHeight, context, xScale, width);
}


function drawXAxisPoisitonalMarkers(genomeMap, lineNames, trackLineHeight, context, xScale, width) {

    const { start, end, startIndex, referenceMap } = genomeMap;

    const chromosomeScale = scaleLinear()
        .domain([start, end])
        .range([125, width - 75]);

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


function drawLabels(context, lineNames, label, trackLineHeight, matchColor, colorList, width) {
    // Add label
    context.beginPath();
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.font = "18px Arial";
    context.fillStyle = matchColor;
    context.fillText(label, 45, (lineNames.length * trackLineHeight) / 2);
    // Add label for each line
    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, width - 70, 15 + (yIndex * trackLineHeight));
    });
}
