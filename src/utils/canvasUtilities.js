import { MATCH_COLOR, MISSING_COLOR, COLOR_LIST, TRACK_HEIGHT } from './chartConstants';

var canvasUtilities = {};

canvasUtilities.clearAndGetContext = function(canvas) {
    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();
    return context;
}

canvasUtilities.drawLines = function(context, lineCollection, color) {
    context.beginPath();
    // set the width of the line // in the actual chart this is the height of the track
    // with 2.5 pixels of padding between tracks
    context.lineWidth = TRACK_HEIGHT - 2.5;
    context.strokeStyle = color;
    _.map(lineCollection, (line) => {
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
    });
    context.stroke();
}

canvasUtilities.drawLinesByColor = function(canvas, lineCollection) {
    let context = canvas.getContext('2d');
    // remove white and base color from the group and draw them first
    canvasUtilities.drawLines(context, lineCollection[1], MATCH_COLOR);
    canvasUtilities.drawLines(context, lineCollection[0], MISSING_COLOR);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            canvasUtilities.drawLines(context, lineCollection[d], COLOR_LIST[d - 2])
        });
}

canvasUtilities.drawLabels = function(canvas, labels) {
    let context = canvasUtilities.clearAndGetContext(canvas);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    // Add label for each line
    _.map(labels, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? MATCH_COLOR : COLOR_LIST[yIndex - 1];
        context.fillText(name, 10, 15 + (yIndex * TRACK_HEIGHT));
    });
}

module.exports = canvasUtilities;