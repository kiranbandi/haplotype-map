import React, { Component } from 'react';
import interact from 'interactjs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRegionWindow } from '../redux/actions/actions';
import { clearAndGetContext, drawRotatedText } from '../utils/canvasUtilities';
import { TRACK_HEIGHT, CHART_WIDTH, LABEL_WIDTH } from '../utils/chartConstants';
import { schemeTableau10 } from 'd3';

const REF_COLOR = schemeTableau10[0];

class GeneList extends Component {

    componentDidMount() { this.drawChart() }

    componentDidUpdate(previousProps) {
        // only draw the chart again if the active chromosome has changed
        if ((this.props.activeChromosomeID !== previousProps.activeChromosomeID)) {
            this.drawChart();
        }
        // if not simply change the region window in case that alone has changed
        else {
            setStartAndWidth(this.props.regionStart, this.props.regionEnd, this.props.chartScale);
        }
    }


    drawChart = () => {
        const { regionStart, regionEnd, geneList, chartScale } = this.props;

        let chartCanvas = clearAndGetContext(this.canvas),
            chartLabelCanvas = clearAndGetContext(this['canvas-label']),
            geneLabelCanvas = clearAndGetContext(this['canvas-genelabel']);

        // Draw Chart Labels
        chartLabelCanvas.textAlign = "left";
        chartLabelCanvas.textBaseline = "alphabetic";
        chartLabelCanvas.font = "bolder 14px Arial";
        chartLabelCanvas.fillStyle = "white";
        chartLabelCanvas.beginPath();
        chartLabelCanvas.fillText('Genes', 10, TRACK_HEIGHT * (1.5));

        // Draw Gene Labels 
        geneLabelCanvas.textAlign = "left";
        geneLabelCanvas.textBaseline = "middle";
        geneLabelCanvas.beginPath();
        geneLabelCanvas.font = "bold 10px Arial";
        geneLabelCanvas.fillStyle = '#1ca8dd';

        const numberOfGenes = 100,
            nthIndex = Math.round(geneList.length / numberOfGenes),
            mappedGeneNames = geneList.map((e, i) => ({ 'name': e.toLocaleUpperCase(), 'index': i })),
            // Add original index to the gene entry for chart scale to use for its true position
            everyNthGene = _.filter(mappedGeneNames, (d, i) => i % (nthIndex) == 0);

        _.map(everyNthGene, (d, xIndex) => {
            drawRotatedText(chartScale(d.index) + (chartScale(1) / 2), 57, -Math.PI / 4, d.name, geneLabelCanvas);
        });

        // Draw a single block line to show gene background
        chartCanvas.beginPath();
        chartCanvas.lineWidth = TRACK_HEIGHT - 2.5;
        chartCanvas.strokeStyle = REF_COLOR;
        chartCanvas.moveTo(Math.round(chartScale.range()[0]), TRACK_HEIGHT / 2);
        chartCanvas.lineTo(Math.round(chartScale.range()[1]), TRACK_HEIGHT / 2);
        chartCanvas.stroke();


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

        const { lineCount = 1 } = this.props;

        return (<div className='subchart-container m-b' >
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <canvas
                        className='canvas-genelabel'
                        width={CHART_WIDTH}
                        height={80}
                        ref={(el) => { this['canvas-genelabel'] = el }} />
                    <div style={{ 'width': CHART_WIDTH }}
                        className='genome-window-wrapper'>
                        <div id="genome-window"
                            style={{ height: ((lineCount * TRACK_HEIGHT) + 5) + 'px' }}>
                        </div>
                    </div>
                    <canvas
                        style={{ 'background': 'white' }}
                        className='subchart-canvas m-b'
                        width={CHART_WIDTH}
                        height={(lineCount * TRACK_HEIGHT)}
                        ref={(el) => { this.canvas = el }} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={((lineCount + 1) * TRACK_HEIGHT)}
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

export default connect(null, mapDispatchToProps)(GeneList);
