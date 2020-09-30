import { MATCH_COLOR, COLOR_LIST, TRACK_HEIGHT } from './chartConstants';

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

canvasUtilities.drawLines = function(canvas, lineCollection, color) {
    let context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    _.map(lineCollection, (line) => {
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
    });
    context.stroke();
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