import React, { Component } from 'react';


export default class HapmapTrack extends Component {


    generateLines(xScale, lineData, colorA, colorB) {

        let lineArray = [],
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
                        'end': xScale(lineStart + lineWidth)
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
                        'end': xScale(lineStart + lineWidth)
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



    render() {

        let { trackData = [], width, yPosition, trackID, matchColor, diffColor } = this.props;

        let xScale = scaleLinear()
            .domain([0, trackData.length])
            .range([0, width]);

        let linePositions = this.generateLines(xScale, trackData, diffColor, 'white');

        // First draw a base line for the in the matching color
        // the go through the data and draw the mismatches and missing

        return <g className="line-base">
            <line key={'base-line-' + trackID}
                stroke={matchColor}
                strokeWidth={20}
                x1={0} y1={yPosition}
                x2={width} y2={yPosition}></line>
            {_.map(linePositions, (line, lineID) => {
                return <line key={'over-line-' + lineID}
                    stroke={line.color}
                    strokeWidth={20}
                    x1={line.start} y1={yPosition}
                    x2={line.end} y2={yPosition}></line>
            })}
        </g>
    }
}