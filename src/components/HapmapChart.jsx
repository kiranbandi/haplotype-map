import React, { Component } from 'react';
import { schemeTableau10 } from 'd3';
import { scaleLinear } from 'd3';


export default class HapmapChart extends Component {

    componentDidMount() {

        const { colorMap, width } = this.props;

        const canvasRef = this.canvas,
            context = canvasRef.getContext('2d');

        // set line width 
        context.lineWidth = 20;
        const lines = processData(colorMap, width),
            // group lines by color
            groupedLines = _.groupBy(lines, (d) => d.color);
        // remove white and base color from the group and draw them first
        drawLineGroup(context, groupedLines[schemeTableau10[0]], schemeTableau10[0]);
        drawLineGroup(context, groupedLines['white'], 'white');
        _.keys(groupedLines)
            .filter((d) => d != 'white' || d != schemeTableau10[0])
            .map((d) => drawLineGroup(context, groupedLines[d], d));

    }

    render() {
        let { width, height } = this.props;

        return (<canvas width={width} height={height} ref={(el) => { this.canvas = el }} />);
    }
}


function processData(colormapData, width) {

    var lineStore = [];

    _.map(colormapData, (track, trackIndex) => {

        let scale = scaleLinear()
            .domain([0, track.length])
            .range([50, width]);

        lineStore = lineStore.concat(generateLines(scale, track,
            schemeTableau10[1 + (trackIndex % 9)],
            'white', schemeTableau10[0], (trackIndex * 22.5) + 10));

    });

    return lineStore;
}


function generateLines(xScale, lineData, colorA, colorB, colorC, yPosition) {

    let lineArray = [{
        'color': colorC,
        'start': xScale(0),
        'end': xScale(lineData.length),
        yPosition
    }],
        drawingON = false,
        lineType = '',
        lineStart = '',
        lineWidth = 0;

    _.map(lineData, (d, pointIndex) => {
        if (drawingON) {
            // if a line was started but we encountered a match
            // then we create the line and go back to idling
            if (d == 1) {
                lineArray.push({
                    'color': lineType == 0 ? colorA : colorB,
                    'start': xScale(lineStart),
                    'end': xScale(lineStart + lineWidth),
                    yPosition
                });
                // go back to idling
                drawingON = false;
            }
            // if we are already on the same line simply extend it 
            else if (d == lineType) {
                lineWidth += 1;
            }
            // if the symbols are changing say from 0 to 2 or 2 to 0
            // draw the old line and start the new one
            else {
                lineArray.push({
                    'color': lineType == 0 ? colorA : colorB,
                    'start': xScale(lineStart),
                    'end': xScale(lineStart + lineWidth),
                    yPosition
                });
                // start new line
                lineType = d;  //will be either 0 or 2
                lineStart = pointIndex;
                lineWidth = 1;
            }
        }
        else {
            if (d == 1) return 1;
            lineType = d;  //will be either 0 or 2
            lineStart = pointIndex;
            drawingON = true;
            lineWidth = 1;
        }
    });
    return lineArray;
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