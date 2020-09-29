import React, { Component } from 'react';
import { schemeTableau10, scaleLinear } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import interact from 'interactjs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';

// Have a list of colors to sample from 
let missingColor = 'white',
    matchColor = schemeTableau10[0],
    colorList = [...schemeTableau10.slice(1), ...schemeTableau10.slice(1)],
    trackLineHeight = 17.5,
    // This is added at the end and labels are shown in it
    labelWidth = 75,
    chromosomeScale, xScale;

class ChromosomeMap extends Component {

    componentDidMount() {
        const { lineMap = [], genomeMap, width } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width - labelWidth, lineMap, genomeMap, this.attachResizing);
            drawLabels(this["canvas-label"], lineMap);
        }
    }

    componentDidUpdate() {
        const { lineMap = [], genomeMap, width } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, width - labelWidth, lineMap, genomeMap, this.attachResizing);
            drawLabels(this["canvas-label"], lineMap);
        }
    }

    attachResizing = (maxWidth) => {

        const { setRegionWindow } = this.props;

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
                    },
                    end(event) { setRegionWindow(getStartAndEnd(event.target)) }
                },
                modifiers: [
                    // keep the edges inside the parent
                    interact.modifiers.restrictEdges({
                        outer: 'parent'
                    }),
                    // minimum size
                    interact.modifiers.restrictSize({
                        min: { width: 50 }
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
                        if (x >= 0 && x <= (maxWidth - event.rect.width)) {
                            target.style.webkitTransform = target.style.transform =
                                'translate(' + x + 'px,' + '0px)'
                            target.setAttribute('data-x', x);
                        }
                    },
                    end(event) { setRegionWindow(getStartAndEnd(event.target)) }
                },
            });
    }


    render() {
        const { width, lineMap } = this.props, lineNames = _.map(lineMap, (d) => d.lineName);

        return (<div className='chromsomemap-container'>
            <div style={{ 'width': width }}
                className='chromsomemap-canvas-wrapper'>
                <div style={{ 'width': width - labelWidth }}
                    className='genome-window-wrapper'>
                    <div className="genome-window"
                        style={{ height: ((lineNames.length * trackLineHeight) + 5) + 'px' }}>
                    </div>
                </div>
                <canvas
                    className='chromsomemap-canvas'
                    width={width - labelWidth}
                    height={(lineNames.length * trackLineHeight) + 10}
                    ref={(el) => { this.canvas = el }} />
                <canvas className='chromsomemap-canvas-label'
                    width={labelWidth}
                    height={(lineNames.length * trackLineHeight)}
                    ref={(el) => { this['canvas-label'] = el }} />
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


function drawChart(canvas, width, lineMap, genomeMap, attachResizing) {

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

    const lineDataLength = genomeMap.referenceMap.length;

    xScale = scaleLinear()
        .domain([0, lineDataLength])
        .range([0, width])

    const lineCollection = generateLinesFromMap(lineMap, xScale, trackLineHeight);

    // remove white and base color from the group and draw them first
    drawLineGroup(context, lineCollection[1], matchColor);
    drawLineGroup(context, lineCollection[0], missingColor);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLineGroup(context, lineCollection[d], colorList[d - 2])
        });
    attachResizing(width);
}

function drawLabels(canvas, lineMap) {
    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();
    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    context.restore();
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    const lineNames = _.map(lineMap, (d) => d.lineName);
    // Add label for each line
    _.map(lineNames, (name, yIndex) => {
        context.beginPath();
        context.font = "15px Arial";
        context.fillStyle = yIndex == 0 ? matchColor : colorList[yIndex - 1];
        context.fillText(name, 10, 15 + (yIndex * trackLineHeight));
    });
}


function getStartAndEnd(target) {
    let xPosition = (parseFloat(target.getAttribute('data-x')) || 0),
        width = target.style.width;
    if (width.indexOf('px') > -1) {
        width = +width.slice(0, -2);
    }
    else {
        width = 75;
    }
    const start = Math.abs(xPosition), end = start + width;
    return { 'start': Math.round(xScale.invert(start)), 'end': Math.round(xScale.invert(end)) };
}


function mapDispatchToProps(dispatch) {
    return {
        setRegionWindow: bindActionCreators(setRegionWindow, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChromosomeMap);


