import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import interact from 'interactjs'
// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 17.5;

export default class HapmapChart extends Component {

    componentDidMount() {
        const { lineMap = [], genomeMap, width } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap);
        }
    }

    componentDidUpdate() {
        const { lineMap = [], genomeMap, width } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width, lineMap, genomeMap);
        }
    }

    render() {
        const { width, lineMap } = this.props, lineNames = _.map(lineMap, (d) => d.lineName);

        return (<div className='chromsomemap-container'>
            <div
                style={{ 'width': width }}
                className='chromsomemap-canvas-wrapper'>
                <canvas
                    className='chromsomemap-canvas'
                    width={width}
                    height={(lineNames.length * trackLineHeight) + 100}
                    ref={(el) => { this.canvas = el }} />
                <div
                    style={{ 'width': width }}
                    className='genome-window-wrapper'>
                    <div className="genome-window"></div>
                </div>
            </div>
        </div>);
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
        .range([0, width - 75]);

    const lineCollection = generateLinesFromMap(lineMap, xScale, trackLineHeight);

    // remove white and base color from the group and draw them first
    drawLineGroup(context, lineCollection[1], matchColor);
    drawLineGroup(context, lineCollection[0], missingColor);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLineGroup(context, lineCollection[d], colorList[d - 2])
        });

    drawLabels(context, lineNames, trackLineHeight, matchColor, colorList, width);

    attachResizing();
}

function drawLabels(context, lineNames, trackLineHeight, matchColor, colorList, width) {
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    // Add label for each line
    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, width - 70, 15 + (yIndex * trackLineHeight));
    });
}


function attachResizing() {

    interact('.genome-window')
        .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: false, top: false },
            listeners: {
                move(event) {
                    var target = event.target;
                    var x = (parseFloat(target.getAttribute('data-x')) || 0);
                    // update the element's style
                    target.style.width = event.rect.width + 'px';
                    // translate when resizing from left edges
                    x += event.deltaRect.left;
                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + '0px)'
                    target.setAttribute('data-x', x);
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),
                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 50 }
                })
            ],
            inertia: true
        })
        .draggable({
            inertia: true,
            listeners: {
                move(event) {
                    var target = event.target;
                    var x = (parseFloat(target.getAttribute('data-x')) || 0);
                    x += event.dx;
                    if (x > 0 && x < 1700) {
                        target.style.webkitTransform = target.style.transform =
                            'translate(' + x + 'px,' + '0px)'
                        target.setAttribute('data-x', x);
                    }
                }
            },
        });

}