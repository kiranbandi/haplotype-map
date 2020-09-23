import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 20;

export default class HapmapChart extends Component {

    componentDidMount() {
        const { lineMap = {}, genomeMap, width, label } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap, label);
        }

    }

    componentDidUpdate() {
        const { lineMap = {}, genomeMap, width, label } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap, label);
        }
    }

    render() {
        const { width, lineMap } = this.props,
            lineNames = _.map(lineMap, (d) => d.lineName);


        return (<canvas className='hapmap-canvas'
            width={width}
            height={(lineNames.length * trackLineHeight) + 25}
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


function drawxAxis(xScale, context, yPosition) {
    var tickCount = 15,
        tickSize = 5,
        ticks = xScale.ticks(tickCount),
        tickFormat = xScale.tickFormat();

    context.strokeStyle = "grey";
    context.fillStyle = "grey";

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(xScale.range()[0], yPosition);
    context.lineTo(xScale.range()[1], yPosition);
    context.stroke();

    context.beginPath();
    context.lineWidth = 2;
    ticks.forEach(function (d) {
        context.moveTo(xScale(d), yPosition);
        context.lineTo(xScale(d), yPosition + tickSize);
    });

    context.stroke();
    context.textAlign = "center";
    context.textBaseline = "top";
    ticks.forEach(function (d) {
        context.fillText(tickFormat(d), xScale(d), yPosition + tickSize);
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
    let lineDataLength = lineMap[0] ? lineMap[0].lineData.length : 0;

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

    // Add label
    context.beginPath();
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.font = "18px Arial";
    context.fillStyle = matchColor;
    context.fillText(label, 45, (lineNames.length * trackLineHeight) / 2);

    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, width - 70, 15 + (yIndex * trackLineHeight));
    });

    drawxAxis(xScale, context, 2 + (lineNames.length * trackLineHeight));
}