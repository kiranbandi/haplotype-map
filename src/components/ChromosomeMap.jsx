import React, { Component } from 'react';
import { format } from 'd3';
import generateLinesFromMap from '../utils/generateLinesFromMap';
import interact from 'interactjs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';
import { drawLinesByColor, clearAndGetContext, drawLabels } from '../utils/canvasUtilities';
import { LABEL_WIDTH, TRACK_HEIGHT, CHART_WIDTH } from '../utils/chartConstants';
import GeneTrack from './GeneTrack';
import CNVTrack from './CNVTrack';

class ChromosomeMap extends Component {

    componentDidMount() { this.drawChart() }

    componentDidUpdate(previousProps) {
        // only draw the chart again if the linemap and genomemap have changed
        if ((this.props.genomeMap !== previousProps.genomeMap) && (this.props.lineMap !== previousProps.lineMap)) {
            this.drawChart();
        }
        // if not simply change the region window in case that alone has changed
        else {
            setStartAndWidth(this.props.regionStart, this.props.regionEnd, this.props.chartScale);
        }
    }

    drawChart = () => {
        const { lineMap = [], regionStart, regionEnd, genomeMap, lineNames, lineCount, chartScale } = this.props;

        let context = clearAndGetContext(this.canvas);
        drawLinesByColor(this.canvas, generateLinesFromMap(lineMap, chartScale));
        drawLabels(this["canvas-label"], lineNames);
        drawXAxisPoisitonalMarkers(genomeMap, lineCount, context, chartScale);
        this.attachResizing();
        setStartAndWidth(regionStart, regionEnd, chartScale);
    }

    attachResizing = () => {

        const { setRegionWindow, chartScale } = this.props;

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
                    end(event) { setRegionWindow(getStartAndEnd(event.target, chartScale)) }
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
                    end(event) { setRegionWindow(getStartAndEnd(event.target, chartScale)) }
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

        const { lineCount, lineNames, cnvMap, geneMap, genomeMap, markerCount, chartScale } = this.props;

        return (<div className='subchart-container' >
            <h4 className='text-primary chart-title'>Chromosome</h4>
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <div style={{ 'width': CHART_WIDTH }}
                        className='genome-window-wrapper'>
                        <div id="genome-window"
                            style={{ height: ((lineCount * TRACK_HEIGHT) + 25) + 'px' }}>
                        </div>
                    </div>
                    <canvas
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={(lineCount * TRACK_HEIGHT) + 30}
                        ref={(el) => { this.canvas = el }} />
                    <CNVTrack
                        lineNames={lineNames}
                        cnvMap={cnvMap}
                        genomeMap={genomeMap}
                        markerCount={markerCount}
                        chartScale={chartScale}
                        height={(lineCount * TRACK_HEIGHT) + 30}
                        width={CHART_WIDTH} />
                    <GeneTrack
                        geneMap={geneMap}
                        genomeMap={genomeMap}
                        markerCount={markerCount}
                        chartScale={chartScale}
                        width={CHART_WIDTH} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={(lineCount * TRACK_HEIGHT)}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}

function getStartAndEnd(target, chartScale) {
    let xPosition = (parseFloat(target.getAttribute('data-x')) || 0),
        width = target.style.width;
    if (width.indexOf('px') > -1) {
        width = +width.slice(0, -2);
    }
    else {
        width = 75;
    }
    const start = Math.abs(xPosition), end = start + width;
    return {
        'start': Math.round(chartScale.invert(start)),
        'end': Math.round(chartScale.invert(end))
    };
}

function drawXAxisPoisitonalMarkers(genomeMap, lineCount, context, chartScale) {

    const { referenceMap } = genomeMap;

    // get the height offset from top add in a couple of extra pixels for line spacing
    const verticaloffset = lineCount * TRACK_HEIGHT + 3;
    // first draw a thick line indicating the chromosome
    context.strokeStyle = "grey";
    context.fillStyle = "white";
    var tickCount = 15,
        tickSize = 5,
        ticks = chartScale.ticks(tickCount),
        tickFormat = format('~s');
    // draw base line
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(chartScale.range()[0], verticaloffset);
    context.lineTo(chartScale.range()[1], verticaloffset);
    context.stroke();
    // draw lines for each tick
    context.beginPath();
    ticks.forEach(function (d) {
        context.moveTo(chartScale(d), verticaloffset);
        context.lineTo(chartScale(d), verticaloffset + tickSize);
    });
    context.stroke();
    context.fillStyle = "grey";
    context.textAlign = "center";
    context.textBaseline = "top";
    // fill in the tick text
    ticks.forEach(function (d, i) {
        const shifter = i == 0 ? 20 : i == (ticks.length - 1) ? -15 : 0;
        context.fillText(tickFormat(referenceMap[d].position), shifter + chartScale(d), 2 + verticaloffset + tickSize);
    });
}

function setStartAndWidth(start, end, chartScale) {
    let target = document.getElementById('genome-window'), x, width;

    x = chartScale(start);
    width = chartScale(end) - x;

    target.setAttribute('data-x', x);
    target.style.width = width + 'px';
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + '0px)'
}


function mapDispatchToProps(dispatch) {
    return {
        setRegionWindow: bindActionCreators(setRegionWindow, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(ChromosomeMap);
