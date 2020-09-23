export default function(lineMap, scale, lineHeight) {
    // for every track in the lineMap generate an array of lines based on the lineType
    let lineList = _.reduce(lineMap, (acc, track, trackIndex) => {
        return acc.concat(convertTrackToLines(scale, track.lineData, (trackIndex * lineHeight) + 10))
    }, []);
    // return a collection of lines by lineType
    return _.groupBy(lineList, (d) => d.lineType);
}


function convertTrackToLines(xScale, lineData, yPosition) {

    // By default always draw a line in the match type first as the base layer
    let lineArray = [{
            'lineType': '1',
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
                    lineType,
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
                    lineType,
                    'start': xScale(lineStart),
                    'end': xScale(lineStart + lineWidth),
                    yPosition
                });
                // start new line
                lineType = d; //will be either 0 or 2
                lineStart = pointIndex;
                lineWidth = 1;
                // the drawing flag will remain ON.
            }
        } else {
            if (d == 1) return;
            lineType = d; //will be non zero
            lineStart = pointIndex;
            drawingON = true;
            lineWidth = 1;
        }
    });
    return lineArray;
}