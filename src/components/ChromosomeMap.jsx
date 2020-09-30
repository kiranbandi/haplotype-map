import React, { Component } from 'react';
import { scaleLinear, format } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import interact from 'interactjs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';
import { drawLines,clearAndGetContext, drawLabels } from '../utils/canvasUtilities';
import {
    MISSING_COLOR, MATCH_COLOR, LABEL_WIDTH,
    COLOR_LIST, TRACK_HEIGHT, CHART_WIDTH
} from '../utils/chartConstants';

// Have a list of colors to sample from 
let xScale;

class ChromosomeMap extends Component {

    componentDidMount() {
        const { lineMap = [], genomeMap, lineNames,
            regionStart = 0, regionEnd = 0 } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, lineMap, genomeMap, this.attachResizing);
            drawLabels(this["canvas-label"], lineNames);
            setStartAndWidth(regionStart, regionEnd);
        }
    }

    componentDidUpdate() {
        const { lineMap = [], genomeMap, lineNames,
            regionStart = 0, regionEnd = 0 } = this.props;
        if (lineMap.length > 0) {
            drawChart(this.canvas, lineMap, genomeMap, this.attachResizing);
            drawLabels(this["canvas-label"], lineNames);
            setStartAndWidth(regionStart, regionEnd);
        }
    }

    attachResizing = (maxWidth) => {
        const { setRegionWindow } = this.props;
        interact('#genome-window')
            .draggable({
                inertia: true,
                listeners: {
                    move(event) {
                        var target = event.target;
                        var x = (parseFloat(target.getAttribute('data-x')) || 0);
                        x += event.dx;
                        if (x >= 0 && x <= (CHART_WIDTH - event.rect.width)) {
                            target.style.webkitTransform = target.style.transform =
                                'translate(' + x + 'px,' + '0px)'
                            target.setAttribute('data-x', x);
                        }
                    },
                    end(event) { setRegionWindow(getStartAndEnd(event.target)) }
                },
            })
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
                        min: { width: 30 }
                    })
                ],
                inertia: true
            })
    }


    render() {
        const { lineNames } = this.props;

        return (<div className='subchart-container'>
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <div style={{ 'width': CHART_WIDTH }}
                        className='genome-window-wrapper'>
                        <div id="genome-window"
                            style={{ height: ((lineNames.length * TRACK_HEIGHT) + 25) + 'px' }}>
                        </div>
                    </div>
                    <canvas
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={(lineNames.length * TRACK_HEIGHT) + 30}
                        ref={(el) => { this.canvas = el }} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={(lineNames.length * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}

function drawChart(canvas, lineMap, genomeMap, attachResizing) {

    let context = clearAndGetContext(canvas);
    // set line width 
    context.lineWidth = 15;
    const lineDataLength = genomeMap.referenceMap.length;
    xScale = scaleLinear()
        .domain([0, lineDataLength - 1])
        .range([0, CHART_WIDTH])

    const lineNames = _.map(lineMap, (d) => d.lineName);

    const lineCollection = generateLinesFromMap(lineMap, xScale, TRACK_HEIGHT);

    // remove white and base color from the group and draw them first
    drawLines(canvas, lineCollection[1], MATCH_COLOR);
    drawLines(canvas, lineCollection[0], MISSING_COLOR);
    _.keys(lineCollection)
        .filter((d) => (d != 1 && d != 0))
        .map((d) => {
            drawLines(canvas, lineCollection[d], COLOR_LIST[d - 2])
        });
    attachResizing();
    drawXAxisPoisitonalMarkers(genomeMap, lineNames, TRACK_HEIGHT, context);
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

function setStartAndWidth(start, end) {
    let target = document.getElementById('genome-window'),
        x = 0, width = 50;

    if (start != 0 || end != 0) {
        x = xScale(start);
        width = xScale(end) - x;
    }

    target.setAttribute('data-x', x);
    target.style.width = width + 'px';
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + '0px)'
}

function drawXAxisPoisitonalMarkers(genomeMap, lineNames, TRACK_HEIGHT, context) {

    const { referenceMap } = genomeMap;

    // get the height offset from top add in a couple of extra pixels for line spacing
    const verticaloffset = lineNames.length * TRACK_HEIGHT + 3;
    // first draw a thick line indicating the chromosome
    context.strokeStyle = "grey";
    context.fillStyle = "white";
    var tickCount = 15,
        tickSize = 5,
        ticks = xScale.ticks(tickCount),
        tickFormat = format('~s');
    // draw base line
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(xScale.range()[0], verticaloffset);
    context.lineTo(xScale.range()[1], verticaloffset);
    context.stroke();
    // draw lines for each tick
    context.beginPath();
    ticks.forEach(function (d) {
        context.moveTo(xScale(d), verticaloffset);
        context.lineTo(xScale(d), verticaloffset + tickSize);
    });
    context.stroke();
    context.fillStyle = "grey";
    context.textAlign = "center";
    context.textBaseline = "top";
    // fill in the tick text
    ticks.forEach(function (d, i) {
        const shifter = i == 0 ? 20 : i == (ticks.length - 1) ? -15 : 0;
        context.fillText(tickFormat(referenceMap[d].position), shifter + xScale(d), 2 + verticaloffset + tickSize);
    });
}

function mapDispatchToProps(dispatch) {
    return {
        setRegionWindow: bindActionCreators(setRegionWindow, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChromosomeMap);
