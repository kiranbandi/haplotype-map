import React, { Component } from 'react';
import { schemeTableau10, schemeCategory10 } from 'd3';
import { scaleLinear } from 'd3';
// Have a list of 30 colors 
let missingColor = 'white',
    matchColor = schemeCategory10[0],
    colorList = [...schemeCategory10.slice(1), ...schemeCategory10.slice(1)];

export default class HapmapChart extends Component {

    componentDidMount() {
        const { colorMap, width, names, label } = this.props,
            canvasRef = this.canvas, context = canvasRef.getContext('2d');
        // set line width 
        context.lineWidth = 15;
        const lines = processData(colorMap, width),
            // group lines by color
            groupedLines = _.groupBy(lines, (d) => d.color);

        // remove white and base color from the group and draw them first
        drawLineGroup(context, groupedLines[matchColor], matchColor);
        drawLineGroup(context, groupedLines[missingColor], missingColor);
        _.keys(groupedLines)
            .filter((d) => d != missingColor || d != matchColor)
            .map((d) => drawLineGroup(context, groupedLines[d], d));


        // Add label
        context.font = "20px Arial";
        context.fillStyle = matchColor;
        context.fillText(label, 40, 95);

        _.map(names, (name, yIndex) => {
            context.beginPath();
            context.font = "15px Arial";
            context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
            context.fillText(name, width - 70, 15 + (yIndex * 17.5));
        });
    }

    render() {
        let { width, height } = this.props;
        return (<canvas width={width} height={height} ref={(el) => { this.canvas = el }} />);
    }
}


function processData(colormapData, width) {
    return _.reduce(colormapData, (acc, track, trackIndex) => {
        let scale = scaleLinear()
            .domain([0, track.length])
            .range([100, width - 75]);
        return acc.concat(generateLines(scale, track, (trackIndex * 17.5) + 10));
    }, []);
}


function generateLines(xScale, lineData, yPosition) {

    // By default always draw a line in the base color first
    let lineArray = [{
        'color': matchColor,
        'start': xScale.range()[0],
        'end': xScale.range()[1],
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
                    'color': lineType == 0 ? missingColor : colorList[lineType - 2],
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
            // if the symbols are changing
            // draw the old line and start the new one
            else {
                lineArray.push({
                    'color': lineType == 0 ? missingColor : colorList[lineType - 2],
                    'start': xScale(lineStart),
                    'end': xScale(lineStart + lineWidth),
                    yPosition
                });
                // start new line
                lineType = d;  //will be either 0 or 2
                lineStart = pointIndex;
                lineWidth = 1;
                // the drawing flag will remain ON.
            }
        }
        else {
            if (d == 1) return;
            lineType = d;  //will be non zero
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