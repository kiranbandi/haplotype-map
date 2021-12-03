import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    scaleLinear, interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma
} from 'd3';
import {
    drawLinesByColor, drawCNVMarkersByType, drawTracks,
    clearAndGetContext, drawLabels
} from '../utils/canvasUtilities';
import { LABEL_WIDTH, TRACK_HEIGHT, CHART_WIDTH } from '../utils/chartConstants';
import _ from 'lodash';
import { showTooltip } from '../redux/actions/actions';

// create custom color groups
const colorGroup = {
    'red': interpolateReds, 'green': interpolateGreens,
    'blue': interpolateBlues, 'orange': interpolateOranges,
    'viridis': interpolateViridis, 'inferno': interpolateInferno,
    'plasma': interpolatePlasma, 'magma': interpolateMagma,
    'blue and green': interpolateBuGn,
    'red and blue': interpolateRdBu, 'purple and orange': interpolatePuOr,
    'red,yellow and blue': interpolateRdYlBu, 'red, yellow and green': interpolateRdYlGn
};

class GeneExpressionMap extends Component {

    componentDidMount() { this.drawChart() }
    componentDidUpdate() { this.drawChart() }

    onMouseMove = (event) => {

        let { showTooltip, regionStart, regionEnd, geneList, geneReferenceMap } = this.props;

        if ((regionEnd - regionStart) < 400) {

            const referenceList = window.referenceMap,
                referenceScale = window.referenceScale;

            var pageWidth = document.body.getBoundingClientRect().width,
                canvasRect = event.currentTarget.getBoundingClientRect();

            const xPosition = event.pageX - canvasRect.left;

            const referenceIndex = Math.floor(referenceScale.invert(xPosition)),
                dataPoint = geneList.slice(regionStart, regionEnd)[referenceIndex],
                gene = _.find(geneReferenceMap, (d) => d.geneID == dataPoint);
            // chromosome: "Lcu.2RBY.Chr1"
            // end: "2747941"
            // geneID: "Lcu.2RBY.1g002080"
            // name: "Lcu.2RBY.1g002080"
            // note: "(Uncharacterized protein {ECO:0000313|EMBL:KEH18430.1, ECO:0000313|EnsemblPlants:KEH18430})"
            // reversed: false
            // start: "2745007"

            showTooltip(true, {
                'x': event.pageX + 200 > pageWidth ? event.pageX - 200 : event.pageX + 25,
                'y': event.pageY - 50,
                'geneID': gene.geneID,
                'note': gene.note,
                'start-stop': gene.start + ' - ' + gene.end
            });
        }
    }

    onMouseLeave = (event) => { this.props.showTooltip(false) }


    drawChart = () => {
        const { data, geneList, regionStart, regionEnd, activeColorScale } = this.props;
        const lines = ['3339', 'Es', '72643'],
            DAPs = _.keys(data[lines[0]]).filter((d) => data[lines[0]][d].length != 0),
            lineCount = lines.length,
            geneCount = geneList.slice(regionStart, regionEnd).length;

        const chartScale = scaleLinear().domain([0, geneCount]).range([0, CHART_WIDTH]);
        let chartCanvas = clearAndGetContext(this.canvas),
            labelCanvas = clearAndGetContext(this['canvas-label']);

        // store in window
        window.referenceScale = chartScale;

        labelCanvas.textAlign = "left";
        labelCanvas.textBaseline = "alphabetic";
        labelCanvas.font = "bolder 14px Arial";
        labelCanvas.fillStyle = "white";

        let lineWidth = TRACK_HEIGHT - 2.5;

        // Repeat Map set for every DAP
        _.map(DAPs, (DAP, DAPIndex) => {
            // Repeat Map for Every Genotype;
            let verticalShifter = (lines.length * DAPIndex * TRACK_HEIGHT) + (TRACK_HEIGHT / 3);
            _.map(lines, (line, lineIndex) => {
                let yPosition = ((lineIndex) * TRACK_HEIGHT + (DAPIndex * TRACK_HEIGHT / 3)) + verticalShifter;

                // Draw line label on canvas
                labelCanvas.beginPath();
                labelCanvas.fillText(line, 10, yPosition - 2);
                labelCanvas.fillText('DAP-' + DAP, 10, yPosition + 12);

                const dataLines = data[line][DAP].slice(regionStart, regionEnd);

                _.map(dataLines, (d, lineIndex) => {
                    chartCanvas.beginPath();
                    chartCanvas.lineWidth = lineWidth;
                    chartCanvas.strokeStyle = colorGroup[activeColorScale](d);
                    chartCanvas.moveTo(Math.round(chartScale(lineIndex)), yPosition);
                    chartCanvas.lineTo(Math.round(chartScale(lineIndex + 1)), yPosition);
                    chartCanvas.stroke();
                });
            });
        });
    }

    render() {

        const { data, title = '' } = this.props;
        const lines = _.keys(data), DAP = ['13', '17', '21', '28'], lineCount = lines.length;

        return (<div className='subchart-container m-b' >
            <h4 className='chart-title'>{title}</h4>
            <div className='subchart-outer-wrapper'>
                <div className='subchart-inner-wrapper' style={{ 'width': CHART_WIDTH }}>
                    <canvas
                        onMouseOver={this.onMouseMove}
                        onMouseMove={this.onMouseMove}
                        onMouseLeave={this.onMouseLeave}
                        className='subchart-canvas'
                        width={CHART_WIDTH}
                        height={485}
                        ref={(el) => { this.canvas = el }} />
                </div>
                <canvas className='subchart-canvas-label'
                    width={LABEL_WIDTH}
                    height={485}
                    ref={(el) => { this['canvas-label'] = el }} />
            </div>
        </div>);
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showTooltip: bindActionCreators(showTooltip, dispatch)
    };
}


export default connect(null, mapDispatchToProps)(GeneExpressionMap);
