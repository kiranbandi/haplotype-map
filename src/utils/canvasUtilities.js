import { MATCH_COLOR, MISSING_COLOR, COLOR_LIST, TRACK_HEIGHT } from './chartConstants';

var canvasUtilities = {};

canvasUtilities.clearAndGetContext = function (canvas) {
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

canvasUtilities.drawLines = function (context, lineCollection, color, lineWidth) {
    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    _.map(lineCollection, (line) => {
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
    });
    context.stroke();
}

canvasUtilities.drawSubTracks = function (context, lineCollection, color) {
    context.beginPath();
    context.lineWidth = 4;
    context.strokeStyle = color;
    let lineEndShifter = ((TRACK_HEIGHT - 5) / 2) + 3;
    _.map(lineCollection, (line) => {
        context.moveTo(Math.round(line.x), line.y + lineEndShifter);
        context.lineTo(Math.round(line.x + 5), line.y + lineEndShifter);
    });
    context.stroke();
}

canvasUtilities.drawSubTracksByType = function (canvas, markerCollection) {
    let context = canvas.getContext('2d');
    canvasUtilities.drawSubTracks(context, markerCollection['DUP'], 'black');
    canvasUtilities.drawSubTracks(context, markerCollection['DEL'], 'red');
}

canvasUtilities.drawMarkers = function (context, markerCollection, strokeColor, fillColor) {
    context.beginPath();
    let radius = TRACK_HEIGHT / 4;
    context.strokeStyle = strokeColor;
    context.fillStyle = fillColor;
    context.stroke
    context.lineWidth = 4;
    _.map(markerCollection, (marker) => {
        context.moveTo(marker.x + radius, marker.y, radius, 0, 2 * Math.PI, false);
        context.arc(marker.x, marker.y, radius, 0, 2 * Math.PI, false);
    });
    context.fill();
    context.stroke();
}

function drawWhiskers(context, duplicatedCNVs = [], deletedCNVs = []) {
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = 'rgba(0,0,0,0.75)';
    // First create a list of markers from both DUP and DEL that are
    // more than 5 pixels wide then draw them as whiskers 
    duplicatedCNVs.concat(deletedCNVs)
        .filter((d) => d.dx > 5)
        .map((whisker) => {
            context.moveTo(whisker.x - (whisker.dx / 2), whisker.y);
            context.lineTo(whisker.x + (whisker.dx / 2), whisker.y);
        });
    // complete drawing the whiskers 
    context.stroke();
}

canvasUtilities.drawCNVMarkersByType = function (canvas, markerCollection, whiskersEnabled = false) {
    let context = canvas.getContext('2d');
    // First draw the faint whiskers denoting the width of the CNV
    if (whiskersEnabled) {
        drawWhiskers(context, markerCollection['DUP'], markerCollection['DEL']);
    }
    // Then on top of the whiskers draw a round marker at the mid point of the CNV
    canvasUtilities.drawMarkers(context, markerCollection['DUP'], 'rgba(255,255,255,0.75)', 'rgba(0,0,0,0.75)');
    canvasUtilities.drawMarkers(context, markerCollection['DEL'], 'rgba(255,0,0,0.75)', 'rgba(0,0,0,0.75)');
}

canvasUtilities.drawLinesByColor = function (canvas, lineCollection) {
    let context = canvas.getContext('2d');
    // set the width of the line // in the actual chart this is the height of the track
    // with 2.5 pixels of padding between tracks
    let lineWidth = TRACK_HEIGHT - 2.5;
    // remove white and base color from the group and draw them first
    canvasUtilities.drawLines(context, lineCollection[1], MATCH_COLOR, lineWidth);
    canvasUtilities.drawLines(context, lineCollection[0], MISSING_COLOR, lineWidth);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            canvasUtilities.drawLines(context, lineCollection[d], COLOR_LIST[d - 2], lineWidth)
        });
}


canvasUtilities.drawTracks = function (canvas, trackCollection) {
    // get context from canvas object
    let context = canvas.getContext('2d');
    context.beginPath();
    context.lineWidth = TRACK_HEIGHT;

    let trackGroup = _.groupBy(trackCollection, (d) => d.type);

    // First draw the base color 
    let baseLine = trackGroup['base'][0];
    context.strokeStyle = baseLine.color;
    context.moveTo(Math.round(baseLine.start), baseLine.yPosition);
    context.lineTo(Math.round(baseLine.end), baseLine.yPosition);
    context.stroke();

    // Then draw all the other tracks over it 
    context.beginPath();
    _.map(trackGroup['track'], (line) => {
        context.strokeStyle = line.color;
        context.moveTo(Math.round(line.start), line.yPosition);
        context.lineTo(Math.round(line.end), line.yPosition);
        context.stroke();
    });

}

canvasUtilities.drawLabels = function (canvas, labels, isColorActive = false) {
    let context = canvasUtilities.clearAndGetContext(canvas);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    // Add label for each line
    _.map(labels, (name, yIndex) => {
        context.beginPath();
        context.font = "bold 10px Arial";
        context.fillStyle = yIndex == 0 ? MATCH_COLOR : isColorActive ? COLOR_LIST[yIndex - 1] : '#4c4747';
        context.fillText(name, 10, 12 + (yIndex * TRACK_HEIGHT));
    });
}


canvasUtilities.drawSNPNames = function (canvas, referenceMap, chartScale) {
    let context = canvasUtilities.clearAndGetContext(canvas);
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.beginPath();
    context.font = "bold 10px Arial";
    context.fillStyle = '#4c4747';

    const SNPLocusNames = _.map(referenceMap, (d) => d.locusName.toLocaleUpperCase());
    _.map(SNPLocusNames, (name, xIndex) => {
        drawRotatedText(chartScale(xIndex) + (chartScale(1) / 2), 57, -Math.PI / 4, name, context);
    });

}

// https://stackoverflow.com/questions/28560842/rotating-multiple-texts-in-canvas
function drawRotatedText(endingX, centerY, radianAngle, text, ctx) {
    // save the starting context state (untransformed)
    ctx.save();
    // translate to the desired endpoint
    ctx.translate(endingX, centerY);
    // rotate to the desired angle
    ctx.rotate(radianAngle);
    // set the text baseline so the text 
    // is vertically centered on the endpoint 
    ctx.textBaseline = 'middle';
    // draw the text offset by the negative width
    // so the text ends at the desired endpoint
    ctx.fillText(text, -15, 10);
    // restore the context to its starting state
    ctx.restore();
}


canvasUtilities.drawNucleotides = function (canvas, nucelotideList) {
    let context = canvas.getContext('2d');
    context.textAlign = "center";
    context.textBaseline = "middle";
    // Add label for each line
    _.map(nucelotideList, (nucleotidePair, yIndex) => {
        context.beginPath();
        context.font = "10px Arial";
        context.fillStyle = 'white';
        context.fillText(nucleotidePair.text, nucleotidePair.x, nucleotidePair.y);
    });
}



module.exports = canvasUtilities;